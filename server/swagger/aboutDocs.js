const schemas = {
  About: {
    type: "object",
    required: ["fullName", "title", "avatar", "bio", "experienceYears"],
    properties: {
      _id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
      },
      fullName: {
        type: "string",
        example: "Asilbek Karomatov",
      },
      title: {
        type: "string",
        example: "Full-stack developer",
      },
      avatar: {
        type: "string",
        readOnly: true,
        example:
          "https://ik.imagekit.io/asilbekportfolio/fullstack-portfolio/about/avatar.webp",
      },
      bio: {
        type: "string",
        example: "Men zamonaviy web ilovalar yaratadigan dasturchiman.",
      },
      experienceYears: {
        type: "string",
        example: "3+ yil",
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
};

const paths = {
  "/api/about": {
    get: {
      tags: ["About"],
      summary: "About ma'lumotlarini olish",
      description: "Portfolio egasi haqidagi ommaviy ma'lumotlarni qaytaradi.",
      operationId: "getAbout",
      responses: {
        200: {
          description: "About ma'lumotlari olindi.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  data: {
                    $ref: "#/components/schemas/About",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "About ma'lumotlari hali yaratilmagan.",
        },
        500: {
          description: "Server ichki xatoligi.",
        },
      },
    },

    put: {
      tags: ["About"],
      summary: "About ma'lumotlarini yaratish yoki yangilash",
      description:
        "Faqat superadmin foydalanadi. Avatar JPG, PNG yoki WEBP fayl ko'rinishida yuboriladi. Birinchi yaratishda barcha maydonlar majburiy, yangilashda esa faqat o'zgargan maydonlarni yuborish mumkin.",
      operationId: "updateAbout",
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                fullName: {
                  type: "string",
                  minLength: 2,
                  maxLength: 120,
                  example: "Asilbek Karomatov",
                },
                title: {
                  type: "string",
                  minLength: 2,
                  maxLength: 120,
                  example: "Full-stack developer",
                },
                avatar: {
                  type: "string",
                  format: "binary",
                  description: "JPG, PNG yoki WEBP rasm. Maksimal hajm 5 MB.",
                },
                bio: {
                  type: "string",
                  minLength: 10,
                  maxLength: 3000,
                  example:
                    "Men zamonaviy web ilovalar yaratadigan dasturchiman.",
                },
                experienceYears: {
                  type: "string",
                  maxLength: 50,
                  example: "3+ yil",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "About ma'lumotlari saqlandi.",
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
                  },
                  data: {
                    $ref: "#/components/schemas/About",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Maydon yoki rasm noto'g'ri.",
        },
        401: {
          description: "Autentifikatsiya talab qilinadi.",
        },
        403: {
          description: "Faqat superadmin uchun.",
        },
        413: {
          description: "Rasm yoki so'rov hajmi limitdan oshgan.",
        },
        415: {
          description: "Rasm formati qo'llab-quvvatlanmaydi.",
        },
        500: {
          description: "Server ichki xatoligi.",
        },
      },
    },
  },
};

module.exports = {
  schemas,
  paths,
};
