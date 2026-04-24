const express = require("express");
const router = express.Router();
const {
  login, register, getAdmins, deleteAdmin,
  assignDevices, getMyDevices,
} = require("../controllers/auth.controller");
const { verifyToken, requireSuperAdmin, requireAdmin } = require("../middleware/auth.middleware");
const { validateLogin, validateRegister } = require("../validators/auth.validator");

// Public
router.post("/login",    validateLogin,    login);
router.post("/register", validateRegister, register);

// Admin — get own assigned devices (needs valid admin JWT)
router.get("/me/devices", verifyToken, requireAdmin, getMyDevices);

// Superadmin only (needs valid superadmin JWT)
router.get("/admins",             verifyToken, requireSuperAdmin, getAdmins);
router.delete("/admins/:id",      verifyToken, requireSuperAdmin, deleteAdmin);
router.put("/admins/:id/devices", verifyToken, requireSuperAdmin, assignDevices);

module.exports = router;
