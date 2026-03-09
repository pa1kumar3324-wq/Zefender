const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Playlist = sequelize.define("Playlist", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Playlist;
