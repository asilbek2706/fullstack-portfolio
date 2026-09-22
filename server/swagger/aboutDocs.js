const {
  authSecurity,
  dataResponse,
  jsonBody,
  response,
  schemaRef,
  standardErrorResponses,
} = require("./common");

const aboutFields = {
  fullName: {
    type: "string",
    minLength: 1,
    maxLength: 100,
    example: "Asilbek",
  },
  title: {
    type: "string",
    minLength: 1,
    maxLength: 150,
    example: "Full-stack developer",
  },
  avatar: {
    type: "string",
    maxLength: 2048,
    description:
      "HTTPS URL yoki /uploads/<uuid>.<ext> ko‘rinishidagi lokal URL.",
    example: "/uploads/123e4567-e89b-12d3-a456-426614174000.webp",
  },
  bio: { type: "string", minLength: 1, maxLength: 3000 },
  experienceYears: {
    type: "string",
    minLength: 1,
    maxLength: 50,
    example: "3+ yil",
  },
};

const schemas = {
  About: {
    type: "object",
    required: ["fullName", "title", "avatar", "bio", "experienceYears"],
    properties: {
      _id: schemaRef("ObjectId"),
      ...aboutFields,
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  AboutUpdate: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    description:
      "Birinchi sozlashda barcha maydonlar, keyingi yangilashlarda kamida bittasi talab qilinadi.",
    properties: aboutFields,
  },
};

const paths = {
  "/api/about": {
    get: {
      tags: ["About"],
      summary: "About ma’lumotlarini olish",
      operationId: "getAbout",
      responses: {
        200: response(
          "About ma’lumotlari.",
          dataResponse("AboutResponse", schemaRef("About")),
        ),
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
    put: {
      tags: ["About"],
      summary: "About ma’lumotlarini yaratish yoki yangilash",
      operationId: "updateAbout",
      security: authSecurity,
      requestBody: jsonBody(schemaRef("AboutUpdate")),
      responses: {
        200: response(
          "About saqlandi.",
          dataResponse("AboutUpdateResponse", schemaRef("About"), {
            message: { type: "string" },
          }),
        ),
        ...standardErrorResponses,
      },
    },
  },
};

module.exports = { schemas, paths };
