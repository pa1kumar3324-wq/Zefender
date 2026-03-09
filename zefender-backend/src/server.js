const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize } = require("./config/db");

dotenv.config();

const authRoutes = require("./modules/auth/auth.routes");
const adRoutes = require("./modules/ads/ads.routes");
const deviceRoutes = require("./modules/devices/devices.routes");
const playlistRoutes = require("./modules/playlists/playlists.routes");
const eventRoutes = require("./modules/events/events.routes");
const mediaRoutes = require("./modules/media/media.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/events", eventRoutes);
app.use("/media", mediaRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Zefender Backend Running" });
});

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("PostgreSQL connected and models synced");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });
