module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Review", {
    rating: DataTypes.INTEGER,
    comment: DataTypes.STRING
  });
};