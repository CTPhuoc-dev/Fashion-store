const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// DB
const db = require("./models");
db.sequelize.sync();

// ================= UPLOAD =================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  res.json(req.file);
});

app.use("/uploads", express.static("uploads"));

// ================= ROUTES =================

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/invoices", require("./routes/invoice.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/promotions", require("./routes/promotion.routes"));
app.use("/api/product-discounts", require("./routes/productDiscount.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

// ================= SERVER =================

app.listen(process.env.PORT, () => {
  console.log("Server running at port " + process.env.PORT);
});