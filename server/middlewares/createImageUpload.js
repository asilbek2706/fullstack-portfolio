const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const extensionByMime = Object.freeze({
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
});

const uploadLimits = Object.freeze({
  fileSize: 5 * 1024 * 1024,
  files: 1,
  fields: 10,
  parts: 11,
});

const createUnsupportedImageError = () => {
  const error = new Error(
    "Faqat JPG, PNG yoki WEBP rasmlarini yuklash mumkin.",
  );

  error.code = "UNSUPPORTED_IMAGE_TYPE";
  return error;
};

const createImageUpload = (uploadPath) => {
  if (
    typeof uploadPath !== "string" ||
    !path.isAbsolute(uploadPath)
  ) {
    throw new TypeError(
      "Upload destination mutlaq path bo'lishi kerak.",
    );
  }

  fs.mkdirSync(uploadPath, {
    recursive: true,
  });

  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, uploadPath);
    },

    filename: (req, file, callback) => {
      const extension =
        extensionByMime[file.mimetype];

      if (!extension) {
        return callback(
          createUnsupportedImageError(),
        );
      }

      return callback(
        null,
        `${crypto.randomUUID()}${extension}`,
      );
    },
  });

  const fileFilter = (req, file, callback) => {
    if (!extensionByMime[file.mimetype]) {
      return callback(
        createUnsupportedImageError(),
        false,
      );
    }

    return callback(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: uploadLimits,
  });
};

module.exports = {
  createImageUpload,
  extensionByMime,
  uploadLimits,
};
