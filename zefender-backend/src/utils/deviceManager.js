const fs = require('fs');
const path = require('path');

const devicesFilePath = path.join(__dirname, '../../devices.json');

const getDevices = () => {
  try {
    if (!fs.existsSync(devicesFilePath)) {
      return {};
    }
    const data = fs.readFileSync(devicesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading devices.json:', err);
    return {};
  }
};

const saveDevices = (devices) => {
  try {
    fs.writeFileSync(devicesFilePath, JSON.stringify(devices, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing devices.json:', err);
  }
};

const registerDevice = (device) => {
  const devices = getDevices();
  devices[device.id] = {
    ...device,
    last_seen: Math.floor(Date.now() / 1000)
  };
  saveDevices(devices);
};

module.exports = {
  getDevices,
  saveDevices,
  registerDevice
};
