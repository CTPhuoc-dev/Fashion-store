module.exports = (sequelize, DataTypes) => {
  return sequelize.define("ProductDiscount", {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    discountPercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    discountPrice: {
      type: DataTypes.FLOAT,
      defaultValue: null
    },
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active"
    }
  });
};
