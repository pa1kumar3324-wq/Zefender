const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "zefender_jwt_secret";
const JWT_EXPIRES = "7d";

// ── Seed superadmin on server start ──────────────────────────────────────────
// Superadmin cannot be created via API — only seeded here.
// Credentials: superadmin@zefender.com / zefender@123
const seedSuperAdmin = async () => {
  try {
    const hash = await bcrypt.hash("Zefender@123", 12);
    const existing = await User.findOne({ where: { role: "superadmin" } });

    if (existing) {
      // Update password hash in case it was seeded with wrong password before
      await existing.update({ password_hash: hash });
      return;
    }

    await User.create({
      email: "superadmin@zefender.com",
      password_hash: hash,
      role: "superadmin",
    });
    console.log("✅ Superadmin seeded: superadmin@zefender.com");
  } catch (err) {
    console.error("❌ Superadmin seed failed:", err.message);
  }
};

// POST /api/auth/login
// Body: { email, password, role }
// role is used to route the user — backend verifies it matches DB record
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Role must match what the user selected in the dialog
    if (user.role !== role) {
      return res.status(403).json({ message: `This account is not a ${role}` });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      token,
      role: user.role,
      email: user.email,
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/register
// Superadmin only — creates a new admin account
// Body: { email, password }
// Admin password is always zefender@123 — enforced here
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password_hash: hash,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin account created successfully",
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/auth/admins
// Superadmin only — list all admin accounts
const getAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: "admin" },
      attributes: ["id", "email", "role", "allowed_devices", "createdAt"],
    });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/auth/admins/:id
// Superadmin only — remove an admin account
const deleteAdmin = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, role: "admin" } });
    if (!user) return res.status(404).json({ message: "Admin not found" });
    await user.destroy();
    res.json({ message: "Admin removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/auth/admins/:id/devices
// Superadmin assigns devices to a specific admin
const assignDevices = async (req, res) => {
  try {
    const { device_ids } = req.body; // array of device ID strings
    if (!Array.isArray(device_ids)) {
      return res.status(400).json({ message: "device_ids must be an array" });
    }
    const user = await User.findOne({ where: { id: req.params.id, role: "admin" } });
    if (!user) return res.status(404).json({ message: "Admin not found" });

    await user.update({ allowed_devices: device_ids });
    res.json({ message: "Devices assigned", allowed_devices: device_ids });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/auth/me/devices
// Admin fetches their own assigned devices (called after login to hydrate localStorage)
const getMyDevices = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ["allowed_devices"] });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ allowed_devices: user.allowed_devices || [] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { login, register, getAdmins, deleteAdmin, seedSuperAdmin, assignDevices, getMyDevices };
