const Ad = require("../models/ad.model");
const PlaylistItem = require("../models/playlistItem.model");
const Playlist = require("../models/playlist.model");
const User = require("../models/user.model");
const { uploadToR2, deleteFromR2 } = require("../config/r2");
const { Op } = require("sequelize");

// POST /api/ads
// Admin uploads a new ad video/image
const uploadAd = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to R2 and get back the key
    const file_url = await uploadToR2(req.file);

    const ad = await Ad.create({ title, file_url });

    res.status(201).json({
      message: "Ad uploaded successfully",
      ad,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/ads
// Superadmin → all ads
// Admin → only ads that appear in playlists for their assigned devices
const getAllAds = async (req, res) => {
  try {
    // If no user on request (auth disabled) or superadmin → return all
    if (!req.user || req.user.role === "superadmin") {
      const ads = await Ad.findAll();
      return res.json(ads);
    }

    // Admin — fetch their allowed_devices from DB
    const user = await User.findByPk(req.user.id, { attributes: ["allowed_devices"] });
    const allowedDevices = user?.allowed_devices || [];

    if (allowedDevices.length === 0) return res.json([]);

    // Find playlists for those devices
    const playlists = await Playlist.findAll({
      where: { device_id: { [Op.in]: allowedDevices } },
      attributes: ["id"],
    });
    const playlistIds = playlists.map(p => p.id);
    if (playlistIds.length === 0) return res.json([]);

    // Find unique ad IDs in those playlists
    const items = await PlaylistItem.findAll({
      where: { playlist_id: { [Op.in]: playlistIds } },
      attributes: ["ad_id"],
    });
    const adIds = [...new Set(items.map(i => i.ad_id))];
    if (adIds.length === 0) return res.json([]);

    const ads = await Ad.findAll({ where: { id: { [Op.in]: adIds } } });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/ads/:id
// Admin deletes an ad — removes from DB and R2
const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Remove from any playlists first to avoid FK constraint errors
    await PlaylistItem.destroy({ where: { ad_id: ad.id } });

    // Delete file then DB record
    await deleteFromR2(ad.file_url);
    await ad.destroy();

    res.json({ message: "Ad deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /api/ads/:id/toggle
// Admin activates or deactivates an ad without deleting it
const toggleAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    await ad.update({ active: !ad.active });

    res.json({
      message: `Ad ${ad.active ? "activated" : "deactivated"} successfully`,
      ad,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { uploadAd, getAllAds, deleteAd, toggleAd };
