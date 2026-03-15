const express = require("express");
const router = express.Router();
const {
  createOrUpdatePlaylist,
  getPlaylistByDevice,
  setPriority,
  clearPriority,
} = require("../controllers/playlist.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { verifyDeviceToken } = require("../middleware/device.middleware");
const { validatePlaylistCreate, validatePriorityUpdate } = require("../validators/playlist.validator");

// Admin routes (JWT protected)
router.post("/", verifyToken, validatePlaylistCreate, createOrUpdatePlaylist);
router.put("/priority", verifyToken, validatePriorityUpdate, setPriority);
router.delete("/priority", verifyToken, clearPriority);

// Pi device route (device token protected)
// Pi calls this to get its playlist and compare with local version
router.get("/:device_id", verifyDeviceToken, getPlaylistByDevice);

module.exports = router;
