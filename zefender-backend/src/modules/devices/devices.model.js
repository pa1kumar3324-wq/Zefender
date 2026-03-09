const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Device = sequelize.define("Device", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  device_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  device_token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_seen: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Device;
