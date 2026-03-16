// Placeholder middleware for Pi device token verification
// Their existing system manages device registration and tokens
// Pi sends its token in x-device-token header with every request
// TODO: confirm how device tokens are structured with founders
const verifyDeviceToken = (req, res, next) => {
  const token = req.headers["x-device-token"];

  if (!token) {
    return res.status(401).json({ message: "No device token provided" });
  }

  // For now just check token exists and matches env placeholder
  // Will be replaced with actual device lookup once confirmed
  if (token !== process.env.DEVICE_SECRET) {
    return res.status(403).json({ message: "Invalid device token" });
  }

  next();
};

module.exports = { verifyDeviceToken };
