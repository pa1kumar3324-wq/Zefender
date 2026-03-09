const express = require("express");
const router = express.Router();
const { registerDevice, checkVersion, getPlaylist, getAllDevices } = require("./devices.controller");
const { verifyDeviceToken } = require("../../middleware/device.middleware");
const { verifyToken } = require("../../middleware/auth.middleware");

router.post("/register", registerDevice);
router.get("/version", verifyDeviceToken, checkVersion);
router.get("/playlist", verifyDeviceToken, getPlaylist);
router.get("/", verifyToken, getAllDevices);

module.exports = router;
