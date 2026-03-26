const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Playlist represents a versioned collection of ads for a specific device
// Every time admin updates the playlist, version increments by 1
// Pi compares its local version with this to decide if it needs to sync
const Playlist = sequelize.define("Playlist", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  device_id: {
    // Which vending machine this playlist belongs to
    // This comes from their existing device management system
    type: DataTypes.STRING,
    allowNull: false,
  },
  version: {
    // Starts at 1, increments every time playlist is updated
    // Pi uses this to check if it needs to sync
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

module.exports = Playlist;
