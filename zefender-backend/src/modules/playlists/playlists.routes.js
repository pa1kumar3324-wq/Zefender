const express = require("express");
const router = express.Router();
const { createPlaylist, getLatestPlaylist } = require("./playlists.controller");
const { verifyToken } = require("../../middleware/auth.middleware");

router.post("/", verifyToken, createPlaylist);
router.get("/", verifyToken, getLatestPlaylist);

module.exports = router;
