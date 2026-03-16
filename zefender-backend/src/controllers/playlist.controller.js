const Playlist = require("../models/playlist.model");
const PlaylistItem = require("../models/playlistItem.model");
const Ad = require("../models/ad.model");

// POST /api/playlists
// Admin creates or updates a playlist for a specific device
// Every update increments the version so Pi knows to sync
const createOrUpdatePlaylist = async (req, res) => {
  try {
    const { device_id, ads } = req.body;
    // ads = [{ ad_id, order_index, priority }]

    // Check if playlist already exists for this device
    let playlist = await Playlist.findOne({ where: { device_id } });

    if (playlist) {
      // Playlist exists → increment version and replace all items
      await playlist.update({ version: playlist.version + 1 });

      // Delete old playlist items
      await PlaylistItem.destroy({ where: { playlist_id: playlist.id } });
    } else {
      // No playlist yet → create fresh one starting at version 1
      playlist = await Playlist.create({ device_id, version: 1 });
    }

    // Create new playlist items
    const items = ads.map((item) => ({
      playlist_id: playlist.id,
      ad_id: item.ad_id,
      order_index: item.order_index,
      priority: item.priority || 0,
    }));

    await PlaylistItem.bulkCreate(items);

    res.status(201).json({
      message: "Playlist saved successfully",
      version: playlist.version,
      playlist_id: playlist.id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/playlists/:device_id
// Pi fetches its playlist to compare with local version
// Returns full playlist JSON with all ad details
const getPlaylistByDevice = async (req, res) => {
  try {
    const { device_id } = req.params;

    const playlist = await Playlist.findOne({ where: { device_id } });

    if (!playlist) {
      return res.status(404).json({ message: "No playlist found for this device" });
    }

    const items = await PlaylistItem.findAll({
      where: { playlist_id: playlist.id },
      include: [{ model: Ad }],
      order: [["order_index", "ASC"]],
    });

    // Return clean playlist JSON
    // Pi uses this to compare with its local playlist.json
    res.json({
      version: playlist.version,
      device_id: playlist.device_id,
      ads: items.map((item) => ({
        id: item.Ad.id,
        title: item.Ad.title,
        file_url: item.Ad.file_url,
        order_index: item.order_index,
        priority: item.priority,
        active: item.Ad.active,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/playlists/priority
// Admin sets priority order for post-transaction ads
// priority 1 plays first, 2 plays second, and so on
// Unselected ads stay at priority 0 (normal loop)
const setPriority = async (req, res) => {  // ← async is here!
  try {
    const { device_id, priority_ads } = req.body;

    const playlist = await Playlist.findOne({ where: { device_id } });
    if (!playlist) {
      return res.status(404).json({ message: "No playlist found for this device" });
    }

    for (const item of priority_ads) {
      await PlaylistItem.update(
        { priority: item.priority },
        {
          where: {
            playlist_id: playlist.id,
            ad_id: item.ad_id,
          },
        }
      );
    }

    await playlist.update({ version: playlist.version + 1 });

    res.json({ 
      message: "Priority updated successfully", 
      version: playlist.version 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// DELETE /api/playlists/priority
// Admin clears all priorities — all ads go back to normal loop (priority 0)
const clearPriority = async (req, res) => {
  try {
    const { device_id } = req.body;

    const playlist = await Playlist.findOne({ where: { device_id } });
    if (!playlist) {
      return res.status(404).json({ message: "No playlist found for this device" });
    }

    await PlaylistItem.update(
      { priority: 0 },
      { where: { playlist_id: playlist.id } }
    );

    // Increment version since playlist changed
    await playlist.update({ version: playlist.version + 1 });

    res.json({ message: "All priorities cleared successfully", version: playlist.version });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createOrUpdatePlaylist,
  getPlaylistByDevice,
  setPriority,
  clearPriority,
};
