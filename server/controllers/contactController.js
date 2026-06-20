const Contact = require("../models/Contact");
const axios = require("axios");

// 1. YANGI KONTAKT YARATISH (OMMAVIY)
exports.createContact = async (req, res) => {
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

    const newContact = new Contact({ name, phone, message });
    await newContact.save();

    const telegramText =
      `📩 <b>Yangi Xabar Keldi!</b>\n\n` +
      `👤 <b>Ism:</b> ${name}\n` +
      `📞 <b>Tel:</b> ${phone}\n` +
      `📝 <b>Xabar:</b> ${message}\n\n` +
      `<i>💡 Javob berish uchun ushbu xabarga 'Reply' qiling!</i>`;

    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: telegramText,
        parse_mode: "HTML",
      },
    );

    newContact.telegramMessageId = telegramResponse.data.result.message_id;
    await newContact.save();

    return res.status(201).json({
      message: "Xabaringiz muvaffaqiyatli yuborildi! ✨",
      data: newContact,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Xabar yuborishda xatolik yuz berdi.",
      error: error.message,
    });
  }
};

// 2. BARCHA SAVOLLARNI OLISH (🔒 FAQAT ADMIN uchun - Cookie orqali tekshiriladi)
exports.getAllQuestionsAnswers = async (req, res) => {
  try {
    // protect middleware'dan o'tib kelgan admin ma'lumotlarini logda ko'rish (ixtiyoriy)
    const currentAdminId = req.admin?._id || req.user?._id;
    console.log(`🤖 Kuki orqali kelgan Admin ID: ${currentAdminId}`);

    const QAs = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Savol-javoblar muvaffaqiyatli yuklandi! 📚",
      data: QAs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Ma'lumotlarni yuklashda xatolik yuz berdi.",
      error: error.message,
    });
  }
};

// 3. TELEGRAM WEBHOOK HANDLER
exports.handleTelegramWebhook = async (req, res) => {
  try {
    const telegramToken = req.headers["x-telegram-bot-api-secret-token"];

    if (!telegramToken || telegramToken !== process.env.WEBHOOK_SECRET_TOKEN) {
      console.log("⚠️ Diqqat! Tizimga begona soxta webhook so'rovi aniqlandi!");
      return res.status(403).json({ message: "Ruxsat etilmagan so'rov!" });
    }

    const { message } = req.body;

    if (message && message.reply_to_message && message.text) {
      const originalMessageId = message.reply_to_message.message_id;
      const answerText = message.text;

      const contact = await Contact.findOne({
        telegramMessageId: originalMessageId,
      });

      if (contact) {
        contact.answer = answerText;
        contact.isAnswered = true;
        await contact.save();

        if (global.io) {
          global.io.emit("new-answer", {
            _id: contact._id,
            answer: contact.answer,
            isAnswered: true,
          });
        }
        console.log(`✅ Savolga javob berildi: ${answerText}`);
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Telegram webhook xatoligi:", error.message);
    return res.status(200).send("OK");
  }
};

// 4. BARCHA JAVOB BERILGAN SAVOLLARNI OLISH (OMMAVIY - F.A.Q uchun)
exports.getContactAnswers = async (req, res) => {
  try {
    const answeredContacts = await Contact.find({ isAnswered: true })
      .select("name message answer updatedAt")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: answeredContacts.length,
      data: answeredContacts,
    });
  } catch (error) {
    console.error("getAllAnswers error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server xatoligi." });
  }
};

// 5. BITTA SAVOL JAVOBINI ID BO'YICHA TEKSHIRISH (OMMAVIY)
exports.getContactAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Bunday IDga ega savol topilmadi!",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: contact._id,
        name: contact.name,
        isAnswered: contact.isAnswered,
        answer: contact.answer || "",
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Yuborilgan ID formati noto'g'ri!" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Serverda xatolik yuz berdi." });
  }
};
