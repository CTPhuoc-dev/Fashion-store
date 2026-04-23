const router = require("express").Router();
const ctrl = require("../controllers/category.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", auth, ctrl.create);
router.put("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.delete);

module.exports = router;
