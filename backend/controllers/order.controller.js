const db = require("../models");

exports.createOrder = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { items, promotionCode } = req.body;
    let total = req.body.total;
    let discountAmount = 0;
    let finalTotal = total;
    let promotionId = null;

    // Apply promotion if provided
    if (promotionCode) {
      const promotion = await db.Promotion.findOne({
        where: { code: promotionCode.toUpperCase() }
      });

      if (!promotion) {
        await t.rollback();
        return res.status(404).json({ error: "Promotion code not found" });
      }

      const now = new Date();
      if (
        promotion.status !== "active" ||
        promotion.startDate > now ||
        promotion.endDate < now
      ) {
        await t.rollback();
        return res.status(400).json({ error: "Promotion code is no longer valid" });
      }

      if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
        await t.rollback();
        return res.status(400).json({ error: "Promotion code usage limit reached" });
      }

      if (total < promotion.minOrderAmount) {
        await t.rollback();
        return res.status(400).json({
          error: `Minimum order amount ${promotion.minOrderAmount} required`
        });
      }

      // Calculate discount
      if (promotion.discountType === "percentage") {
        discountAmount = (total * promotion.discountValue) / 100;
      } else {
        discountAmount = promotion.discountValue;
      }

      finalTotal = total - discountAmount;
      promotionId = promotion.id;

      // Increment used count
      await db.Promotion.update(
        { usedCount: promotion.usedCount + 1 },
        { where: { id: promotion.id }, transaction: t }
      );
    } else {
      finalTotal = total;
    }

    const order = await db.Order.create(
      {
        total,
        discountAmount,
        finalTotal,
        promotionCode,
        promotionId,
        userId: req.user.id,
        status: "pending"
      },
      { transaction: t }
    );

    await db.OrderItem.bulkCreate(
      items.map(item => ({
        ...item,
        orderId: order.id
      })),
      { transaction: t }
    );

    const invoice = await db.Invoice.create(
      {
        invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        orderId: order.id,
        userId: req.user.id,
        amount: total,
        discountAmount,
        finalAmount,
        status: "pending"
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ order, invoice });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Order.findAndCountAll({
      offset,
      limit,
      include: [
        {
          model: db.OrderItem,
          as: "items"
        },
        {
          model: db.User,
          as: "user",
          attributes: { exclude: ["password"] }
        },
        {
          model: db.Promotion,
          as: "Promotion"
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

exports.getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Order.findAndCountAll({
      where: { userId: req.user.id },
      offset,
      limit,
      include: [
        {
          model: db.OrderItem,
          as: "items"
        },
        {
          model: db.Promotion,
          as: "Promotion"
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

exports.getById = async (req, res) => {
  try {
    const order = await db.Order.findByPk(req.params.id, {
      include: [
        {
          model: db.OrderItem,
          as: "items"
        },
        {
          model: db.User,
          as: "user",
          attributes: { exclude: ["password"] }
        },
        {
          model: db.Promotion,
          as: "Promotion"
        }
      ]
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user owns this order or is admin
    if (req.user.role !== "admin" && order.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    // Only admin can update orders
    const [updated] = await db.Order.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = await db.Order.findByPk(req.params.id, {
      include: [
        {
          model: db.OrderItem,
          as: "items"
        },
        {
          model: db.User,
          as: "user",
          attributes: { exclude: ["password"] }
        },
        {
          model: db.Promotion,
          as: "Promotion"
        }
      ]
    });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await db.Order.destroy({
      where: { id: req.params.id }
    });
    if (deleted === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};