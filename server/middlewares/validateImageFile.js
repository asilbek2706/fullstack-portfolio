const fs = require("fs").promises;

const matchesMimeSignature = (buffer, mimeType) => {
  if (mimeType === "image/jpeg") {
    return (
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === "image/png") {
    const pngSignature = Buffer.from([
      0x89, 0x50, 0x4e, 0x47,
      0x0d, 0x0a, 0x1a, 0x0a,
    ]);

    return buffer.subarray(0, 8).equals(pngSignature);
  }

  if (mimeType === "image/webp") {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
};

const validateImageFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  let fileHandle;

  try {
    fileHandle = await fs.open(req.file.path, "r");

    const header = Buffer.alloc(12);
    await fileHandle.read(header, 0, 12, 0);
    await fileHandle.close();
    fileHandle = null;

    if (!matchesMimeSignature(header, req.file.mimetype)) {
      await fs.unlink(req.file.path).catch(() => {});
      req.file = undefined;

      return res.status(400).json({
        success: false,
        message: "Yuklangan fayl haqiqiy JPG, PNG yoki WEBP rasm emas.",
      });
    }

    return next();
  } catch (error) {
    if (fileHandle) {
      await fileHandle.close().catch(() => {});
    }

    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return next(error);
  }
};

module.exports = validateImageFile;
