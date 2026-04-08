module.exports = (sequelize, DataTypes) => {
  return sequelize.define("OrderItem", {
    quantity: DataTypes.INTEGER,
    price: DataTypes.FLOAT
  });
};