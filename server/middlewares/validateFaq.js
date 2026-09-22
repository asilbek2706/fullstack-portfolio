const allowedFields = new Set(["question", "answer", "order"]);

const textRules = {
  question: {
    min: 3,
    max: 300,
    label: "Savol",
  },
  answer: {
    min: 2,
    max: 3000,
    label: "Javob",
  },
};

const validateTextField = (body, field) => {
  if (!Object.hasOwn(body, field)) return null;

  if (typeof body[field] !== "string") {
    return `${field} matn ko'rinishida bo'lishi kerak.`;
  }

  const value = body[field].trim();

  if (!value) {
    return `${field} bo'sh bo'lishi mumkin emas.`;
  }

  const rule = textRules[field];

  if (value.length < rule.min || value.length > rule.max) {
    return (
      `${rule.label} uzunligi ${rule.min}–${rule.max} ` +
      "belgi oralig'ida bo'lishi kerak."
    );
  }

  body[field] = value;
  return null;
};

const validateFaq = (req, res, next) => {
  const body =
    req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? req.body
      : {};

  const unknownFields = Object.keys(body).filter(
    (field) => !allowedFields.has(field),
  );

  if (unknownFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Ruxsat etilmagan maydonlar: ${unknownFields.join(", ")}`,
    });
  }

  const isCreate = req.method === "POST";

  if (
    isCreate &&
    (!Object.hasOwn(body, "question") || !Object.hasOwn(body, "answer"))
  ) {
    return res.status(400).json({
      success: false,
      message: "Savol va javob matni majburiy.",
    });
  }

  if (!isCreate && Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Yangilash uchun kamida bitta maydon yuboring.",
    });
  }

  for (const field of ["question", "answer"]) {
    const errorMessage = validateTextField(body, field);

    if (errorMessage) {
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  if (Object.hasOwn(body, "order")) {
    if (
      typeof body.order !== "number" ||
      !Number.isInteger(body.order) ||
      body.order < 0 ||
      body.order > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "order 0 dan 10000 gacha bo'lgan butun son bo'lishi kerak.",
      });
    }
  }

  req.body = body;
  return next();
};

module.exports = validateFaq;
