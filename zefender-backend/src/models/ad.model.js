const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

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
    type: DataTypes.STRING,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  uploaded_by: {
    // User ID of whoever uploaded this ad.
    // null = uploaded by superadmin (no user context)
    // uuid = uploaded by that specific admin
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
  },
});

module.exports = Ad;
