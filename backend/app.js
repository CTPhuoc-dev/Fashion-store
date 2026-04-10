const express = require("express");
const cors = require("cors");
const multer = require("multer");
const session = require("express-session");
const passport = require("passport");
const setupDatabase = require("./config/dbSetup");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ================= SESSION & PASSPORT =================
app.use(session({
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ================= PASSPORT CONFIG =================
require("./config/passport");

// ================= DATABASE SETUP =================
let db = null;
let isReady = false;

async function initializeDatabase() {
  try {
    // Setup database first
    await setupDatabase();
    
    // Then initialize models
    db = require("./models");
    await db.sequelize.sync();
    isReady = true;
    console.log("✓ Database synchronized");
  } catch (error) {
    console.error("Database initialization error:", error.message);
    isReady = false;
  }
}

// Initialize database on startup
initializeDatabase();

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

// ================= DATABASE READY CHECK =================
app.use((req, res, next) => {
  if (!isReady) {
    return res.status(503).json({ error: "Service initializing..." });
  }
  next();
});

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