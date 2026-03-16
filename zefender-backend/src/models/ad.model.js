const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Ad represents a single video/image file uploaded by admin
const Ad = sequelize.define("Ad", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_url: {
    // This stores the R2 key e.g. "ads/uuid.mp4"
    // NOT the full URL — we generate signed URLs on demand
    type: DataTypes.STRING,
    allowNull: false,
  },
  active: {
    // Admin can deactivate an ad without deleting it
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Ad;
