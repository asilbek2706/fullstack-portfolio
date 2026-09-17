const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadPath = path.join(__dirname, "../uploads");

fs.mkdirSync(uploadPath, { recursive: true });

const extensionByMime = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const extension = extensionByMime[file.mimetype];

    if (!extension) {
      return cb(new Error("Ruxsat berilmagan rasm formati."));
    }

    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!extensionByMime[file.mimetype]) {
    return cb(
      new Error("Faqat JPG, PNG yoki WEBP rasmlarini yuklash mumkin."),
      false,
    );
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 10,
    parts: 11,
  },
});

module.exports = upload;
