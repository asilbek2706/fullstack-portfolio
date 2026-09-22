const Contact = require("../models/Contact");
const Admin = require("../models/Admin");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { emitRealtimeEvent } = require("../services/realtime");
const { env } = require("../config/env");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

const escapeTelegramHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const createTrackingToken = () => crypto.randomBytes(32).toString("base64url");

const hashTrackingToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const safeSecretEqual = (received, expected) => {
  if (typeof received !== "string" || typeof expected !== "string") {
    return false;
  }

  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
};

// 1. YANGI KONTAKT YARATISH (OMMAVIY)
exports.createContact = async (req, res, next) => {
  try {
    let { name, phone, message } = req.body;

    if (!name || !phone || !message) {
      return res
        .status(400)
        .json({ message: "Barcha maydonlarni to'ldiring!" });
    }

    // XSS va NoSQL inyeksiyalaridan tozalash (Sanitization)
    name = name
      .toString()
      .trim()
      .replace(/<\/?[^>]+(>|$)/g, "");
    message = message
      .toString()
      .trim()
      .replace(/<\/?[^>]+(>|$)/g, "");
    phone = phone.toString().trim().replace(/\s+/g, "");

    const trackingToken = createTrackingToken();
    const trackingTokenHash = hashTrackingToken(trackingToken);

    const newContact = new Contact({
      name,
      phone,
      message,
      trackingTokenHash,
    });

    await newContact.save();

    const safeName = escapeTelegramHtml(name);
    const safePhone = escapeTelegramHtml(phone);
    const safeMessage = escapeTelegramHtml(message);

    const telegramText =
      `📩 <b>Yangi Xabar Keldi!</b>\n\n` +
      `👤 <b>Ism:</b> ${safeName}\n` +
      `📞 <b>Tel:</b> ${safePhone}\n` +
      `📝 <b>Xabar:</b> ${safeMessage}\n\n` +
      `<i>💡 Javob berish uchun ushbu xabarga 'Reply' qiling!</i>`;

    try {
      const telegramResponse = await axios.post(
        `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`,
        {
          chat_id: env.telegramChatId,
          text: telegramText,
          parse_mode: "HTML",
        },
        {
          timeout: 10000,
        },
      );

      const telegramMessageId = telegramResponse.data?.result?.message_id;

      if (!Number.isInteger(telegramMessageId)) {
        throw new Error("Telegram message ID qaytarmadi.");
      }

      newContact.telegramMessageId = telegramMessageId;
      newContact.telegramDeliveryStatus = "sent";
      await newContact.save();

      return res.status(201).json({
        success: true,
        message: "Xabaringiz muvaffaqiyatli qabul qilindi.",
        data: {
          trackingToken,
          deliveryStatus: "sent",
        },
      });
    } catch (telegramError) {
      newContact.telegramDeliveryStatus = "failed";
      await newContact.save();

      logger.error(
        {
          contactId: newContact._id.toString(),
          errorCode: telegramError.code,
          telegramStatus: telegramError.response?.status,
        },
        "Contact saqlandi, lekin Telegram xabari yuborilmadi.",
      );

      return res.status(202).json({
        success: true,
        message:
          "Xabaringiz qabul qilindi, lekin bildirishnoma yuborilishi kechikmoqda.",
        data: {
          trackingToken,
          deliveryStatus: "failed",
        },
      });
    }
  } catch (error) {
    return next(error);
  }
};

// 2. BARCHA SAVOLLARNI OLISH (🔒 FAQAT ADMIN uchun - Cookie orqali tekshiriladi)
exports.getAllQuestionsAnswers = async (req, res, next) => {
  try {
    // protect middleware'dan o'tib kelgan admin ma'lumotlarini logda ko'rish (ixtiyoriy)
    const currentAdminId = req.admin?._id || req.user?._id;
    logger.debug(
      { adminId: currentAdminId?.toString() },
      "Admin contact ro'yxatini so'radi.",
    );

    const pagination = parsePagination(req.query, {
      defaultLimit: 20,
      maxLimit: 100,
    });

    const [contacts, total] = await Promise.all([
      Contact.find()
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Contact.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Murojaatlar muvaffaqiyatli yuklandi.",
      count: contacts.length,
      pagination: buildPaginationMeta({
        ...pagination,
        total,
      }),
      data: contacts,
    });
  } catch (error) {
    return next(error);
  }
};

// 5. BITTA SAVOL JAVOBINI ID BO'YICHA TEKSHIRISH (OMMAVIY)
exports.getContactAnswer = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return res.status(400).json({
        success: false,
        message: "Tracking token formati noto'g'ri.",
      });
    }

    const trackingTokenHash = hashTrackingToken(token);

    const contact = await Contact.findOne({
      trackingTokenHash,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Murojaat topilmadi.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        isAnswered: contact.isAnswered,
        answer: contact.answer || "",
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// 3. TELEGRAM WEBHOOK HANDLER
exports.handleTelegramWebhook = async (req, res) => {
  try {
    const telegramToken = req.headers["x-telegram-bot-api-secret-token"];

    if (!safeSecretEqual(telegramToken, env.webhookSecretToken)) {
      logger.warn({ ip: req.ip }, "Noto'g'ri Telegram webhook tokeni.");

      return res.status(403).json({
        success: false,
        message: "Ruxsat etilmagan so'rov.",
      });
    }

    const { message } = req.body || {};

    if (message?.reply_to_message && message?.text) {
      if (String(message.chat?.id) !== String(env.telegramChatId)) {
        logger.warn(
          {
            chatId: message.chat?.id,
            updateId: req.body?.update_id,
          },
          "Telegram webhook boshqa chatdan keldi.",
        );

        return res.status(200).send("OK");
      }

      const originalMessageId = message.reply_to_message.message_id;
      const answerText =
        typeof message.text === "string" ? message.text.trim() : "";

      const forbiddenControlCharacters =
        // eslint-disable-next-line no-control-regex
        /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

      if (
        !Number.isInteger(originalMessageId) ||
        originalMessageId < 1 ||
        !answerText ||
        answerText.length > 4096 ||
        forbiddenControlCharacters.test(answerText)
      ) {
        logger.warn(
          { updateId: req.body?.update_id },
          "Telegram webhook javobi validatsiyadan o'tmadi.",
        );

        return res.status(200).send("OK");
      }

      const contact = await Contact.findOne({
        telegramMessageId: originalMessageId,
      }).select("+telegramMessageId");

      if (contact) {
        contact.answer = answerText;
        contact.isAnswered = true;
        await contact.save();

        logger.info(
          { contactId: contact._id.toString() },
          "Contact savoliga Telegram orqali javob berildi.",
        );
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    logger.error({ err: error }, "Telegram webhook xatoligi.");
    return res.status(200).send("OK");
  }
};

// 4. BARCHA JAVOB BERILGAN SAVOLLARNI OLISH (OMMAVIY - F.A.Q uchun)
exports.getContactAnswers = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query, {
      defaultLimit: 20,
      maxLimit: 50,
    });

    const publicFilter = {
      isAnswered: true,
      isPublic: true,
    };

    const [answeredContacts, total] = await Promise.all([
      Contact.find(publicFilter)
        .select("name message answer updatedAt")
        .sort({ updatedAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Contact.countDocuments(publicFilter),
    ]);

    return res.status(200).json({
      success: true,
      count: answeredContacts.length,
      pagination: buildPaginationMeta({
        ...pagination,
        total,
      }),
      data: answeredContacts,
    });
  } catch (error) {
    return next(error);
  }
};

// Contact javobini public qilish yoki yashirish
exports.setContactPublication = async (req, res, next) => {
  try {
    const body =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? req.body
        : {};

    const fields = Object.keys(body);

    if (
      fields.length !== 1 ||
      fields[0] !== "isPublic" ||
      typeof body.isPublic !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Faqat isPublic boolean qiymatini yuboring.",
      });
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Murojaat topilmadi.",
      });
    }

    if (body.isPublic && !contact.isAnswered) {
      return res.status(409).json({
        success: false,
        message: "Javob berilmagan murojaatni public qilish mumkin emas.",
      });
    }

    contact.isPublic = body.isPublic;
    await contact.save();

    if (contact.isPublic) {
      emitRealtimeEvent("contactPublished", {
        _id: contact._id,
        name: contact.name,
        message: contact.message,
        answer: contact.answer,
        updatedAt: contact.updatedAt,
      });
    } else {
      emitRealtimeEvent("contactUnpublished", {
        _id: contact._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: body.isPublic
        ? "Murojaat javobi public qilindi."
        : "Murojaat javobi yashirildi.",
      data: {
        id: contact._id,
        isAnswered: contact.isAnswered,
        isPublic: contact.isPublic,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// 6. BITTA SAVOLNI ID BO'YICHA O'CHIRISH (🔒 Faqat Admin)
exports.deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Murojaat ID formati noto'g'ri.",
      });
    }

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        message: "Bunday IDga ega murojaat topilmadi!",
      });
    }

    res.status(200).json({
      success: true,
      message: `${deletedContact.name} ismli foydalanuvchining murojaati tizimdan o'chirildi. Tizim tozalandi! 🧹`,
      data: deletedContact,
    });
  } catch (error) {
    return next(error);
  }
};

// 7. BARCHA SAVOLLARNI O'CHIRISH (🔒 Faqat SuperAdmin)
exports.clearAllContacts = async (req, res, next) => {
  try {
    const { confirmation, password } = req.body || {};

    if (confirmation !== "DELETE_ALL_CONTACTS") {
      return res.status(400).json({
        success: false,
        message: "Tasdiqlash uchun DELETE_ALL_CONTACTS qiymatini yuboring.",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 1 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "Amaldagi admin parolini kiriting.",
      });
    }

    const admin = await Admin.findById(req.admin._id).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin hisobi topilmadi.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password);

    if (!passwordMatches) {
      return res.status(403).json({
        success: false,
        message: "Admin paroli noto'g'ri.",
      });
    }

    const result = await Contact.deleteMany({});

    return res.status(200).json({
      success: true,
      message: "Barcha murojaatlar o'chirildi.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return next(error);
  }
};
