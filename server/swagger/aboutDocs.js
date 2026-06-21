module.exports = {
  // 💾 1. SCHEMA (Faqat About model strukturasi, siz aytgan formatda)
  schema: {
    type: "object",
    required: ["fullName", "title", "avatar", "bio", "experienceYears"],
    properties: {
      _id: { type: "string", example: "64a58d41d804b6f53d7de2c9" },
      fullName: { type: "string", example: "Asilbek Karomatov" },
      title: { type: "string", example: "Frontend Developer" },
      avatar: {
        type: "string",
        example: "https://res.cloudinary.com/demo/image/upload/v1/profile.png",
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

  // 🌐 2. PATHS (Faqat About'ga tegishli API Endpointlar)
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
      }, // <- get metodi bu yerda xavfsiz yopildi
      put: {
        summary: "Men haqimda ma'lumotlarini yangilash (🔒 Faqat SuperAdmin, Kuki orqali)",
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
                    example: "https://res.cloudinary.com/demo/image/upload/v1/profile.png",
                  },
                  bio: {
                    type: "string",
                    example: "7+ oydan beri intensiv frontend texnologiyalarini o'rganib kelyapman.",
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
            description: "Siz SuperAdmin emassiz, buzib o'zgartirish taqiqlanadi!",
          },
          401: { description: "Avtorizatsiyadan o'tilmagan, kuki topilmadi." },
        },
      },
    },
  },
};