const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Playlist = require("./playlist.model");
const Ad = require("./ad.model");

// PlaylistItem is the bridge between Playlist and Ad
// One playlist has many items, each item points to one ad
// order_index → the sequence ads play in (1, 2, 3...)
// priority → 0 means normal ad, 1,2,3... means post-transaction priority order
const PlaylistItem = sequelize.define("PlaylistItem", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  playlist_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: Playlist, key: "id" },
  },
  ad_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: Ad, key: "id" },
  },
  order_index: {
    // Position in the normal ad loop (1, 2, 3...)
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priority: {
    // 0 = normal loop ad
    // 1 = plays first after transaction
    // 2 = plays second after transaction
    // 3 = plays third after transaction, and so on...
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

// Associations
Playlist.hasMany(PlaylistItem, { foreignKey: "playlist_id", onDelete: "CASCADE" });
PlaylistItem.belongsTo(Playlist, { foreignKey: "playlist_id" });
PlaylistItem.belongsTo(Ad, { foreignKey: "ad_id" });
Ad.hasMany(PlaylistItem, { foreignKey: "ad_id" });

module.exports = PlaylistItem;
