const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Temporary local storage instead of R2
// Replace with R2 when credentials are available

const uploadToR2 = async (file) => {
  const ext = path.extname(file.originalname);
  const filename = `${uuidv4()}${ext}`;

  // Save locally to uploads folder
  const uploadDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);

  // Return a URL-ready path so frontend can load it directly
  return `/uploads/${filename}`;
};

const deleteFromR2 = async (key) => {
  // key is now like /uploads/uuid.ext — extract just the filename
  const filename = path.basename(key);
  const filePath = path.join(__dirname, "../../uploads", filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const getSignedUrl = async (key) => {
  return key; // key is already a URL-ready path like /uploads/uuid.ext
};

module.exports = { uploadToR2, deleteFromR2, getSignedUrl };