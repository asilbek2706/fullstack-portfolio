module.exports = {
  // Real MongoDB model sxemangiz (Hamma rowlar to'liq va mukammal)
  schema: {
    type: "object",
    required: [
      "title",
      "description",
      "image",
      "technologies",
      "githubLink",
      "createdBy",
    ],
    properties: {
      _id: { type: "string", example: "6a358d41d804b6f53d7de2c7" },
      title: {
        type: "string",
        minLength: 3,
        description: "Kamida 3 ta belgi",
        example: "Mening Shaxsiy Portfolio veb-saytim",
      },
      description: {
        type: "string",
        example:
          "Node.js va React texnologiyalari yordamida yaratilgan mukammal portfolio backend tizimi.",
      },
      image: {
        type: "string",
        description: "Rasm havolasi (URL yoki fayl yo'li)",
        example: "https://res.cloudinary.com/.../project.jpg",
      },
      technologies: {
        type: "array",
        maxItems: 4,
        description: "Texnologiyalar soni ko'pi bilan 4 ta bo'lishi shart!",
        items: { type: "string" },
        example: ["Node.js", "Express", "MongoDB", "Socket.io"],
      },
      githubLink: {
        type: "string",
        example: "https://github.com/asilbek2706/fullstack-portfolio",
      },
      demoLink: {
        type: "string",
        default: "",
        example: "https://fullstack-portfolio-81mm.onrender.com",
      },
      createdBy: {
        type: "string",
        description: "Loyihani yaratgan Admin IDsi (Relation)",
        example: "64a58d41d804b6f53d7de2c7",
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  paths: {
    "/api/projects": {
      get: {
        summary: "Barcha loyihalarni ko'rish (Ommaviy)",
        tags: ["Projects"],
        responses: {
          200: {
            description: "Loyihalar ro'yxati muvaffaqiyatli yuklandi.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Project" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Yangi portfolio loyihasini qo'shish (🔒 Faqat Admin)",
        tags: ["Projects"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "title",
                  "description",
                  "image",
                  "technologies",
                  "githubLink",
                ],
                properties: {
                  title: {
                    type: "string",
                    minLength: 3,
                    example: "E-Commerce Web App",
                  },
                  description: {
                    type: "string",
                    example: "Online magazin platformasi backend qismi.",
                  },
                  image: {
                    type: "string",
                    example:
                      "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
                  },
                  technologies: {
                    type: "array",
                    maxItems: 4,
                    items: { type: "string" },
                    example: ["Node.js", "Express", "MongoDB"],
                  },
                  githubLink: {
                    type: "string",
                    example: "https://github.com/...",
                  },
                  demoLink: { type: "string", example: "https://demo.uz" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description:
              "Loyiha muvaffaqiyatli yaratildi va Websocket (Socket.io) orqali barchaga tarqatildi.",
          },
          400: {
            description:
              "Validatsiya xatoligi (Masalan: texnologiyalar soni 4 tadan oshib ketgan).",
          },
        },
      },
    },
    "/api/projects/{id}": {
      get: {
        summary: "Bitta loyihani ID orqali olish (Ommaviy)",
        tags: ["Projects"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Loyiha IDsi",
          },
        ],
        responses: {
          200: {
            description: "Loyiha topildi.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Project" },
              },
            },
          },
          404: { description: "Bunday IDga ega loyiha topilmadi." },
        },
      },
      put: {
        summary: "Loyihani to'liq yangilash (🔒 Admin/Owner yoki SuperAdmin)",
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
              schema: { $ref: "#/components/schemas/Project" },
            },
          },
        },
        responses: {
          200: { description: "Loyiha to'liq yangilandi." },
          403: {
            description:
              "Sizda bu loyihani o'zgartirishga ruxsat yo'q (Ega emassiz).",
          },
        },
      },
      patch: {
        summary: "Loyihaning ba'zi qismlarini yangilash (🔒 Admin/Owner)",
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
                    example: "Qisman o'zgargan sarlavha",
                  },
                  description: {
                    type: "string",
                    example: "Faqat tavsif matni o'zgardi",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Loyiha qisman muvaffaqiyatli tahrirlandi." },
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
          200: {
            description: "Loyiha tizimdan va bazadan butunlay o'chirildi.",
          },
        },
      },
    },
  },
};
