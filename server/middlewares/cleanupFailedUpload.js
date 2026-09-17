const fs = require("fs").promises;
const logger = require("../utils/logger");

const cleanupFailedUpload = (req, res, next) => {
  const uploadedFilePath = req.file?.path;

  if (!uploadedFilePath) {
    return next();
  }

  res.once("finish", () => {
    if (res.statusCode >= 400) {
      fs.unlink(uploadedFilePath).catch((error) => {
        if (error.code !== "ENOENT") {
          logger.error(
            { err: error, uploadedFilePath },
            "Muvaffaqiyatsiz upload faylini o'chirishda xatolik.",
          );
        }
      });
    }
  });

  return next();
};

module.exports = cleanupFailedUpload;
