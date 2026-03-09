const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadAd, getAllAds, deleteAd, toggleAd } = require("./ads.controller");
const { verifyToken } = require("../../middleware/auth.middleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", verifyToken, upload.single("file"), uploadAd);
router.get("/", verifyToken, getAllAds);
router.delete("/:id", verifyToken, deleteAd);
router.patch("/:id/toggle", verifyToken, toggleAd);

module.exports = router;
