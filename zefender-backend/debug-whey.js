require("dotenv").config();
const { sequelize } = require("./src/config/db");

(async () => {
  try {
    await sequelize.authenticate();

    // All ads
    const [ads] = await sequelize.query(`SELECT id, title, file_url, active FROM "Ads" ORDER BY "createdAt"`);
    console.log("\n=== ALL ADS ===");
    ads.forEach(a => console.log(`[${a.active ? "ACTIVE  " : "INACTIVE"}] ${a.title} | ${a.file_url}`));

    // Playlist items for any device containing whey
    const [items] = await sequelize.query(`
      SELECT p.device_id, a.title, a.file_url, a.active, pi.order_index, pi.priority
      FROM "PlaylistItems" pi
      JOIN "Ads" a ON a.id = pi.ad_id
      JOIN "Playlists" p ON p.id = pi.playlist_id
      WHERE LOWER(a.title) LIKE '%whey%'
    `);
    console.log("\n=== WHEY IN PLAYLISTS ===");
    if (items.length === 0) console.log("Not in any playlist");
    else items.forEach(i => console.log(`device: ${i.device_id} | order: ${i.order_index} | priority: ${i.priority} | active: ${i.active}`));

  } catch (e) {
    console.error(e.message);
  }
  process.exit(0);
})();
