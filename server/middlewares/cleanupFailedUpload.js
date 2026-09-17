const fs = require("fs").promises;

const cleanupFailedUpload = (req, res, next) => {
  const uploadedFilePath = req.file?.path;

  if (!uploadedFilePath) {
    return next();
  }

  res.once("finish", () => {
    if (res.statusCode >= 400) {
      fs.unlink(uploadedFilePath).catch((error) => {
        if (error.code !== "ENOENT") {
          console.error(
            "Muvaffaqiyatsiz upload faylini o'chirishda xatolik:",
            error.message,
          );
        }
      });
    }
  });

  return next();
};

module.exports = cleanupFailedUpload;
