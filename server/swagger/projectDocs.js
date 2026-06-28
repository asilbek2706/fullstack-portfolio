module.exports = {
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
      _id: {
        type: "string",
        example: "685fa3e9b30b25d6f26e6d6c",
      },

      title: {
        type: "string",
        minLength: 3,
        example: "Portfolio Backend",
      },

      description: {
        type: "string",
        example:
          "Node.js, Express va MongoDB yordamida yozilgan portfolio backend.",
      },

      image: {
        type: "string",
        description: "Serverga yuklangan rasm yo'li",
        example: "/uploads/1751191245123-345672189.png",
      },

      technologies: {
        type: "array",
        items: {
          type: "string",
        },
        maxItems: 4,
        example: ["Node.js", "Express", "MongoDB", "Socket.io"],
      },

      githubLink: {
        type: "string",
        example: "https://github.com/asilbek2706/fullstack-portfolio",
      },

      demoLink: {
        type: "string",
        example: "https://portfolio-demo.vercel.app",
      },

      createdBy: {
        type: "string",
        example: "685e95d2786d5db418a56781",
      },

      createdAt: {
        type: "string",
        format: "date-time",
      },

      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  paths: {
    "/api/projects": {
      get: {
        tags: ["Projects"],
        summary: "Barcha loyihalarni olish",

        responses: {
          200: {
            description: "Muvaffaqiyatli",

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },

                    message: {
                      type: "string",
                      example: "Loyihalar muvaffaqiyatli yuklandi",
                    },

                    data: {
                      type: "array",

                      items: {
                        $ref: "#/components/schemas/Project",
                      },
                    },
                  },
                },
              },
            },
          },

          500: {
            description: "Server xatosi",
          },
        },
      },

      post: {
        tags: ["Projects"],

        summary: "Yangi loyiha yaratish",

        security: [
          {
            cookieAuth: [],
          },
        ],

        requestBody: {
          required: true,

          content: {
            "multipart/form-data": {
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
                    example: "Portfolio Backend",
                  },

                  description: {
                    type: "string",
                    example: "Express va MongoDB yordamida yozilgan backend.",
                  },

                  image: {
                    type: "string",
                    format: "binary",
                  },

                  technologies: {
                    type: "array",

                    items: {
                      type: "string",
                    },

                    example: ["Node.js", "Express", "MongoDB"],
                  },

                  githubLink: {
                    type: "string",
                    example:
                      "https://github.com/asilbek2706/fullstack-portfolio",
                  },

                  demoLink: {
                    type: "string",
                    example: "https://portfolio.vercel.app",
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "Loyiha yaratildi",

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },

                    message: {
                      type: "string",
                      example: "Loyiha muvaffaqiyatli yaratildi",
                    },

                    data: {
                      $ref: "#/components/schemas/Project",
                    },
                  },
                },
              },
            },
          },

          400: {
            description: "Validatsiya xatosi",
          },

          401: {
            description: "Token topilmadi",
          },

          500: {
            description: "Server xatosi",
          },
        },
      },
    },
    "/api/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "ID bo'yicha bitta loyihani olish",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        responses: {
          200: {
            description: "Loyiha topildi",

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },

                    message: {
                      type: "string",
                      example: "Loyiha topildi",
                    },

                    data: {
                      $ref: "#/components/schemas/Project",
                    },
                  },
                },
              },
            },
          },

          400: {
            description: "ID noto'g'ri",
          },

          404: {
            description: "Loyiha topilmadi",
          },

          500: {
            description: "Server xatosi",
          },
        },
      },

      put: {
        tags: ["Projects"],
        summary: "Loyihani to'liq yangilash",

        security: [
          {
            cookieAuth: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        requestBody: {
          required: true,

          content: {
            "multipart/form-data": {
              schema: {
                type: "object",

                required: [
                  "title",
                  "description",
                  "technologies",
                  "githubLink",
                ],

                properties: {
                  title: {
                    type: "string",
                  },

                  description: {
                    type: "string",
                  },

                  image: {
                    type: "string",
                    format: "binary",
                    description: "Yangi rasm (ixtiyoriy)",
                  },

                  technologies: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },

                  githubLink: {
                    type: "string",
                  },

                  demoLink: {
                    type: "string",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Loyiha yangilandi",
          },

          400: {
            description: "Validatsiya xatosi",
          },

          401: {
            description: "Token kerak",
          },

          403: {
            description: "Ruxsat yo'q",
          },

          404: {
            description: "Loyiha topilmadi",
          },

          500: {
            description: "Server xatosi",
          },
        },
      },

      patch: {
        tags: ["Projects"],
        summary: "Loyihani qisman yangilash",

        security: [
          {
            cookieAuth: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        requestBody: {
          required: false,

          content: {
            "multipart/form-data": {
              schema: {
                type: "object",

                properties: {
                  title: {
                    type: "string",
                  },

                  description: {
                    type: "string",
                  },

                  image: {
                    type: "string",
                    format: "binary",
                  },

                  technologies: {
                    type: "array",

                    items: {
                      type: "string",
                    },
                  },

                  githubLink: {
                    type: "string",
                  },

                  demoLink: {
                    type: "string",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Loyiha yangilandi",
          },

          400: {
            description: "Xato so'rov",
          },

          401: {
            description: "Token kerak",
          },

          403: {
            description: "Ruxsat yo'q",
          },

          404: {
            description: "Loyiha topilmadi",
          },

          500: {
            description: "Server xatosi",
          },
        },
      },

      delete: {
        tags: ["Projects"],
        summary: "Loyihani o'chirish",

        security: [
          {
            cookieAuth: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        responses: {
          200: {
            description: "Loyiha o'chirildi",
          },

          401: {
            description: "Token kerak",
          },

          403: {
            description: "Ruxsat yo'q",
          },

          404: {
            description: "Loyiha topilmadi",
          },

          500: {
            description: "Server xatosi",
          },
        },
      },
    },
  },
};
