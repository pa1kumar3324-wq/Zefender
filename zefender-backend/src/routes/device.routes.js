const express = require("express");
const { register, getAllDevices } = require("../controllers/device.controller");

const router = express.Router();

// Register a Pi device
router.post("/register", register);

// Get all registered devices (for the Admin UI later)
router.get("/", getAllDevices);

module.exports = router;
