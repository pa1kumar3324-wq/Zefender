require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: "postgres", logging: false,
});

s.query(`SELECT id, title, file_url, active FROM "Ads" WHERE LOWER(title) LIKE '%whey%'`, { type: "SELECT" })
  .then(rows => {
    if (rows.length === 0) { console.log("No ad found with 'whey' in title"); process.exit(0); }
    rows.forEach(r => {
      const filePath = path.join(__dirname, "uploads", path.basename(r.file_url));
      const exists = fs.existsSync(filePath);
      console.log("title    :", r.title);
      console.log("file_url :", r.file_url);
      console.log("active   :", r.active);
      console.log("file on disk:", exists ? "YES ✅" : "NO ❌ — file missing");
      console.log("expected path:", filePath);
    });
    process.exit(0);
  })
  .catch(e => { console.error(e.message); process.exit(1); });
