const { registerDevice, getDevices } = require("../utils/deviceManager");

// POST /api/devices/register
const register = (req, res) => {
  try {
    const { id, name, port } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "Device ID is required" });
    }

    // Capture the IP from the request
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // Normalize localhost IPv6
    if (ip === '::1') {
      ip = '127.0.0.1';
    } else if (ip && ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }

    const device = {
      id,
      name: name || `Device-${id}`,
      ip,
      port: port || 8080
    };

    registerDevice(device);

    console.log(`✅ Device registered: ${device.name} [${device.ip}:${device.port}]`);

    res.json({ message: "Device registered successfully", device });
  } catch (error) {
    console.error("Error registering device:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/devices
const getAllDevices = (req, res) => {
  try {
    const devices = getDevices();
    // Convert object to array
    const devicesArray = Object.values(devices);
    res.json(devicesArray);
  } catch (error) {
    console.error("Error getting devices:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  getAllDevices
};
