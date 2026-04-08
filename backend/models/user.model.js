module.exports = (sequelize, DataTypes) => {
  return sequelize.define("User", {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      defaultValue: "user"
    }
  });
};