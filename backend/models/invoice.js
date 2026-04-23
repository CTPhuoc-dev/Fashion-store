module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Invoice", {
    invoiceNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    discountAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    finalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "cancelled"),
      defaultValue: "pending"
    },
    paymentMethod: DataTypes.STRING,
    paymentDetails: DataTypes.JSON,
    paidAt: DataTypes.DATE,
    dueDate: DataTypes.DATE,
    notes: DataTypes.TEXT
  });
};