module.exports = (sequelize, DataTypes) => {
  return sequelize.define("User", {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    googleId: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user"
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      defaultValue: null
    }
  });
};