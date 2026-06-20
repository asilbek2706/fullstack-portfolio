const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Full-Stack Portfolio API",
      version: "1.0.0",
      description:
        "Portfolio, Admin Autentifikatsiyasi va Telegram bot integratsiyasiga ega mukammal backend API hujjatlari",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "Kuki (Cookie) ichidagi token orqali autentifikatsiya.",
        },
      },
    },
    paths: {
      // ==========================================
      // 🔐 AUTH ROUTES (ADMIN & SUPERADMIN)
      // ==========================================
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
                    email: { type: "string", example: "admin@example.com" },
                    password: { type: "string", example: "password123" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Muvaffaqiyatli kirdi va Kuki o'rnatildi." },
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
            401: { description: "Token topilmadi." },
          },
        },
      },
      "/api/auth/update": {
        patch: {
          summary: "Admin o'z profilini tahrirlashi",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Yangi Ism" },
                    email: { type: "string", example: "new@example.com" },
                    password: { type: "string", example: "newpassword123" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Profil yangilandi." },
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
                  required: ["email", "role"],
                  properties: {
                    email: { type: "string", example: "manager@example.com" },
                    role: { type: "string", example: "admin" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Taklifnoma muvaffaqiyatli yuborildi." },
            403: { description: "Ruxsat berilmagan (SuperAdmin emas)." },
          },
        },
      },
      "/api/auth/admins": {
        get: {
          summary: "Barcha adminlar ro'yxatini ko'rish (🛡️ Faqat SuperAdmin)",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: "Ro'yxat yuklandi." },
          },
        },
      },
      "/api/auth/update/{id}": {
        put: {
          summary: "Boshqa adminni to'liq yangilash (🛡️ Faqat SuperAdmin)",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    role: { type: "string", example: "superadmin" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Admin yangilandi." },
          },
        },
      },
      "/api/auth/admins/{id}": {
        delete: {
          summary: "Adminni o'chirish (🛡️ Faqat SuperAdmin)",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Admin o'chirildi." },
          },
        },
      },

      // ==========================================
      // 🚀 PROJECT ROUTES (PORTFOLIO)
      // ==========================================
      "/api/project": {
        get: {
          summary: "Barcha loyihalarni ko'rish (Ommaviy)",
          tags: ["Projects"],
          responses: {
            200: { description: "Loyihalar ro'yxati." },
          },
        },
        post: {
          summary: "Yangi loyiha yaratish (🔒 Faqat Admin)",
          tags: ["Projects"],
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "description"],
                  properties: {
                    title: { type: "string", example: "E-Commerce Web App" },
                    description: {
                      type: "string",
                      example: "MERN Stack orqali qurilgan do'kon.",
                    },
                    link: { type: "string", example: "https://github.com/..." },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Loyiha yaratildi." },
          },
        },
      },
      "/api/project/{id}": {
        get: {
          summary: "Bitta loyihani ID orqali olish (Ommaviy)",
          tags: ["Projects"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Loyiha topildi." },
          },
        },
        put: {
          summary: "Loyihani to'liq yangilash (🔒 Admin/Owner)",
          tags: ["Projects"],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string", example: "Yangilangan title" },
                    description: {
                      type: "string",
                      example: "Yangilangan description",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Loyiha to'liq yangilandi." },
          },
        },
        patch: {
          summary: "Loyihani qisman yangilash (🔒 Admin/Owner)",
          tags: ["Projects"],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      example: "Faqat nomini o'zgartirish",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Loyiha qisman yangilandi." },
          },
        },
        delete: {
          summary: "Loyihani o'chirish (🔒 Admin/Owner)",
          tags: ["Projects"],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Loyiha o'chirildi." },
          },
        },
      },

      // ==========================================
      // 📩 CONTACT ROUTES (AVVALGI QISMDAN)
      // ==========================================
      "/api/contact": {
        post: {
          summary: "Yangi xabar/savol yuborish (Ommaviy)",
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
                    phone: { type: "string", example: "+998901234567" },
                    message: {
                      type: "string",
                      example: "Siz bilan hamkorlik qilmoqchiman.",
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
          responses: { 201: { description: "Muvaffaqiyatli saqlandi." } },
        },
        get: {
          summary: "Barcha savol-javoblarni ko'rish (🔒 Faqat Admin)",
          tags: ["Contacts"],
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: "Muvaffaqiyatli yuklandi." } },
        },
      },
      "/api/contact/answer": {
        get: {
          summary: "Barcha javob berilgan savollarni ommaviy olish",
          tags: ["Contacts"],
          responses: { 200: { description: "Yuklandi." } },
        },
      },
      "/api/contact/answer/{id}": {
        get: {
          summary: "Bitta maxsus savol javobini tekshirish",
          tags: ["Contacts"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Topildi." } },
        },
      },
      "/api/contact/telegram-webhook": {
        post: {
          summary: "Telegram Botdan keladigan javobni qabul qilish",
          tags: ["Contacts"],
          parameters: [
            {
              in: "header",
              name: "x-telegram-bot-api-secret-token",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "OK" } },
        },
      },
    },
  },
  apis: [], // Sintaksis buzilmasligi uchun fayllardan o'qish hamon o'chirilgan
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
