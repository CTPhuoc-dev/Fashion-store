const db = require("../models");

// Admin: Create product discount
exports.create = async (req, res) => {
  try {
    const { productId, discountPercentage, discountPrice, startDate, endDate } =
      req.body;

    // Check if product exists
    const product = await db.Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const discount = await db.ProductDiscount.create({
      productId,
      discountPercentage,
      discountPrice,
      startDate,
      endDate
    });

    res.status(201).json(discount);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all product discounts
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.ProductDiscount.findAndCountAll({
      offset,
      limit,
      include: [{ model: db.Product }],
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

// Get active discounts
exports.getActive = async (req, res) => {
  try {
    const now = new Date();

    const discounts = await db.ProductDiscount.findAll({
      where: {
        status: "active",
        startDate: { [db.sequelize.Op.lte]: now },
        endDate: { [db.sequelize.Op.gte]: now }
      },
      include: [{ model: db.Product }],
      order: [["createdAt", "DESC"]]
    });

    res.json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get discount by product
exports.getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const now = new Date();

    const discount = await db.ProductDiscount.findOne({
      where: {
        productId,
        status: "active",
        startDate: { [db.sequelize.Op.lte]: now },
        endDate: { [db.sequelize.Op.gte]: now }
      }
    });

    if (!discount) {
      return res.status(404).json({ error: "No active discount for this product" });
    }

    res.json(discount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Update product discount
exports.update = async (req, res) => {
  try {
    const [updated] = await db.ProductDiscount.update(req.body, {
      where: { id: req.params.id }
    });

    if (updated === 0) {
      return res.status(404).json({ error: "Discount not found" });
    }

    const discount = await db.ProductDiscount.findByPk(req.params.id);
    res.json(discount);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin: Delete product discount
exports.delete = async (req, res) => {
  try {
    const deleted = await db.ProductDiscount.destroy({
      where: { id: req.params.id }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: "Discount not found" });
    }

    res.json({ message: "Discount deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate discounted price
exports.calculatePrice = async (req, res) => {
  try {
    const { productId } = req.params;
    const now = new Date();

    const product = await db.Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const discount = await db.ProductDiscount.findOne({
      where: {
        productId,
        status: "active",
        startDate: { [db.sequelize.Op.lte]: now },
        endDate: { [db.sequelize.Op.gte]: now }
      }
    });

    if (!discount) {
      return res.json({
        product: product,
        originalPrice: product.price,
        discountedPrice: product.price,
        discountPercentage: 0
      });
    }

    let discountedPrice = product.price;
    let discountPercentage = discount.discountPercentage;

    if (discount.discountPercentage) {
      discountedPrice =
        product.price - (product.price * discount.discountPercentage) / 100;
    } else if (discount.discountPrice) {
      discountedPrice = discount.discountPrice;
      discountPercentage = (
        ((product.price - discount.discountPrice) / product.price) *
        100
      ).toFixed(2);
    }

    res.json({
      product: product,
      originalPrice: product.price,
      discountedPrice: parseFloat(discountedPrice.toFixed(2)),
      discountPercentage: parseFloat(discountPercentage)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
