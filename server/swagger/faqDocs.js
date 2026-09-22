const {
  authSecurity,
  dataResponse,
  idParameter,
  jsonBody,
  response,
  schemaRef,
  standardErrorResponses,
} = require("./common");

const faqFields = {
  question: {
    type: "string",
    minLength: 3,
    maxLength: 300,
    example: "Qanday bog‘lanish mumkin?",
  },
  answer: {
    type: "string",
    minLength: 2,
    maxLength: 3000,
    example: "Contact formasi orqali.",
  },
  order: { type: "integer", minimum: 0, maximum: 10000, default: 0 },
};

const schemas = {
  FAQ: {
    type: "object",
    required: ["question", "answer", "order"],
    properties: {
      _id: schemaRef("ObjectId"),
      ...faqFields,
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  FAQCreate: {
    type: "object",
    required: ["question", "answer"],
    additionalProperties: false,
    properties: faqFields,
  },
  FAQUpdate: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    properties: faqFields,
  },
};

const listSchema = {
  type: "object",
  required: ["success", "count", "data"],
  properties: {
    success: { type: "boolean", example: true },
    count: { type: "integer", minimum: 0 },
    data: { type: "array", items: schemaRef("FAQ") },
  },
};

const paths = {
  "/api/faq": {
    get: {
      tags: ["FAQ"],
      summary: "FAQ ro‘yxatini olish",
      operationId: "getFAQs",
      responses: {
        200: response("Tartiblangan FAQ ro‘yxati.", listSchema),
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
    post: {
      tags: ["FAQ"],
      summary: "FAQ yaratish",
      operationId: "createFAQ",
      security: authSecurity,
      requestBody: jsonBody(schemaRef("FAQCreate")),
      responses: {
        201: response(
          "FAQ yaratildi.",
          dataResponse("FAQCreateResponse", schemaRef("FAQ"), {
            message: { type: "string" },
          }),
        ),
        ...standardErrorResponses,
      },
    },
  },
  "/api/faq/{id}": {
    put: {
      tags: ["FAQ"],
      summary: "FAQni yangilash",
      operationId: "updateFAQ",
      security: authSecurity,
      parameters: [idParameter("FAQ identifikatori.")],
      requestBody: jsonBody(schemaRef("FAQUpdate")),
      responses: {
        200: response(
          "FAQ yangilandi.",
          dataResponse("FAQUpdateResponse", schemaRef("FAQ"), {
            message: { type: "string" },
          }),
        ),
        404: { $ref: "#/components/responses/NotFound" },
        ...standardErrorResponses,
      },
    },
    delete: {
      tags: ["FAQ"],
      summary: "FAQni o‘chirish",
      operationId: "deleteFAQ",
      security: authSecurity,
      parameters: [idParameter("FAQ identifikatori.")],
      responses: {
        200: response("FAQ o‘chirildi.", {
          type: "object",
          required: ["success", "message"],
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
          },
        }),
        404: { $ref: "#/components/responses/NotFound" },
        ...standardErrorResponses,
      },
    },
  },
};

module.exports = { schemas, paths };
