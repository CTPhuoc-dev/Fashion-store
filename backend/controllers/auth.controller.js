const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);

  const user = await db.User.create({
    name: req.body.name,
    email: req.body.email,
    password: hash
  });

  res.json(user);
};

exports.login = async (req, res) => {
  const user = await db.User.findOne({ where: { email: req.body.email } });

  if (!user) return res.status(404).send("User not found");

  const valid = await bcrypt.compare(req.body.password, user.password);

  if (!valid) return res.status(401).send("Wrong password");

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

  res.json({ token });
};