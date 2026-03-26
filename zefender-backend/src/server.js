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

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/ads", adRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/devices", deviceRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Zefender Ad Server Running 🚀" });
});

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ PostgreSQL connected and models synced");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });
