const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./user.model")(sequelize, Sequelize);
db.Role = require("./role")(sequelize, Sequelize);
db.Product = require("./product")(sequelize, Sequelize);
db.Category = require("./category")(sequelize, Sequelize);
db.Order = require("./order")(sequelize, Sequelize);
db.OrderItem = require("./orderItem")(sequelize, Sequelize);
db.Cart = require("./cart")(sequelize, Sequelize);
db.CartItem = require("./cartItem")(sequelize, Sequelize);
db.Review = require("./review")(sequelize, Sequelize);

// RELATION
db.Role.hasMany(db.User);
db.User.belongsTo(db.Role);

db.Category.hasMany(db.Product);
db.Product.belongsTo(db.Category);

db.User.hasMany(db.Order);
db.Order.belongsTo(db.User);

db.Order.hasMany(db.OrderItem);
db.OrderItem.belongsTo(db.Order);

db.Product.hasMany(db.OrderItem);
db.OrderItem.belongsTo(db.Product);

module.exports = db;