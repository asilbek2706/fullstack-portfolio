const test = require("node:test");
const assert = require("node:assert/strict");

const logger = require("../../utils/logger");
const errorHandler = require("../../middlewares/errorHandler");

const runHandler = (error, options = {}) => {
  const result = {
    statusCode: undefined,
    body: undefined,
    nextError: undefined,
    warning: undefined,
    serverError: undefined,
  };

  const req = {
    id: "request-123",
    method: "POST",
    originalUrl: "/api/test",
  };

  const res = {
    headersSent: options.headersSent || false,
    status(statusCode) {
      result.statusCode = statusCode;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };

  const next = (nextError) => {
    result.nextError = nextError;
  };

  const originalWarn = logger.warn;
  const originalError = logger.error;

  logger.warn = (data, message) => {
    result.warning = { data, message };
  };

  logger.error = (data, message) => {
    result.serverError = { data, message };
  };

  try {
    errorHandler(error, req, res, next);
  } finally {
    logger.warn = originalWarn;
    logger.error = originalError;
  }

  return result;
};

test("Error handler forwards error when headers were already sent", () => {
  const error = new Error("response already started");
  const result = runHandler(error, { headersSent: true });

  assert.equal(result.nextError, error);
  assert.equal(result.statusCode, undefined);
  assert.equal(result.body, undefined);
});

const errorCases = [
  {
    name: "denied CORS origin",
    error: { code: "CORS_ORIGIN_DENIED" },
    statusCode: 403,
    message: "So'rov manbasi tasdiqlanmadi.",
  },
  {
    name: "malformed JSON",
    error: { type: "entity.parse.failed" },
    statusCode: 400,
    message: "JSON ma'lumoti noto'g'ri formatda.",
  },
  {
    name: "oversized request",
    error: { type: "entity.too.large" },
    statusCode: 413,
    message: "So'rov hajmi belgilangan limitdan oshib ketdi.",
  },
  {
    name: "too many parameters",
    error: { type: "parameters.too.many" },
    statusCode: 413,
    message: "So'rov parametrlari soni belgilangan limitdan oshdi.",
  },
  {
    name: "unsupported encoding",
    error: { type: "encoding.unsupported" },
    statusCode: 415,
    message: "So'rov kodlash formati qo'llab-quvvatlanmaydi.",
  },
  {
    name: "unsupported charset",
    error: { type: "charset.unsupported" },
    statusCode: 415,
    message: "So'rov kodlash formati qo'llab-quvvatlanmaydi.",
  },
  {
    name: "aborted request",
    error: { type: "request.aborted" },
    statusCode: 400,
    message: "So'rov to'liq yoki to'g'ri yuborilmadi.",
  },
  {
    name: "invalid request size",
    error: { type: "request.size.invalid" },
    statusCode: 400,
    message: "So'rov to'liq yoki to'g'ri yuborilmadi.",
  },
  {
    name: "unsupported image type",
    error: { code: "UNSUPPORTED_IMAGE_TYPE" },
    statusCode: 415,
    message: "Faqat JPG, PNG yoki WEBP rasmlarini yuklash mumkin.",
  },
  {
    name: "Mongoose cast error",
    error: { name: "CastError" },
    statusCode: 400,
    message: "Yuborilgan identifikator formati noto'g'ri.",
  },
  {
    name: "duplicate database value",
    error: { code: 11000 },
    statusCode: 409,
    message: "Ushbu ma'lumot avval ro'yxatdan o'tgan.",
  },
];

for (const currentCase of errorCases) {
  test(`Error handler maps ${currentCase.name}`, () => {
    const result = runHandler(currentCase.error);

    assert.equal(result.statusCode, currentCase.statusCode);
    assert.deepEqual(result.body, {
      success: false,
      message: currentCase.message,
    });
    assert.ok(result.warning);
    assert.equal(result.serverError, undefined);
  });
}

const multerCases = [
  ["LIMIT_FILE_SIZE", 413, "Rasm hajmi belgilangan limitdan oshib ketdi."],
  ["LIMIT_FILE_COUNT", 400, "Faqat bitta rasm yuklash mumkin."],
  ["LIMIT_UNEXPECTED_FILE", 400, "Rasm maydoni noto'g'ri."],
  ["LIMIT_FIELD_COUNT", 413, "Maydonlar soni belgilangan limitdan oshdi."],
  ["LIMIT_FIELD_VALUE", 413, "Maydon hajmi belgilangan limitdan oshdi."],
  ["LIMIT_FIELD_KEY", 413, "Maydon nomi belgilangan limitdan oshdi."],
  ["LIMIT_PART_COUNT", 413, "So'rov qismlari soni belgilangan limitdan oshdi."],
  ["UNKNOWN_LIMIT", 400, "Fayl yuklashda xatolik yuz berdi."],
];

for (const [code, statusCode, message] of multerCases) {
  test(`Error handler maps Multer error ${code}`, () => {
    const result = runHandler({
      name: "MulterError",
      code,
    });

    assert.equal(result.statusCode, statusCode);
    assert.deepEqual(result.body, {
      success: false,
      message,
    });
  });
}

test("Error handler joins Mongoose validation messages", () => {
  const result = runHandler({
    name: "ValidationError",
    errors: {
      title: { message: "Sarlavha talab qilinadi." },
      description: { message: "Tavsif talab qilinadi." },
      ignored: {},
    },
  });

  assert.equal(result.statusCode, 400);
  assert.equal(
    result.body.message,
    "Sarlavha talab qilinadi. Tavsif talab qilinadi.",
  );
});

test("Error handler uses safe fallback for empty validation error", () => {
  const result = runHandler({
    name: "ValidationError",
    errors: {},
  });

  assert.equal(result.statusCode, 400);
  assert.equal(result.body.message, "Yuborilgan ma'lumotlar noto'g'ri.");
});

test("Error handler preserves safe client HTTP status", () => {
  const result = runHandler({
    name: "CustomError",
    statusCode: 422,
    message: "Sensitive internal message",
  });

  assert.equal(result.statusCode, 422);
  assert.equal(
    result.body.message,
    "So'rovni qayta ishlashda xatolik yuz berdi.",
  );
  assert.ok(result.warning);
});

test("Error handler hides server HTTP error details", () => {
  const error = Object.assign(new Error("Database credentials exposed"), {
    status: 503,
  });

  const result = runHandler(error);

  assert.equal(result.statusCode, 503);
  assert.deepEqual(result.body, {
    success: false,
    message: "Serverda ichki xatolik yuz berdi.",
  });
  assert.ok(result.serverError);
  assert.equal(result.warning, undefined);
  assert.equal(result.serverError.data.err, error);
});

test("Error handler defaults invalid status to safe 500 response", () => {
  const result = runHandler({
    name: "UnknownError",
    statusCode: 200,
  });

  assert.equal(result.statusCode, 500);
  assert.deepEqual(result.body, {
    success: false,
    message: "Serverda ichki xatolik yuz berdi.",
  });
  assert.ok(result.serverError);
});
