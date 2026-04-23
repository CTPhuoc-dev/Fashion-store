const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Product management
const productCtrl = require("../controllers/product.controller");
router.post(
  "/products",
  authMiddleware,
  roleMiddleware(["admin"]),
  productCtrl.create
);
router.put(
  "/products/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  productCtrl.update
);
router.delete(
  "/products/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  productCtrl.delete
);

// Category management
const categoryCtrl = require("../controllers/category.controller");
router.post(
  "/categories",
  authMiddleware,
  roleMiddleware(["admin"]),
  categoryCtrl.create
);
router.put(
  "/categories/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  categoryCtrl.update
);
router.delete(
  "/categories/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  categoryCtrl.delete
);

// Order management
const orderCtrl = require("../controllers/order.controller");
router.get(
  "/orders",
  authMiddleware,
  roleMiddleware(["admin"]),
  orderCtrl.getAll
);
router.put(
  "/orders/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  orderCtrl.update
);
router.delete(
  "/orders/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  orderCtrl.delete
);

// User management
const userCtrl = require("../controllers/user.controller");
router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  userCtrl.getAll
);
router.get(
  "/users/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  userCtrl.getById
);
router.put(
  "/users/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  userCtrl.update
);
router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  userCtrl.delete
);
router.get(
  "/stats/overview",
  authMiddleware,
  roleMiddleware(["admin"]),
  userCtrl.getStats
);

// Promotion management
const promotionCtrl = require("../controllers/promotion.controller");
router.get(
  "/promotions",
  authMiddleware,
  roleMiddleware(["admin"]),
  promotionCtrl.getAll
);
router.post(
  "/promotions",
  authMiddleware,
  roleMiddleware(["admin"]),
  promotionCtrl.create
);
router.put(
  "/promotions/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  promotionCtrl.update
);
router.delete(
  "/promotions/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  promotionCtrl.delete
);

// Product Discount management
const discountCtrl = require("../controllers/productDiscount.controller");
router.get(
  "/product-discounts",
  authMiddleware,
  roleMiddleware(["admin"]),
  discountCtrl.getAll
);
router.post(
  "/product-discounts",
  authMiddleware,
  roleMiddleware(["admin"]),
  discountCtrl.create
);
router.put(
  "/product-discounts/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  discountCtrl.update
);
router.delete(
  "/product-discounts/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  discountCtrl.delete
);

module.exports = router;
