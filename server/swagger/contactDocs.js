module.exports = {
  schema: {
    type: "object",
    required: ["name", "phone", "message"],
    properties: {
      _id: { type: "string", example: "64a58d41d804b6f53d7de2c8" },
      name: { type: "string", example: "Eshmatov Toshmat" },
      phone: { type: "string", example: "+998901234567" },
      message: {
        type: "string",
        example: "Siz bilan hamkorlik qilmoqchimiz, narxlar qanday?",
      },
      isAnswered: { type: "boolean", default: false },
      answer: { type: "string", default: "" },
      telegramMessageId: { type: "integer", default: null, nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  paths: {
    "/api/contact": {
      post: {
        summary: "Sayt orqali yangi xabar/savol yuborish (reCAPTCHA v3 bilan)",
        tags: ["Contacts"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "phone", "message", "recaptchaToken"],
                properties: {
                  name: { type: "string", example: "Asilbek" },
                  phone: { type: "string", example: "+998935555555" },
                  message: {
                    type: "string",
                    example:
                      "Assalomu alaykum, backend xizmati bo'yicha yozayotgandim.",
                  },
                  recaptchaToken: {
                    type: "string",
                    example: "03AFcWeA7...v3_token",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description:
              "Muvaffaqiyatli saqlandi va Telegram guruhga yuborildi.",
          },
          400: {
            description:
              "reCAPTCHA tekshiruvidan o'tmadi yoki ma'lumotlar chala.",
          },
        },
      },
      get: {
        summary: "Kelgan barcha xabar va savollarni ko'rish (🔒 Faqat Admin)",
        tags: ["Contacts"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Barcha kelgan murojaatlar ro'yxati." },
        },
      },
    },
    "/api/contact/answer": {
      get: {
        summary:
          "Barcha javob berilgan savollarni ommaviy olish (Frontend F.A.Q uchun)",
        tags: ["Contacts"],
        responses: {
          200: { description: "Faqat javob berilgan savol-javoblar ro'yxati." },
        },
      },
    },
    "/api/contact/answer/{id}": {
      get: {
        summary: "Bitta maxsus savol-javobni ID bo'yicha tekshirish",
        tags: ["Contacts"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Murojaat tafsilotlari topildi." },
        },
      },
    },
    "/api/contact/telegram-webhook": {
      post: {
        summary: "Telegram Botdan guruhdagi javobni qabul qilish (Webhook)",
        tags: ["Contacts"],
        parameters: [
          {
            in: "header",
            name: "x-telegram-bot-api-secret-token",
            required: true,
            schema: { type: "string" },
            description: "Telegram xavfsizlik maxfiy tokeni",
          },
        ],
        responses: {
          200: { description: "Webhook muvaffaqiyatli qayta ishlandi (OK)." },
        },
      },
    },
    "/api/contact/{id}": {
      delete: {
        summary: "Kelgan murojaat/xabarni o'chirish (🔒 Faqat Admin)",
        tags: ["Contacts"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "O'chirilishi kerak bo'lgan xabar IDsi",
          },
        ],
        responses: {
          200: {
            description:
              "Murojaat muvaffaqiyatli o'chirildi (Tizim tozalandi).",
          },
          404: { description: "Bunday IDga ega xabar topilmadi." },
          401: { description: "Avtorizatsiyadan o'tilmagan / Token xato." },
        },
      },
    },
  },
};
