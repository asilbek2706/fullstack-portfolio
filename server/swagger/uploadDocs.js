module.exports = {
  paths: {
    "/api/upload": {
      // POST qismi avvalgidek qoladi
      post: {
        summary: "Profil uchun rasm yuklash (🔒 Faqat SuperAdmin)",
        tags: ["Upload"],
        security: [{ cookieAuth: [] }],
        consumes: ["multipart/form-data"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description: "Yuklanadigan rasm fayli (jpg, png, jpeg)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Rasm muvaffaqiyatli yuklandi.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    url: {
                      type: "string",
                      example: "http://localhost:8080/uploads/image.jpg",
                    },
                  },
                },
              },
            },
          },
          400: { description: "Fayl formati noto'g'ri." },
          401: { description: "Avtorizatsiyadan o'tilmagan." },
        },
      },
      // YANGI QO'SHILGAN GET QISMI
      get: {
        summary: "Oxirgi yuklangan profil rasmini olish",
        tags: ["Upload"],
        responses: {
          200: {
            description: "Rasm manzili muvaffaqiyatli olindi.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    url: {
                      type: "string",
                      example: "http://localhost:8080/uploads/image.jpg",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Hali rasm yuklanmagan.",
          },
        },
      },
    },
  },
};
