const db = require("../models");

exports.createInvoice = async (req, res) => {
  try {
    const { orderId, notes, dueDate } = req.body;

    const order = await db.Order.findByPk(orderId, {
      include: [
        {
          model: db.OrderItem,
          as: "items"
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const invoice = await db.Invoice.create({
      invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      orderId: order.id,
      userId: order.userId,
      amount: order.total,
      discountAmount: order.discountAmount || 0,
      finalAmount: order.finalTotal || order.total,
      dueDate,
      notes
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await db.Invoice.findByPk(req.params.id, {
      include: [
        {
          model: db.Order,
          as: "order",
          include: [
            {
              model: db.OrderItem,
              as: "items"
            }
          ]
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (invoice.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Invoice.findAndCountAll({
      where: { userId: req.user.id },
      offset,
      limit,
      order: [["createdAt", "DESC"]]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Invoice.findAndCountAll({
      offset,
      limit,
      include: [
        {
          model: db.Order,
          as: "order"
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.payInvoice = async (req, res) => {
  try {
    const { paymentMethod, paymentDetails } = req.body;
    const invoice = await db.Invoice.findByPk(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (invoice.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ error: "Invoice already paid" });
    }

    invoice.status = "paid";
    invoice.paymentMethod = paymentMethod || invoice.paymentMethod;
    invoice.paymentDetails = paymentDetails || invoice.paymentDetails;
    invoice.paidAt = new Date();
    await invoice.save();

    await db.Order.update(
      { status: "confirmed" },
      { where: { id: invoice.orderId } }
    );

    res.json({ message: "Payment successful", invoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelInvoice = async (req, res) => {
  try {
    const invoice = await db.Invoice.findByPk(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (invoice.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    invoice.status = "cancelled";
    await invoice.save();

    await db.Order.update(
      { status: "cancelled" },
      { where: { id: invoice.orderId } }
    );

    res.json({ message: "Invoice cancelled" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};