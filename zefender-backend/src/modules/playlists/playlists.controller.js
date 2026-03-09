const Playlist = require("./playlists.model");
const PlaylistItem = require("./playlist_items.model");
const Ad = require("../ads/ads.model");

// POST /api/playlists
const createPlaylist = async (req, res) => {
  try {
    const { ads } = req.body;
    // ads = [{ ad_id, order_index, priority }]

    if (!ads || ads.length === 0) {
      return res.status(400).json({ message: "No ads provided for playlist" });
    }

    const latest = await Playlist.findOne({ order: [["createdAt", "DESC"]] });
    const newVersion = latest ? latest.version + 1 : 1;

    const playlist = await Playlist.create({ version: newVersion });

    const items = ads.map((item) => ({
      playlist_id: playlist.id,
      ad_id: item.ad_id,
      order_index: item.order_index,
      priority: item.priority || 1,
    }));

    await PlaylistItem.bulkCreate(items);

    res.status(201).json({
      message: "Playlist created successfully",
      version: newVersion,
      playlist_id: playlist.id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/playlists
const getLatestPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ order: [["createdAt", "DESC"]] });

    if (!playlist) {
      return res.status(404).json({ message: "No playlist found" });
    }

    const items = await PlaylistItem.findAll({
      where: { playlist_id: playlist.id },
      include: [{ model: Ad }],
      order: [["order_index", "ASC"]],
    });

    res.json({ version: playlist.version, items });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createPlaylist, getLatestPlaylist };
