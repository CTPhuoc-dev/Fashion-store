const db = require("../models");

exports.createOrder = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const order = await db.Order.create(
      { total: req.body.total },
      { transaction: t }
    );

    await db.OrderItem.bulkCreate(req.body.items, { transaction: t });

    await t.commit();
    res.json(order);
  } catch (err) {
    await t.rollback();
    res.status(500).send(err);
  }
};