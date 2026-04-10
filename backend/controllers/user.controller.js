const db = require("../models");

// Admin: Get all users
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.User.findAndCountAll({
      offset,
      limit,
      attributes: { exclude: ["password"] },
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

// Admin: Get user by ID
exports.getById = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Update user role or info
exports.update = async (req, res) => {
  try {
    const { role, name, email } = req.body;

    const [updated] = await db.User.update(
      { role, name, email },
      { where: { id: req.params.id } }
    );

    if (updated === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }
    });

    res.json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin: Delete user
exports.delete = async (req, res) => {
  try {
    // Prevent deletion of last admin
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    const deleted = await db.User.destroy({
      where: { id: req.params.id }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get user statistics
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await db.User.count();
    const adminCount = await db.User.count({ where: { role: "admin" } });
    const userCount = await db.User.count({ where: { role: "user" } });

    res.json({
      totalUsers,
      adminCount,
      userCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
