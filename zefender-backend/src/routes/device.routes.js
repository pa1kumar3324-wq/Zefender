const express = require("express");
const { register, getAllDevices } = require("../controllers/device.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// Register a Pi device (no auth — Pi calls this on boot)
router.post("/register", register);

// Get all registered devices — admin JWT protected
router.get("/", verifyToken, getAllDevices);

module.exports = router;
