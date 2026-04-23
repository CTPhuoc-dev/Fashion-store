const router = require("express").Router();
const ctrl = require("../controllers/promotion.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Public routes
router.get("/active", ctrl.getActive);
router.get("/code/:code", ctrl.getByCode);
router.post("/calculate", ctrl.calculateDiscount);

// Admin routes
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  ctrl.getAll
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  ctrl.create
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  ctrl.update
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  ctrl.delete
);

module.exports = router;
