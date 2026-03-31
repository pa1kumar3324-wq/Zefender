const { registerDevice, getDevices } = require("../utils/deviceManager");
const Playlist = require("../models/playlist.model");

// POST /api/devices/register
const register = (req, res) => {
  try {
    const { id, name, port } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Device ID is required" });
    }

    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (ip === "::1") ip = "127.0.0.1";
    else if (ip && ip.startsWith("::ffff:")) ip = ip.substring(7);

    const device = {
      id,
      name: name || `Device-${id}`,
      ip,
      port: port || 8080,
    };

    registerDevice(device);
    console.log(`✅ Device registered: ${device.name} [${device.ip}:${device.port}]`);
    res.json({ message: "Device registered successfully", device });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/devices
// Returns registered devices merged with any device_ids that have playlists in DB
// This ensures the admin UI shows all devices even if not registered via Pi yet
const getAllDevices = async (req, res) => {
  try {
    const registered = getDevices(); // from devices.json

    // Also pull any device_ids that have playlists in the DB
    const playlists = await Playlist.findAll({ attributes: ["device_id"] });
    const playlistDeviceIds = playlists.map((p) => p.device_id);

    // Merge: start with registered devices, add playlist-only devices as stubs
    const merged = { ...registered };
    for (const deviceId of playlistDeviceIds) {
      if (!merged[deviceId]) {
        merged[deviceId] = {
          id: deviceId,
          name: deviceId, // use id as name if not registered
          ip: null,
          port: null,
          last_seen: null,
        };
      }
    }

    res.json(Object.values(merged));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, getAllDevices };
