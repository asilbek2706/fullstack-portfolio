const axios = require("axios");
const logger = require("../utils/logger");
const { env } = require("../config/env");

const validateContactAndRecaptcha = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "So'rov body qismi obyekt bo'lishi kerak.",
      });
    }

    const allowedFields = new Set([
      "name",
      "phone",
      "message",
      "recaptchaToken",
    ]);

    const unknownFields = Object.keys(req.body).filter(
      (field) => !allowedFields.has(field),
    );

    if (unknownFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Ruxsat etilmagan maydonlar: ${unknownFields.join(", ")}`,
      });
    }

    let { name, phone, message, recaptchaToken } = req.body;

    const requiredTextFields = { name, phone, message };

    for (const [field, value] of Object.entries(requiredTextFields)) {
      if (typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: `${field} matn ko'rinishida bo'lishi kerak.`,
        });
      }
    }

    name = name.trim();
    message = message.trim();
    phone = phone.trim().replace(/\s+/g, "");

    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Barcha maydonlarni to'ldiring.",
      });
    }

    const forbiddenControlCharacters =
      // eslint-disable-next-line no-control-regex
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

    if (
      forbiddenControlCharacters.test(name) ||
      forbiddenControlCharacters.test(message)
    ) {
      return res.status(400).json({
        success: false,
        message: "Matnda ruxsat etilmagan boshqaruv belgisi mavjud.",
      });
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({
        message: "Ism uzunligi 2 va 50 simvol oralig'ida bo'lishi kerak!",
      });
    }

    if (message.length < 5 || message.length > 1000) {
      return res.status(400).json({
        message: "Xabar juda qisqa yoki juda uzun!",
      });
    }

    const uzbPhoneRegex = /^\+998\d{9}$/;
    if (!uzbPhoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Telefon raqami formati noto'g'ri! Misol: +998901234567",
      });
    }

    if (
      typeof recaptchaToken !== "string" ||
      recaptchaToken.length < 20 ||
      recaptchaToken.length > 4096
    ) {
      return res.status(400).json({
        success: false,
        message: "Xavfsizlik tokeni mavjud emas yoki noto'g'ri.",
      });
    }

    try {
      const verificationPayload = new URLSearchParams({
        secret: env.recaptchaSecretKey,
        response: recaptchaToken,
        remoteip: req.ip,
      });

      const googleResponse = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        verificationPayload,
        {
          timeout: 5000,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const verification = googleResponse.data;
      const isValid =
        verification?.success === true &&
        Number.isFinite(verification.score) &&
        verification.score >= env.recaptchaMinScore &&
        verification.action === env.recaptchaAction &&
        verification.hostname === env.recaptchaHostname;

      if (!isValid) {
        logger.warn(
          {
            success: verification?.success,
            score: verification?.score,
            action: verification?.action,
            hostname: verification?.hostname,
            errorCodes: verification?.["error-codes"],
          },
          "reCAPTCHA tekshiruvi rad etildi.",
        );

        return res.status(400).json({
          success: false,
          message: "Xavfsizlik tekshiruvidan o'tib bo'lmadi.",
        });
      }
    } catch (recaptchaError) {
      logger.error(
        {
          errorCode: recaptchaError.code,
          googleStatus: recaptchaError.response?.status,
        },
        "reCAPTCHA API ulanish xatosi.",
      );
      return res.status(503).json({
        message:
          "Xavfsizlik xizmati vaqtincha ishlamayapti, iltimos qayta urining.",
      });
    }

    // Tozalangan ma'lumotlarni req.body'ga qayta yuklash
    req.body = {
      name,
      phone,
      message,
      recaptchaToken,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { validateContactAndRecaptcha };
