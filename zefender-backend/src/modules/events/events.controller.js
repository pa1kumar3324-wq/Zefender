const Ad = require("../ads/ads.model");

// POST /api/events
const triggerEvent = async (req, res) => {
  try {
    const eventAd = await Ad.findOne({
      where: { is_event_ad: true, active: true },
      order: [["priority", "DESC"]],
    });

    if (!eventAd) {
      return res.status(404).json({ message: "No event ad configured" });
    }

    res.json({
      message: "Event triggered",
      ad: {
        id: eventAd.id,
        title: eventAd.title,
        file_url: eventAd.file_url,
        duration: eventAd.duration,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { triggerEvent };
