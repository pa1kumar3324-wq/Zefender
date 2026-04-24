const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const { sequelize } = require("./config/db");

dotenv.config();

const adRoutes = require("./routes/ad.routes");
const playlistRoutes = require("./routes/playlist.routes");
const eventRoutes = require("./routes/event.routes");
const deviceRoutes = require("./routes/device.routes");
const authRoutes = require("./routes/auth.routes");
const { seedSuperAdmin } = require("./controllers/auth.controller");

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/devices", deviceRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Zefender Ad Server Running 🚀" });
});

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("✅ PostgreSQL connected and models synced");
    await seedSuperAdmin(); // create superadmin@zefender.com if not exists
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });
