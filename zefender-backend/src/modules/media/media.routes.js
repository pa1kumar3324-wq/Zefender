const express = require("express");
const router = express.Router();
const { getSignedUrl } = require("../../config/r2");
const { verifyDeviceToken } = require("../../middleware/device.middleware");

// GET /media/file?key=ads/filename.mp4
router.get("/file", verifyDeviceToken, async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ message: "File key is required" });
    }

    const signedUrl = await getSignedUrl(key);
    res.json({ url: signedUrl });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
