const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadAd, getAllAds, deleteAd, toggleAd } = require("../controllers/ad.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { validateAdUpload } = require("../validators/ad.validator");

// Store file in memory before uploading to R2
const storage = multer.memoryStorage();
const upload = multer({ storage });

// All ad routes are admin protected via JWT
router.post("/", verifyToken, upload.single("file"), validateAdUpload, uploadAd);
router.get("/", verifyToken, getAllAds);
router.delete("/:id", verifyToken, deleteAd);
router.patch("/:id/toggle", verifyToken, toggleAd);

module.exports = router;
