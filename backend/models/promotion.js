module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Promotion", {
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: DataTypes.TEXT,
    discountType: {
      type: DataTypes.ENUM("percentage", "fixed"),
      defaultValue: "percentage"
    },
    discountValue: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    maxUses: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    minOrderAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active"
    }
  });
};
