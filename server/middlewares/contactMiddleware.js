const axios = require("axios");

const validateContactAndRecaptcha = async (req, res, next) => {
  try {
    let { name, phone, message, recaptchaToken } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({
        message: "Hamma maydonlarni to'ldirish kerak (name, phone, message)",
      });
    }

    // Inputlarni tozalash (XSS va inyeksiyalardan himoya)
    name = name
      .toString()
      .trim()
      .replace(/<\/?[^>]+(>|$)/g, "");
    message = message
      .toString()
      .trim()
      .replace(/<\/?[^>]+(>|$)/g, "");
    phone = phone.toString().trim().replace(/\s+/g, "");

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

    if (!recaptchaToken) {
      return res.status(400).json({
        message: "Xavfsizlik tokeni (recaptchaToken) mavjud emas!",
      });
    }

    try {
      const googleResponse = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        {},
        { timeout: 5000 },
      );

      if (!googleResponse.data.success || googleResponse.data.score < 0.5) {
        return res.status(400).json({
          message:
            "Xavfsizlik tekshiruvidan o'ta olmadingiz! Tizim sizni bot deb gumon qildi.",
        });
      }
    } catch (recaptchaError) {
      console.error("reCAPTCHA API ulanish xatosi:", recaptchaError.message);
      return res.status(503).json({
        message:
          "Xavfsizlik xizmati vaqtincha ishlamayapti, iltimos qayta urining.",
      });
    }

    // Tozalangan ma'lumotlarni req.body'ga qayta yuklash
    req.body.name = name;
    req.body.phone = phone;
    req.body.message = message;

    return next();
  } catch (error) {
    return res.status(500).json({
      message:
        "Serverda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
      error: error.message,
    });
  }
};

module.exports = { validateContactAndRecaptcha };
