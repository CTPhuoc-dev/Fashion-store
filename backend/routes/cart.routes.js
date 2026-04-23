const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const cartCtrl = require("../controllers/cart.controller");

router.get("/", authMiddleware, cartCtrl.getCart);
router.post("/items", authMiddleware, cartCtrl.addItem);
router.put("/items/:itemId", authMiddleware, cartCtrl.updateItem);
router.delete("/items/:itemId", authMiddleware, cartCtrl.removeItem);
router.delete("/", authMiddleware, cartCtrl.clearCart);

module.exports = router;
