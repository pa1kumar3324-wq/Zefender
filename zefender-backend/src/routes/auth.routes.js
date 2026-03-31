const express = require("express");
const router = express.Router();
const { loginAdmin } = require("../controllers/auth.controller");

// POST /api/auth/login — public, no token required
router.post("/login", loginAdmin);

module.exports = router;
