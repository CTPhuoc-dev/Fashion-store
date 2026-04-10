const router = require("express").Router();
const authCtrl = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.get("/profile", authMiddleware, authCtrl.getProfile);
router.put("/profile", authMiddleware, authCtrl.updateProfile);

module.exports = router;