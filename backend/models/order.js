module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Order", {
    total: DataTypes.FLOAT,
    discountAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    finalTotal: DataTypes.FLOAT,
    promotionCode: DataTypes.STRING,
    promotionId: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
      defaultValue: "pending"
    },
    notes: DataTypes.TEXT
  });
};