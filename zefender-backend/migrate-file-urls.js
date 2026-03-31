// One-time migration: fix old file_url format from "ads/uuid.ext" to "/uploads/uuid.ext"
// Run with: node migrate-file-urls.js

require("dotenv").config();
const { sequelize } = require("./src/config/db");
const Ad = require("./src/models/ad.model");

(async () => {
  await sequelize.sync();
  const ads = await Ad.findAll();

  let fixed = 0;
  for (const ad of ads) {
    // Old format: "ads/uuid.ext" — missing leading slash and wrong folder name
    if (ad.file_url && !ad.file_url.startsWith("/uploads/")) {
      const filename = ad.file_url.split("/").pop();
      const newUrl = `/uploads/${filename}`;
      await ad.update({ file_url: newUrl });
      console.log(`Fixed: "${ad.title}" → ${newUrl}`);
      fixed++;
    }
  }

  console.log(`\nDone. Fixed ${fixed} of ${ads.length} ads.`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
