const db = require("../models");

// Admin: Create promotion
exports.create = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      maxUses,
      minOrderAmount
    } = req.body;

    // Validation
    if (!code || !discountValue) {
      return res
        .status(400)
        .json({ error: "Code and discount value are required" });
    }

    // Check if code already exists
    const existingPromo = await db.Promotion.findOne({ where: { code } });
    if (existingPromo) {
      return res.status(400).json({ error: "Promotion code already exists" });
    }

    const promotion = await db.Promotion.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      maxUses,
      minOrderAmount
    });

    res.status(201).json(promotion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all promotions with pagination
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Promotion.findAndCountAll({
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

// Get active promotions
exports.getActive = async (req, res) => {
  try {
    const now = new Date();

    const promotions = await db.Promotion.findAll({
      where: {
        status: "active",
        startDate: { [db.sequelize.Op.lte]: now },
        endDate: { [db.sequelize.Op.gte]: now }
      },
      order: [["createdAt", "DESC"]]
    });

    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get promotion by code
exports.getByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const promotion = await db.Promotion.findOne({
      where: { code: code.toUpperCase() }
    });

    if (!promotion) {
      return res.status(404).json({ error: "Promotion code not found" });
    }

    // Check if promotion is still valid
    const now = new Date();
    if (
      promotion.status !== "active" ||
      promotion.startDate > now ||
      promotion.endDate < now
    ) {
      return res.status(400).json({ error: "Promotion code is no longer valid" });
    }

    // Check if max uses exceeded
    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      return res.status(400).json({ error: "Promotion code usage limit reached" });
    }

    res.json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Update promotion
exports.update = async (req, res) => {
  try {
    const [updated] = await db.Promotion.update(req.body, {
      where: { id: req.params.id }
    });

    if (updated === 0) {
      return res.status(404).json({ error: "Promotion not found" });
    }

    const promotion = await db.Promotion.findByPk(req.params.id);
    res.json(promotion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin: Delete promotion
exports.delete = async (req, res) => {
  try {
    const deleted = await db.Promotion.destroy({
      where: { id: req.params.id }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: "Promotion not found" });
    }

    res.json({ message: "Promotion deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate discount amount
exports.calculateDiscount = async (req, res) => {
  try {
    const { code, amount } = req.body;

    const promotion = await db.Promotion.findOne({
      where: { code: code.toUpperCase() }
    });

    if (!promotion) {
      return res.status(404).json({ error: "Promotion code not found" });
    }

    const now = new Date();
    if (
      promotion.status !== "active" ||
      promotion.startDate > now ||
      promotion.endDate < now
    ) {
      return res.status(400).json({ error: "Promotion code is no longer valid" });
    }

    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      return res.status(400).json({ error: "Promotion code usage limit reached" });
    }

    if (amount < promotion.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order amount ${promotion.minOrderAmount} required`
      });
    }

    let discountAmount = 0;
    if (promotion.discountType === "percentage") {
      discountAmount = (amount * promotion.discountValue) / 100;
    } else {
      discountAmount = promotion.discountValue;
    }

    res.json({
      promotion: promotion,
      originalAmount: amount,
      discountAmount: discountAmount,
      finalAmount: amount - discountAmount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
