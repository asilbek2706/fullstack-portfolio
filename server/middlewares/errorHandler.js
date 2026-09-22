const logger = require("../utils/logger");

const getValidationMessage = (error) =>
  Object.values(error.errors || {})
    .map((item) => item.message)
    .filter(Boolean)
    .join(" ");

const getMulterErrorDetails = (error) => {
  const errors = {
    LIMIT_FILE_SIZE: {
      statusCode: 413,
      message: "Rasm hajmi belgilangan limitdan oshib ketdi.",
    },
    LIMIT_FILE_COUNT: {
      statusCode: 400,
      message: "Faqat bitta rasm yuklash mumkin.",
    },
    LIMIT_UNEXPECTED_FILE: {
      statusCode: 400,
      message: "Rasm maydoni noto'g'ri.",
    },
    LIMIT_FIELD_COUNT: {
      statusCode: 413,
      message: "Maydonlar soni belgilangan limitdan oshdi.",
    },
    LIMIT_FIELD_VALUE: {
      statusCode: 413,
      message: "Maydon hajmi belgilangan limitdan oshdi.",
    },
    LIMIT_FIELD_KEY: {
      statusCode: 413,
      message: "Maydon nomi belgilangan limitdan oshdi.",
    },
    LIMIT_PART_COUNT: {
      statusCode: 413,
      message: "So'rov qismlari soni belgilangan limitdan oshdi.",
    },
  };

  return (
    errors[error.code] || {
      statusCode: 400,
      message: "Fayl yuklashda xatolik yuz berdi.",
    }
  );
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = 500;
  let message = "Serverda ichki xatolik yuz berdi.";

  if (error.code === "CORS_ORIGIN_DENIED") {
    statusCode = 403;
    message = "So'rov manbasi tasdiqlanmadi.";
  } else if (error.type === "entity.parse.failed") {
    statusCode = 400;
    message = "JSON ma'lumoti noto'g'ri formatda.";
  } else if (error.type === "entity.too.large") {
    statusCode = 413;
    message = "So'rov hajmi belgilangan limitdan oshib ketdi.";
  } else if (error.type === "parameters.too.many") {
    statusCode = 413;
    message = "So'rov parametrlari soni belgilangan limitdan oshdi.";
  } else if (
    error.type === "encoding.unsupported" ||
    error.type === "charset.unsupported"
  ) {
    statusCode = 415;
    message = "So'rov kodlash formati qo'llab-quvvatlanmaydi.";
  } else if (
    error.type === "request.aborted" ||
    error.type === "request.size.invalid"
  ) {
    statusCode = 400;
    message = "So'rov to'liq yoki to'g'ri yuborilmadi.";
  } else if (error.code === "UNSUPPORTED_IMAGE_TYPE") {
    statusCode = 415;
    message =
      "Faqat JPG, PNG yoki WEBP rasmlarini yuklash mumkin.";
  } else if (error.name === "MulterError") {
    const multerError = getMulterErrorDetails(error);
    statusCode = multerError.statusCode;
    message = multerError.message;
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
  } else {
    const httpStatus = error.statusCode || error.status;

    if (
      Number.isInteger(httpStatus) &&
      httpStatus >= 400 &&
      httpStatus < 600
    ) {
      statusCode = httpStatus;
      message =
        statusCode >= 500
          ? "Serverda ichki xatolik yuz berdi."
          : "So'rovni qayta ishlashda xatolik yuz berdi.";
    }
  }

  const logData = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    errorName: error.name,
    errorType: error.type,
    errorCode: error.code,
  };

  if (statusCode >= 500) {
    logger.error(
      { ...logData, err: error },
      "So'rovni bajarishda server xatoligi.",
    );
  } else {
    logger.warn(
      logData,
      "So'rov noto'g'ri ma'lumot sababli rad etildi.",
    );
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
