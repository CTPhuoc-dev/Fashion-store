const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const invoiceCtrl = require("../controllers/invoice.controller");

router.post("/", authMiddleware, invoiceCtrl.createInvoice);
router.get("/me", authMiddleware, invoiceCtrl.getUserInvoices);
router.get("/:id", authMiddleware, invoiceCtrl.getInvoice);
router.post("/:id/pay", authMiddleware, invoiceCtrl.payInvoice);
router.post("/:id/cancel", authMiddleware, invoiceCtrl.cancelInvoice);

// Admin routes
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  invoiceCtrl.getAllInvoices
);

module.exports = router;