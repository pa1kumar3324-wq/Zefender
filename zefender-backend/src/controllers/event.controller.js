const Playlist = require("../models/playlist.model");
const PlaylistItem = require("../models/playlistItem.model");
const Ad = require("../models/ad.model");

// POST /api/events
// Called by their payment server when a transaction is successful
// Returns priority ads in order 1, 2, 3... for the Pi to play
// After playing all priority ads, Pi resumes normal loop
// Next transaction → priority cycle starts from 1 again
const triggerEvent = async (req, res) => {
  try {
    const { device_id } = req.body;

    if (!device_id) {
      return res.status(400).json({ message: "device_id is required" });
    }

    const playlist = await Playlist.findOne({ where: { device_id } });

    if (!playlist) {
      return res.status(404).json({ message: "No playlist found for this device" });
    }

    // Get all priority ads (priority > 0) sorted by priority order
    const priorityItems = await PlaylistItem.findAll({
      where: {
        playlist_id: playlist.id,
        priority: { [require("sequelize").Op.gt]: 0 }, // priority > 0
      },
      include: [{ model: Ad, where: { active: true } }],
      order: [["priority", "ASC"]], // 1, 2, 3...
    });

    if (priorityItems.length === 0) {
      return res.status(404).json({ message: "No priority ads configured for this device" });
    }

    res.json({
      message: "Event triggered successfully",
      priority_ads: priorityItems.map((item) => ({
        id: item.Ad.id,
        title: item.Ad.title,
        file_url: item.Ad.file_url,
        priority: item.priority,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { triggerEvent };
