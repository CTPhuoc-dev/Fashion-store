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
db.Promotion = require("./promotion")(sequelize, Sequelize);
db.ProductDiscount = require("./productDiscount")(sequelize, Sequelize);
db.Invoice = require("./invoice")(sequelize, Sequelize);

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

db.User.hasOne(db.Cart, { foreignKey: "userId", as: "cart" });
db.Cart.belongsTo(db.User, { foreignKey: "userId", as: "user" });

db.Cart.hasMany(db.CartItem, { foreignKey: "cartId", as: "items" });
db.CartItem.belongsTo(db.Cart, { foreignKey: "cartId", as: "cart" });

db.Product.hasMany(db.CartItem, { foreignKey: "productId", as: "cartItems" });
db.CartItem.belongsTo(db.Product, { foreignKey: "productId", as: "product" });

db.Promotion.hasMany(db.Order);
db.Order.belongsTo(db.Promotion);

db.Order.hasOne(db.Invoice, { foreignKey: "orderId", as: "invoice" });
db.Invoice.belongsTo(db.Order, { foreignKey: "orderId", as: "order" });

db.User.hasMany(db.Invoice, { foreignKey: "userId", as: "invoices" });
db.Invoice.belongsTo(db.User, { foreignKey: "userId", as: "user" });

module.exports = db;