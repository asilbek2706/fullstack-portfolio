const fs = require("fs/promises");
const imageKit = require("../services/imageKit");
const logger = require("../utils/logger");

const cleanupFailedUpload = (req, res, next) => {
  const uploadedFile = req.file;
  const uploadedFilePath = uploadedFile?.path;

  if (!uploadedFile) {
    return next();
  }

  res.once("finish", () => {
    if (res.statusCode < 400) return;

    const cleanup = async () => {
      if (uploadedFile.imageKitFileId && !uploadedFile.imageKitCleaned) {
        await imageKit.deleteImage(uploadedFile.imageKitFileId);
        uploadedFile.imageKitCleaned = true;
      }

      if (uploadedFilePath) {
        try {
          await fs.unlink(uploadedFilePath);
        } catch (error) {
          if (error.code !== "ENOENT") {
            throw error;
          }
        }
      }
    };

    cleanup().catch((error) => {
      logger.error(
        {
          err: error,
          uploadedFilePath,
          imageKitFileId: uploadedFile.imageKitFileId,
        },
        "Muvaffaqiyatsiz uploadni tozalashda xatolik.",
      );
    });
  });

  return next();
};

module.exports = cleanupFailedUpload;
