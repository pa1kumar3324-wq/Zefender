const express = require("express");
const router = express.Router();
const { triggerEvent } = require("../controllers/event.controller");
const { verifyDeviceToken } = require("../middleware/device.middleware");

// Payment server hits this after successful transaction
// Protected by device token for now
// TODO: confirm with founders if payment server needs special API key instead
router.post("/", verifyDeviceToken, triggerEvent);

module.exports = router;
