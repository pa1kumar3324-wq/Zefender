const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Temporary local storage instead of R2
// Replace with R2 when credentials are available

const uploadToR2 = async (file) => {
  const ext = path.extname(file.originalname);
  const key = `ads/${uuidv4()}${ext}`;

  // Save locally to uploads folder
  const uploadDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.writeFileSync(path.join(uploadDir, path.basename(key)), file.buffer);
  return key;
};

const deleteFromR2 = async (key) => {
  const filePath = path.join(__dirname, "../../uploads", path.basename(key));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const getSignedUrl = async (key) => {
  return `http://localhost:5000/uploads/${path.basename(key)}`;
};

module.exports = { uploadToR2, deleteFromR2, getSignedUrl };