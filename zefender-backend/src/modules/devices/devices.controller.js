const { v4: uuidv4 } = require("uuid");
const Device = require("./devices.model");
const Playlist = require("../playlists/playlists.model");
const PlaylistItem = require("../playlists/playlist_items.model");
const Ad = require("../ads/ads.model");

// POST /api/devices/register
const registerDevice = async (req, res) => {
  try {
    const { device_name, location } = req.body;

    const device_token = uuidv4();

    const device = await Device.create({
      device_name,
      location,
      device_token,
      last_seen: new Date(),
    });

    res.status(201).json({
      message: "Device registered successfully",
      device_token: device.device_token,
      device_id: device.id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/devices/version
const checkVersion = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ order: [["createdAt", "DESC"]] });

    if (!playlist) {
      return res.json({ version: 0 });
    }

    res.json({ version: playlist.version });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/devices/playlist
const getPlaylist = async (req, res) => {
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

    res.json({
      version: playlist.version,
      playlist: items.map((item) => ({
        order: item.order_index,
        priority: item.priority,
        ad: {
          id: item.Ad.id,
          title: item.Ad.title,
          file_url: item.Ad.file_url,
          duration: item.Ad.duration,
        },
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/devices - admin only
const getAllDevices = async (req, res) => {
  try {
    const devices = await Device.findAll();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { registerDevice, checkVersion, getPlaylist, getAllDevices };
