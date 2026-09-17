const logger = require("../utils/logger");

const errorHandler = (error, req, res, next) => {
  logger.error(
    {
      err: error,
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
    },
    "So'rovni bajarishda xatolik yuz berdi.",
  );

  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "MulterError") {
    const messages = {
      LIMIT_FILE_SIZE: "Rasm hajmi belgilangan limitdan oshib ketdi.",
      LIMIT_FILE_COUNT: "Faqat bitta rasm yuklash mumkin.",
      LIMIT_UNEXPECTED_FILE: "Rasm maydoni noto'g'ri.",
      LIMIT_FIELD_COUNT: "Maydonlar soni belgilangan limitdan oshdi.",
      LIMIT_PART_COUNT: "So'rov qismlari soni belgilangan limitdan oshdi.",
    };

    return res.status(400).json({
      success: false,
      message: messages[error.code] || "Fayl yuklashda xatolik yuz berdi.",
    });
  }

  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode < 600
      ? error.statusCode
      : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Serverda ichki xatolik yuz berdi."
        : error.message,
  });
};

module.exports = errorHandler;
