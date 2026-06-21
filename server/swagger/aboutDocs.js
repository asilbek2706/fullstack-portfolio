module.exports = {
  // 💾 1. SCHEMAS (Ma'lumotlar modellari strukturasi)
  schemas: {
    About: {
      type: "object",
      required: ["fullName", "title", "avatar", "bio", "experienceYears"],
      properties: {
        _id: { type: "string", example: "64a58d41d804b6f53d7de2c9" },
        fullName: { type: "string", example: "Asilbek Karomatov" },
        title: { type: "string", example: "Frontend Developer" },
        avatar: {
          type: "string",
          example:
            "https://res.cloudinary.com/demo/image/upload/v1/profile.png",
        },
        bio: {
          type: "string",
          example:
            "7+ oydan beri zamonaviy frontend texnologiyalari (React, JavaScript) va chiroyli interfeyslar qurish sirlarini mukammal o'rganib kelmoqdaman.",
        },
        experienceYears: { type: "string", example: "7+ oy" },
        updatedBy: {
          type: "string",
          description: "O'zgartirgan SuperAdmin IDsi",
          example: "64a58d41d804b6f53d7de2c7",
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    FAQ: {
      type: "object",
      required: ["question", "answer"],
      properties: {
        _id: { type: "string", example: "64a58d41d804b6f53d7de2fa" },
        question: {
          type: "string",
          example: "Masofadan (Remote) ishlaysizmi?",
        },
        answer: {
          type: "string",
          example: "Ha, qiziqarli loyihalar uchun doim ochiqman.",
        },
        order: { type: "integer", example: 1 },
        createdBy: { type: "string", example: "64a58d41d804b6f53d7de2c7" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  },

  // 🌐 2. PATHS (API Endpointlar)
  paths: {
    // ---------------- ABOUT SECTION ----------------
    "/api/about": {
      get: {
        summary: "Men haqimda ma'lumotlarini olish (Ommaviy)",
        tags: ["About"],
        responses: {
          200: {
            description: "Ma'lumotlar muvaffaqiyatli yuklandi.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/About" },
              },
            },
          },
        },
      },
      put: {
        summary:
          "Men haqimda ma'lumotlarini yangilash (🔒 Faqat SuperAdmin, Kuki orqali)",
        tags: ["About"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string", example: "Asilbek Karomatov" },
                  title: { type: "string", example: "Frontend Developer" },
                  avatar: {
                    type: "string",
                    example:
                      "https://res.cloudinary.com/demo/image/upload/v1/profile.png",
                  },
                  bio: {
                    type: "string",
                    example:
                      "7+ oydan beri intensiv frontend texnologiyalarini o'rganib kelyapman.",
                  },
                  experienceYears: { type: "string", example: "7+ oy" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Ma'lumotlar daxshatli xavfsiz holatda yangilandi.",
          },
          403: {
            description:
              "Siz SuperAdmin emassiz, buzib o'zgartirish taqiqlanadi!",
          },
          401: { description: "Avtorizatsiyadan o'tilmagan, kuki topilmadi." },
        },
      },
    },

    // ---------------- FAQ SECTION ----------------
    "/api/faq": {
      get: {
        summary: "Barcha FAQ savol-javoblarini olish (Ommaviy)",
        tags: ["About - FAQ"], // Swagger UI'da alohida blok bo'lib chiroyli ajralib turadi
        responses: {
          200: {
            description: "FAQ ro'yxati muvaffaqiyatli yuklandi.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/FAQ" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary:
          "Yangi FAQ savol-javob qo'shish (🔒 Faqat SuperAdmin, Kuki orqali)",
        tags: ["About - FAQ"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["question", "answer"],
                properties: {
                  question: {
                    type: "string",
                    example: "Siz bilan qanday bog'lansa bo'ladi?",
                  },
                  answer: {
                    type: "string",
                    example: "Telegram (@asilbek2706) orqali.",
                  },
                  order: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Yangi FAQ muvaffaqiyatli yaratildi." },
          403: {
            description:
              "Siz SuperAdmin emassiz, buzib o'zgartirish taqiqlanadi!",
          },
          401: { description: "Avtorizatsiyadan o'tilmagan, kuki topilmadi." },
        },
      },
    },
    "/api/faq/{id}": {
      put: {
        summary:
          "FAQ savol-javobini ID bo'yicha tahrirlash (🔒 Faqat SuperAdmin)",
        tags: ["About - FAQ"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Tahrirlanmoqchi bo'lgan FAQ hujjati IDsi",
            schema: { type: "string", example: "64a58d41d804b6f53d7de2fa" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  question: {
                    type: "string",
                    example: "Masofadan (Remote) ishlaysizmi? (Yangilandi)",
                  },
                  answer: {
                    type: "string",
                    example:
                      "Ha, dunyoning istalgan nuqtasidan remote ishlashga tayyorman.",
                  },
                  order: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "FAQ muvaffaqiyatli yangilandi." },
          404: { description: "FAQ topilmadi." },
        },
      },
      delete: {
        summary:
          "FAQ savol-javobini ID bo'yicha o'chirish (🔒 Faqat SuperAdmin)",
        tags: ["About - FAQ"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "O'chirilmoqchi bo'lgan FAQ hujjati IDsi",
            schema: { type: "string", example: "64a58d41d804b6f53d7de2fa" },
          },
        ],
        responses: {
          200: { description: "FAQ muvaffaqiyatli o'chirildi." },
          404: { description: "FAQ topilmadi." },
        },
      },
    },
  },
};
