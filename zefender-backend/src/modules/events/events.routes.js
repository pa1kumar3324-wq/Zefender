const express = require("express");
const router = express.Router();
const { triggerEvent } = require("./events.controller");
const { verifyDeviceToken } = require("../../middleware/device.middleware");

router.post("/", verifyDeviceToken, triggerEvent);

module.exports = router;
