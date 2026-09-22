const {
  authSecurity,
  dataResponse,
  idParameter,
  jsonBody,
  paginationParameters,
  response,
  schemaRef,
  standardErrorResponses,
} = require("./common");

const timestamps = {
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const schemas = {
  ContactCreate: {
    type: "object",
    required: ["name", "phone", "message", "recaptchaToken"],
    additionalProperties: false,
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 50,
        example: "Ali Valiyev",
      },
      phone: {
        type: "string",
        pattern: "^\\+998\\d{9}$",
        example: "+998901234567",
      },
      message: { type: "string", minLength: 5, maxLength: 1000 },
      recaptchaToken: { type: "string", minLength: 20, maxLength: 4096 },
    },
  },
  ContactAdmin: {
    type: "object",
    properties: {
      _id: schemaRef("ObjectId"),
      name: { type: "string" },
      phone: { type: "string" },
      message: { type: "string" },
      answer: { type: "string" },
      isAnswered: { type: "boolean" },
      isPublic: { type: "boolean" },
      telegramDeliveryStatus: {
        type: "string",
        enum: ["pending", "sent", "failed"],
      },
      ...timestamps,
    },
  },
  ContactPublic: {
    type: "object",
    required: ["name", "message", "answer", "updatedAt"],
    properties: {
      _id: schemaRef("ObjectId"),
      name: { type: "string" },
      message: { type: "string" },
      answer: { type: "string" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  ContactCreateResult: {
    type: "object",
    required: ["trackingToken", "deliveryStatus"],
    properties: {
      trackingToken: {
        type: "string",
        pattern: "^[A-Za-z0-9_-]{43}$",
        description:
          "Faqat bir marta qaytariladi; javob holatini tekshirish uchun saqlab qo‘ying.",
      },
      deliveryStatus: { type: "string", enum: ["sent", "failed"] },
    },
  },
  TrackingStatus: {
    type: "object",
    required: ["isAnswered", "answer", "createdAt", "updatedAt"],
    properties: {
      isAnswered: { type: "boolean" },
      answer: { type: "string" },
      ...timestamps,
    },
  },
  PublicationRequest: {
    type: "object",
    required: ["isPublic"],
    additionalProperties: false,
    properties: { isPublic: { type: "boolean" } },
  },
  ClearContactsRequest: {
    type: "object",
    required: ["confirmation", "password"],
    additionalProperties: false,
    properties: {
      confirmation: { type: "string", enum: ["DELETE_ALL_CONTACTS"] },
      password: {
        type: "string",
        format: "password",
        minLength: 1,
        maxLength: 128,
      },
    },
  },
  TelegramUpdate: {
    type: "object",
    description:
      "Telegram Bot API update obyekti. Faqat bot tomonidan yuboriladi.",
    additionalProperties: true,
  },
};

const paginatedContacts = (itemSchema) => ({
  type: "object",
  required: ["success", "count", "pagination", "data"],
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string" },
    count: { type: "integer", minimum: 0 },
    pagination: schemaRef("Pagination"),
    data: { type: "array", items: itemSchema },
  },
});

const paths = {
  "/api/contact": {
    post: {
      tags: ["Contacts"],
      summary: "Yangi murojaat yuborish",
      description:
        "reCAPTCHA v3 tekshiriladi. Telegram ishlamasa murojaat saqlanadi va 202 qaytadi.",
      operationId: "createContact",
      requestBody: jsonBody(schemaRef("ContactCreate")),
      responses: {
        201: response(
          "Murojaat saqlandi va Telegram’ga yuborildi.",
          dataResponse(
            "ContactCreatedResponse",
            schemaRef("ContactCreateResult"),
            { message: { type: "string" } },
          ),
        ),
        202: response(
          "Murojaat saqlandi, Telegram yetkazilishi muvaffaqiyatsiz.",
          dataResponse(
            "ContactAcceptedResponse",
            schemaRef("ContactCreateResult"),
            { message: { type: "string" } },
          ),
        ),
        400: { $ref: "#/components/responses/BadRequest" },
        429: { $ref: "#/components/responses/TooManyRequests" },
        503: response(
          "reCAPTCHA xizmati vaqtincha ishlamayapti.",
          schemaRef("Error"),
        ),
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
    get: {
      tags: ["Contacts"],
      summary: "Barcha murojaatlarni admin uchun olish",
      operationId: "getAllContacts",
      security: authSecurity,
      parameters: paginationParameters(20, 100),
      responses: {
        200: response(
          "Murojaatlar ro‘yxati.",
          paginatedContacts(schemaRef("ContactAdmin")),
        ),
        ...standardErrorResponses,
      },
    },
  },
  "/api/contact/answer": {
    get: {
      tags: ["Contacts"],
      summary: "Public qilingan javoblarni olish",
      operationId: "getPublicContactAnswers",
      parameters: paginationParameters(20, 50),
      responses: {
        200: response(
          "Public javoblar ro‘yxati.",
          paginatedContacts(schemaRef("ContactPublic")),
        ),
        400: { $ref: "#/components/responses/BadRequest" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
  "/api/contact/answer/{token}": {
    get: {
      tags: ["Contacts"],
      summary: "Murojaat javobi holatini tracking token bilan tekshirish",
      operationId: "getContactAnswer",
      parameters: [
        {
          name: "token",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[A-Za-z0-9_-]{43}$" },
        },
      ],
      responses: {
        200: response(
          "Murojaatning xavfsiz javob holati.",
          dataResponse("TrackingResponse", schemaRef("TrackingStatus")),
        ),
        400: { $ref: "#/components/responses/BadRequest" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
  "/api/contact/{id}/publication": {
    patch: {
      tags: ["Contacts"],
      summary: "Javobni public qilish yoki yashirish",
      description:
        "Javob berilmagan murojaatni public qilib bo‘lmaydi. Faqat SuperAdmin.",
      operationId: "setContactPublication",
      security: authSecurity,
      parameters: [idParameter("Murojaat identifikatori.")],
      requestBody: jsonBody(schemaRef("PublicationRequest")),
      responses: {
        200: response(
          "Publication holati yangilandi.",
          dataResponse(
            "PublicationResponse",
            {
              type: "object",
              required: ["id", "isAnswered", "isPublic"],
              properties: {
                id: schemaRef("ObjectId"),
                isAnswered: { type: "boolean" },
                isPublic: { type: "boolean" },
              },
            },
            { message: { type: "string" } },
          ),
        ),
        404: { $ref: "#/components/responses/NotFound" },
        409: { $ref: "#/components/responses/Conflict" },
        ...standardErrorResponses,
      },
    },
  },
  "/api/contact/clear": {
    delete: {
      tags: ["Contacts"],
      summary: "Barcha murojaatlarni o‘chirish",
      description:
        "Aniq confirmation qiymati va joriy SuperAdmin paroli talab qilinadi.",
      operationId: "clearAllContacts",
      security: authSecurity,
      requestBody: jsonBody(schemaRef("ClearContactsRequest")),
      responses: {
        200: response("Barcha murojaatlar o‘chirildi.", {
          type: "object",
          required: ["success", "message", "deletedCount"],
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            deletedCount: { type: "integer", minimum: 0 },
          },
        }),
        ...standardErrorResponses,
      },
    },
  },
  "/api/contact/clear/{id}": {
    delete: {
      tags: ["Contacts"],
      summary: "Bitta murojaatni o‘chirish",
      operationId: "deleteContact",
      security: authSecurity,
      parameters: [idParameter("Murojaat identifikatori.")],
      responses: {
        200: response(
          "Murojaat o‘chirildi.",
          dataResponse("ContactDeleteResponse", schemaRef("ContactAdmin"), {
            message: { type: "string" },
          }),
        ),
        404: { $ref: "#/components/responses/NotFound" },
        ...standardErrorResponses,
      },
    },
  },
  "/api/contact/telegram-webhook": {
    post: {
      tags: ["Contacts"],
      summary: "Telegram reply webhookini qabul qilish",
      description:
        "Telegram Bot API uchun ichki endpoint. x-telegram-bot-api-secret-token headeri talab qilinadi.",
      operationId: "handleTelegramWebhook",
      parameters: [
        {
          name: "x-telegram-bot-api-secret-token",
          in: "header",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: jsonBody(schemaRef("TelegramUpdate")),
      responses: {
        200: {
          description: "Update qabul qilindi; javob oddiy OK matni.",
          content: {
            "text/plain": {
              schema: { type: "string", example: "OK" },
            },
          },
        },
        403: { $ref: "#/components/responses/Forbidden" },
        429: { $ref: "#/components/responses/TooManyRequests" },
      },
    },
  },
};

module.exports = { schemas, paths };
