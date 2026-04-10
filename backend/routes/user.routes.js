const router = require("express").Router();
const userCtrl = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Admin only routes
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  userCtrl.getAll
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  userCtrl.getById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  userCtrl.update
);

router.delete(
  "/:id",
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

module.exports = router;
