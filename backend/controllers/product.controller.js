const db = require("../models");

exports.create = async (req, res) => {
  const product = await db.Product.create(req.body);
  res.json(product);
};

exports.getAll = async (req, res) => {
  const products = await db.Product.findAll();
  res.json(products);
};

exports.update = async (req, res) => {
  await db.Product.update(req.body, {
    where: { id: req.params.id }
  });
  res.send("Updated");
};

exports.delete = async (req, res) => {
  await db.Product.destroy({
    where: { id: req.params.id }
  });
  res.send("Deleted");
};