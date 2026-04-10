const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // If there is no admin yet, make the first registered user an admin
    const existingAdmin = await db.User.findOne({ where: { role: "admin" } });
    const userRole = existingAdmin ? "user" : "admin";

    // Create user
    const user = await db.User.create({
      name,
      email,
      password: hash,
      role: userRole
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return token and user info
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is already used by another user
    if (email) {
      const existingUser = await db.User.findOne({
        where: { email, id: { [db.sequelize.Op.ne]: req.user.id } }
      });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    const [updated] = await db.User.update(
      { name, email },
      { where: { id: req.user.id } }
    );

    if (updated === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });

    res.json({
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ================= FORGOT PASSWORD =================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token and expiry (30 minutes)
    const resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);

    await db.User.update(
      {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: resetPasswordExpires
      },
      { where: { id: user.id } }
    );

    // Create reset URL (frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "Password reset link has been sent to your email"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validation
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ error: "Token, password, and confirm password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Hash token to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await db.User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          [db.sequelize.Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await db.User.update(
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      },
      { where: { id: user.id } }
    );

    res.json({
      message: "Password has been reset successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GOOGLE OAUTH =================

exports.googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = req.user.toJSON();

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginWithGoogle = (req, res) => {
  // User is already authenticated by Passport
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = req.user.toJSON();

    res.json({
      message: "Google login successful",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};