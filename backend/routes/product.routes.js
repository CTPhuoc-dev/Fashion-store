const router = require("express").Router();
const ctrl = require("../controllers/product.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/", ctrl.create);
router.get("/", ctrl.getAll);
router.put("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.delete);

module.exports = router;