module.exports = {
  paths: {
    "/api/upload": {
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
                      example:
                        "http://localhost:5000/api/uploads/17123456789.jpg",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Fayl formati noto'g'ri yoki fayl tanlanmagan.",
          },
          401: {
            description: "Avtorizatsiyadan o'tilmagan.",
          },
        },
      },
    },
  },
};
