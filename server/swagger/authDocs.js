module.exports = {
  // SCHEMA DEFINITION
  schema: {
    type: "object",
    required: ["username", "email", "password"],
    properties: {
      _id: { type: "string", example: "64a58d41d804b6f53d7de2c7" },
      username: { type: "string", example: "asilbek_admin" },
      email: { type: "string", example: "admin@portfolio.uz" },
      role: { type: "string", enum: ["admin", "superadmin"], default: "admin" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  // PATHS / ENDPOINTS
  paths: {
    "/api/auth/login": {
      post: {
        summary: "Tizimga kirish (Login)",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "admin@portfolio.uz" },
                  password: { type: "string", example: "parol123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Muvaffaqiyatli kirdi va Kuki (JWT) o'rnatildi.",
          },
          401: { description: "Email yoki parol xato." },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        summary: "Tizimdan chiqish (Logout)",
        tags: ["Auth"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Kuki muvaffaqiyatli tozalandi." },
          401: {
            description: "Token topilmadi / Avtorizatsiyadan o'tilmagan.",
          },
        },
      },
    },
    "/api/auth/update": {
      patch: {
        summary: "Admin o'z shaxsiy profilini tahrirlashi",
        tags: ["Auth"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", example: "yangi_login" },
                  email: {
                    type: "string",
                    example: "yangi_email@portfolio.uz",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Profil muvaffaqiyatli yangilandi." },
        },
      },
    },
    "/api/auth/invite": {
      post: {
        summary: "Yangi admin taklif qilish (🛡️ Faqat SuperAdmin)",
        tags: ["Auth"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password"],
                properties: {
                  username: { type: "string", example: "yangi_admin" },
                  email: { type: "string", example: "manager@portfolio.uz" },
                  password: { type: "string", example: "securePass123" },
                  role: {
                    type: "string",
                    enum: ["admin", "superadmin"],
                    default: "admin",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Yangi admin muvaffaqiyatli yaratildi." },
          403: { description: "Ruxsat berilmagan (Siz SuperAdmin emassiz)." },
        },
      },
    },
    "/api/auth/admins": {
      get: {
        summary:
          "Barcha ro'yxatdan o'tgan adminlar ro'yxati (🛡️ Faqat SuperAdmin)",
        tags: ["Auth"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Barcha adminlar ro'yxati muvaffaqiyatli yuklandi.",
          },
        },
      },
    },
    "/api/auth/update/{id}": {
      put: {
        summary:
          "Boshqa adminni ID orqali to'liq yangilash (🛡️ Faqat SuperAdmin)",
        tags: ["Auth"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Admin IDsi",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Admin" },
            },
          },
        },
        responses: {
          200: { description: "Admin ma'lumotlari to'liq yangilandi." },
        },
      },
    },
    "/api/auth/admins/{id}": {
      delete: {
        summary: "Adminni tizimdan o'chirish (🛡️ Faqat SuperAdmin)",
        tags: ["Auth"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "O'chirilishi kerak bo'lgan Admin IDsi",
          },
        ],
        responses: {
          200: { description: "Admin muvaffaqiyatli o'chirildi." },
        },
      },
    },
  },
};
