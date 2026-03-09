const Ad = require("./ads.model");
const { uploadToR2, deleteFromR2 } = require("../../config/r2");

// POST /api/ads
const uploadAd = async (req, res) => {
  try {
    const { title, duration, priority, is_event_ad } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file_url = await uploadToR2(req.file);

    const ad = await Ad.create({
      title,
      file_url,
      duration: parseInt(duration),
      priority: parseInt(priority) || 1,
      is_event_ad: is_event_ad === "true",
    });

    res.status(201).json({ message: "Ad uploaded successfully", ad });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/ads
const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.findAll();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/ads/:id
const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    await deleteFromR2(ad.file_url);
    await ad.destroy();

    res.json({ message: "Ad deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /api/ads/:id/toggle
const toggleAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    await ad.update({ active: !ad.active });
    res.json({ message: `Ad ${ad.active ? "activated" : "deactivated"}`, ad });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { uploadAd, getAllAds, deleteAd, toggleAd };
