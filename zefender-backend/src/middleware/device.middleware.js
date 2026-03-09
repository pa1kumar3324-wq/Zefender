const Device = require("../modules/devices/devices.model");

const verifyDeviceToken = async (req, res, next) => {
  const token = req.headers["x-device-token"];

  if (!token) {
    return res.status(401).json({ message: "No device token provided" });
  }

  try {
    const device = await Device.findOne({ where: { device_token: token } });
    if (!device) {
      return res.status(403).json({ message: "Invalid device token" });
    }

    await device.update({ last_seen: new Date() });
    req.device = device;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { verifyDeviceToken };
