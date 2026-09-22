const schemaRef = (name) => ({
  $ref: `#/components/schemas/${name}`,
});

const jsonContent = (schema) => ({
  "application/json": { schema },
});

const jsonBody = (schema, required = true) => ({
  required,
  content: jsonContent(schema),
});

const response = (description, schema) => ({
  description,
  ...(schema ? { content: jsonContent(schema) } : {}),
});

const dataResponse = (name, dataSchema, extraProperties = {}) => ({
  type: "object",
  required: ["success", "data"],
  properties: {
    success: { type: "boolean", example: true },
    ...extraProperties,
    data: dataSchema,
  },
  title: name,
});

const messageResponse = (name, extraProperties = {}) => ({
  type: "object",
  required: ["message"],
  properties: {
    message: { type: "string" },
    ...extraProperties,
  },
  title: name,
});

const authSecurity = [{ cookieAuth: [] }, { bearerAuth: [] }];

const idParameter = (description = "MongoDB ObjectId") => ({
  name: "id",
  in: "path",
  required: true,
  description,
  schema: {
    type: "string",
    pattern: "^[0-9a-fA-F]{24}$",
    example: "507f1f77bcf86cd799439011",
  },
});

const paginationParameters = (defaultLimit, maxLimit) => [
  {
    name: "page",
    in: "query",
    description: "Sahifa raqami.",
    schema: { type: "integer", minimum: 1, default: 1 },
  },
  {
    name: "limit",
    in: "query",
    description: `Bir sahifadagi yozuvlar soni (maksimum ${maxLimit}).`,
    schema: {
      type: "integer",
      minimum: 1,
      maximum: maxLimit,
      default: defaultLimit,
    },
  },
];

const standardErrorResponses = {
  400: { $ref: "#/components/responses/BadRequest" },
  401: { $ref: "#/components/responses/Unauthorized" },
  403: { $ref: "#/components/responses/Forbidden" },
  429: { $ref: "#/components/responses/TooManyRequests" },
  500: { $ref: "#/components/responses/InternalServerError" },
};

const components = {
  securitySchemes: {
    cookieAuth: {
      type: "apiKey",
      in: "cookie",
      name: "token",
      description: "Login endpointi o‘rnatadigan HttpOnly JWT cookie.",
    },
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Authorization: Bearer <JWT> ko‘rinishidagi token.",
    },
  },
  schemas: {
    ObjectId: {
      type: "string",
      pattern: "^[0-9a-fA-F]{24}$",
      example: "507f1f77bcf86cd799439011",
    },
    Error: {
      type: "object",
      required: ["message"],
      properties: {
        success: { type: "boolean", example: false },
        message: {
          type: "string",
          example: "So‘rovni qayta ishlashda xatolik yuz berdi.",
        },
      },
      additionalProperties: false,
    },
    Pagination: {
      type: "object",
      required: [
        "page",
        "limit",
        "total",
        "totalPages",
        "hasNextPage",
        "hasPreviousPage",
      ],
      properties: {
        page: { type: "integer", minimum: 1, example: 1 },
        limit: { type: "integer", minimum: 1, example: 20 },
        total: { type: "integer", minimum: 0, example: 42 },
        totalPages: { type: "integer", minimum: 0, example: 3 },
        hasNextPage: { type: "boolean", example: true },
        hasPreviousPage: { type: "boolean", example: false },
      },
    },
  },
  responses: {
    BadRequest: response(
      "So‘rov ma’lumoti yoki parametri noto‘g‘ri.",
      schemaRef("Error"),
    ),
    Unauthorized: response(
      "Autentifikatsiya talab qilinadi yoki sessiya yaroqsiz.",
      schemaRef("Error"),
    ),
    Forbidden: response(
      "Ushbu amal uchun ruxsat yetarli emas.",
      schemaRef("Error"),
    ),
    NotFound: response("Resurs topilmadi.", schemaRef("Error")),
    Conflict: response(
      "Resursning joriy holati amalni bajarishga yo‘l qo‘ymaydi.",
      schemaRef("Error"),
    ),
    TooManyRequests: response(
      "So‘rovlar limiti oshib ketdi.",
      schemaRef("Error"),
    ),
    InternalServerError: response("Server ichki xatoligi.", schemaRef("Error")),
  },
};

module.exports = {
  authSecurity,
  components,
  dataResponse,
  idParameter,
  jsonBody,
  jsonContent,
  messageResponse,
  paginationParameters,
  response,
  schemaRef,
  standardErrorResponses,
};
