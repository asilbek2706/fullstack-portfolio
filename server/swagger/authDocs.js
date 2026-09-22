const {
  authSecurity,
  dataResponse,
  idParameter,
  jsonBody,
  messageResponse,
  paginationParameters,
  response,
  schemaRef,
  standardErrorResponses,
} = require("./common");

const credentials = {
  username: { type: "string", minLength: 3, maxLength: 50, example: "admin" },
  password: {
    type: "string",
    format: "password",
    minLength: 8,
    maxLength: 128,
  },
};

const schemas = {
  Admin: {
    type: "object",
    required: ["username", "email", "role"],
    properties: {
      _id: schemaRef("ObjectId"),
      username: credentials.username,
      email: {
        type: "string",
        format: "email",
        maxLength: 254,
        example: "admin@example.com",
      },
      role: { type: "string", enum: ["admin", "superadmin"] },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  LoginRequest: {
    type: "object",
    required: ["username", "password"],
    additionalProperties: false,
    properties: credentials,
  },
  InviteAdminRequest: {
    type: "object",
    required: ["username", "email", "password"],
    additionalProperties: false,
    properties: {
      ...credentials,
      email: { type: "string", format: "email", maxLength: 254 },
    },
  },
  UpdateProfileRequest: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    properties: {
      username: credentials.username,
      email: { type: "string", format: "email", maxLength: 254 },
      password: credentials.password,
    },
  },
  UpdateAdminRequest: {
    type: "object",
    required: ["username", "email", "role"],
    additionalProperties: false,
    properties: {
      username: credentials.username,
      email: { type: "string", format: "email", maxLength: 254 },
      role: { type: "string", enum: ["admin", "superadmin"] },
    },
  },
};

const adminList = {
  type: "object",
  required: ["success", "count", "pagination", "data"],
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string" },
    count: { type: "integer", minimum: 0 },
    pagination: schemaRef("Pagination"),
    data: { type: "array", items: schemaRef("Admin") },
  },
};

const paths = {
  "/api/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Admin sifatida kirish",
      operationId: "loginAdmin",
      requestBody: jsonBody(schemaRef("LoginRequest")),
      responses: {
        200: response("JWT HttpOnly cookie o‘rnatildi.", {
          type: "object",
          required: ["message", "role", "user"],
          properties: {
            message: { type: "string" },
            role: { type: "string", enum: ["admin", "superadmin"] },
            user: {
              type: "object",
              required: ["username", "email"],
              properties: {
                username: { type: "string" },
                email: { type: "string", format: "email" },
              },
            },
          },
        }),
        400: { $ref: "#/components/responses/BadRequest" },
        429: { $ref: "#/components/responses/TooManyRequests" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
  "/api/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Sessiyadan chiqish",
      operationId: "logoutAdmin",
      security: authSecurity,
      responses: {
        200: response(
          "Auth cookie tozalandi.",
          messageResponse("LogoutResponse"),
        ),
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
  "/api/auth/me": {
    get: {
      tags: ["Authentication"],
      summary: "Joriy admin profilini olish",
      operationId: "getMe",
      security: authSecurity,
      responses: {
        200: response("Joriy adminning public profili.", {
          type: "object",
          required: ["username", "email", "role"],
          properties: {
            username: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["admin", "superadmin"] },
          },
        }),
        404: { $ref: "#/components/responses/NotFound" },
        ...standardErrorResponses,
      },
    },
  },
  "/api/auth/update": {
    patch: {
      tags: ["Authentication"],
      summary: "Joriy admin profilini qisman yangilash",
      description:
        "Parol o‘zgarsa eski sessiyalar bekor qilinadi va joriy cookie yangilanadi.",
      operationId: "updateMe",
      security: authSecurity,
      requestBody: jsonBody(schemaRef("UpdateProfileRequest")),
      responses: {
        200: response(
          "Profil yangilandi.",
          dataResponse("ProfileUpdateResponse", schemaRef("Admin"), {
            message: { type: "string" },
          }),
        ),
        404: { $ref: "#/components/responses/NotFound" },
        ...standardErrorResponses,
      },
    },
  },
  "/api/auth/invite": {
    post: {
      tags: ["Admin management"],
      summary: "Oddiy admin yaratish",
      operationId: "inviteAdmin",
      security: authSecurity,
      requestBody: jsonBody(schemaRef("InviteAdminRequest")),
      responses: {
        201: response("Admin yaratildi.", {
          type: "object",
          required: ["message", "admin"],
          properties: {
            message: { type: "string" },
            admin: schemaRef("Admin"),
          },
        }),
        ...standardErrorResponses,
      },
    },
  },
  "/api/auth/admins": {
    get: {
      tags: ["Admin management"],
      summary: "Adminlar ro‘yxatini olish",
      operationId: "getAllAdmins",
      security: authSecurity,
      parameters: paginationParameters(20, 50),
      responses: {
        200: response("Adminlar ro‘yxati.", adminList),
        ...standardErrorResponses,
      },
    },
  },
  "/api/auth/update/{id}": {
    put: {
      tags: ["Admin management"],
      summary: "Adminni to‘liq yangilash",
      description: "SuperAdmin rolini pasaytirish taqiqlangan.",
      operationId: "updateAdminBySuper",
      security: authSecurity,
      parameters: [idParameter("Yangilanadigan admin identifikatori.")],
      requestBody: jsonBody(schemaRef("UpdateAdminRequest")),
      responses: {
        200: response(
          "Admin yangilandi.",
          dataResponse("AdminUpdateResponse", schemaRef("Admin"), {
            message: { type: "string" },
          }),
        ),
        404: { $ref: "#/components/responses/NotFound" },
        ...standardErrorResponses,
      },
    },
  },
  "/api/auth/admins/{id}": {
    delete: {
      tags: ["Admin management"],
      summary: "Oddiy adminni o‘chirish",
      description: "SuperAdmin hisobini o‘chirish mumkin emas.",
      operationId: "deleteAdmin",
      security: authSecurity,
      parameters: [idParameter("O‘chiriladigan admin identifikatori.")],
      responses: {
        200: response(
          "Admin o‘chirildi.",
          messageResponse("AdminDeleteResponse"),
        ),
        404: { $ref: "#/components/responses/NotFound" },
        ...standardErrorResponses,
      },
    },
  },
};

module.exports = { schemas, paths };
