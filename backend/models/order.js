module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Order", {
    total: DataTypes.FLOAT
  });
};