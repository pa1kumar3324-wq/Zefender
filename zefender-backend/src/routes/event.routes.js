const express = require("express");
const router = express.Router();
const { triggerEvent } = require("../controllers/event.controller");
const { verifyDeviceToken } = require("../middleware/device.middleware");
const { verifyToken } = require("../middleware/auth.middleware");

// Called by Pi / payment server after successful transaction (device token auth)
router.post("/", verifyDeviceToken, triggerEvent);

// Called by Admin UI to simulate/trigger a payment event (admin JWT auth)
router.post("/admin", verifyToken, triggerEvent);

module.exports = router;
