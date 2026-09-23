const fs = require("fs/promises");
const imageKit = require("../services/imageKit");
const logger = require("../utils/logger");

const removeTemporaryFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      logger.warn(
        {
          err: error,
          filePath,
        },
        "Vaqtinchalik rasmni o'chirib bo'lmadi.",
      );
    }
  }
};

const createImageKitUpload = (folder, storage = imageKit) => {
  if (typeof folder !== "string" || !folder.trim()) {
    throw new TypeError("ImageKit papkasi ko'rsatilishi kerak.");
  }

  return async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    try {
      const uploaded = await storage.uploadImage({
        filePath: req.file.path,
        fileName: req.file.filename,
        folder,
      });

      req.file.imageKitUrl = uploaded.url;
      req.file.imageKitFileId = uploaded.fileId;

      await removeTemporaryFile(req.file.path);

      return next();
    } catch (error) {
      await removeTemporaryFile(req.file.path);
      return next(error);
    }
  };
};

module.exports = createImageKitUpload;
