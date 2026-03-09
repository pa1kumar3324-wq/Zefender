const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

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
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_event_ad: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Ad;
