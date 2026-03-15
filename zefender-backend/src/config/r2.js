const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl: awsGetSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
require("dotenv").config();

// R2 uses S3 compatible API
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

// Upload file buffer to R2, returns the unique key
const uploadToR2 = async (file) => {
  const ext = path.extname(file.originalname);
  const key = `ads/${uuidv4()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await r2Client.send(command);
  return key; // this key is stored in DB as file_url
};

// Delete file from R2 using its key
const deleteFromR2 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });
  await r2Client.send(command);
};

// Generate a signed URL so Pi can securely download the file
// URL expires in 1 hour
const getSignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });
  const url = await awsGetSignedUrl(r2Client, command, { expiresIn: 3600 });
  return url;
};

module.exports = { uploadToR2, deleteFromR2, getSignedUrl };
