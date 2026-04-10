const router = require("express").Router();
const ctrl = require("../controllers/order.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, ctrl.getAll);
router.get("/my-orders", auth, ctrl.getUserOrders);
router.get("/:id", auth, ctrl.getById);
router.post("/", auth, ctrl.createOrder);
router.put("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.delete);

module.exports = router;