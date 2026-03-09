const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");
const Playlist = require("./playlists.model");
const Ad = require("../ads/ads.model");

const PlaylistItem = sequelize.define("PlaylistItem", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  playlist_id: {
    type: DataTypes.UUID,
    references: { model: Playlist, key: "id" },
  },
  ad_id: {
    type: DataTypes.UUID,
    references: { model: Ad, key: "id" },
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
});

Playlist.hasMany(PlaylistItem, { foreignKey: "playlist_id" });
PlaylistItem.belongsTo(Playlist, { foreignKey: "playlist_id" });
PlaylistItem.belongsTo(Ad, { foreignKey: "ad_id" });
Ad.hasMany(PlaylistItem, { foreignKey: "ad_id" });

module.exports = PlaylistItem;
