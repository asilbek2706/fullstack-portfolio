const logger = require("../utils/logger");

const getValidationMessage = (error) =>
  Object.values(error.errors || {})
    .map((item) => item.message)
    .filter(Boolean)
    .join(" ");

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = 500;
  let message = "Serverda ichki xatolik yuz berdi.";

  if (error.name === "MulterError") {
    const multerMessages = {
      LIMIT_FILE_SIZE: "Rasm hajmi belgilangan limitdan oshib ketdi.",
      LIMIT_FILE_COUNT: "Faqat bitta rasm yuklash mumkin.",
      LIMIT_UNEXPECTED_FILE: "Rasm maydoni noto'g'ri.",
      LIMIT_FIELD_COUNT: "Maydonlar soni belgilangan limitdan oshdi.",
      LIMIT_PART_COUNT: "So'rov qismlari soni belgilangan limitdan oshdi.",
    };

    statusCode = 400;
    message =
      multerMessages[error.code] ||
      "Fayl yuklashda xatolik yuz berdi.";
  } else if (error.name === "ValidationError") {
    statusCode = 400;
    message =
      getValidationMessage(error) ||
      "Yuborilgan ma'lumotlar noto'g'ri.";
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "Yuborilgan identifikator formati noto'g'ri.";
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "Ushbu ma'lumot avval ro'yxatdan o'tgan.";
  } else if (
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode < 600
  ) {
    statusCode = error.statusCode;
    message =
      statusCode === 500
        ? "Serverda ichki xatolik yuz berdi."
        : error.message;
  }

  const logData = {
    err: error,
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode,
  };

  if (statusCode >= 500) {
    logger.error(logData, "So'rovni bajarishda server xatoligi.");
  } else {
    logger.warn(logData, "So'rov noto'g'ri ma'lumot sababli rad etildi.");
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
