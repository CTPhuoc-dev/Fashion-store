const router = require("express").Router();
const authCtrl = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const passport = require("passport");

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/forgot-password", authCtrl.forgotPassword);
router.post("/reset-password", authCtrl.resetPassword);
router.get("/profile", authMiddleware, authCtrl.getProfile);
router.put("/profile", authMiddleware, authCtrl.updateProfile);

// ================= GOOGLE OAUTH =================
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get("/google/callback", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  authCtrl.googleCallback
);

router.get("/google/token", authCtrl.loginWithGoogle);

module.exports = router;