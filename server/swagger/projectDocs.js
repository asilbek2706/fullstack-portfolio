const {
  authSecurity,
  dataResponse,
  idParameter,
  paginationParameters,
  response,
  schemaRef,
  standardErrorResponses,
} = require("./common");

const projectFields = {
  title: {
    type: "string",
    minLength: 3,
    maxLength: 120,
    example: "Portfolio API",
  },
  description: { type: "string", minLength: 10, maxLength: 3000 },
  technologies: {
    type: "array",
    minItems: 1,
    maxItems: 4,
    uniqueItems: true,
    items: { type: "string", minLength: 1, maxLength: 40 },
    example: ["Node.js", "Express", "MongoDB"],
  },
  githubLink: {
    type: "string",
    format: "uri",
    pattern: "^https://github\\.com/",
    example: "https://github.com/asilbek2706/fullstack-portfolio",
  },
  demoLink: { type: "string", format: "uri", example: "https://example.com" },
};

const multipartProject = (requiredFields = []) => ({
  type: "object",
  required: requiredFields,
  additionalProperties: false,
  properties: {
    ...projectFields,
    technologies: {
      oneOf: [
        projectFields.technologies,
        {
          type: "string",
          description: "JSON array yoki vergul bilan ajratilgan qiymatlar.",
        },
      ],
    },
    image: {
      type: "string",
      format: "binary",
      description: "JPG, PNG yoki WEBP; maksimum 5 MB.",
    },
  },
});

const projectRequestBody = (schema) => ({
  required: true,
  content: { "multipart/form-data": { schema } },
});

const schemas = {
  Project: {
    type: "object",
    required: ["title", "description", "technologies", "githubLink", "image"],
    properties: {
      _id: schemaRef("ObjectId"),
      ...projectFields,
      image: {
        type: "string",
        example: "/uploads/projects/123e4567-e89b-12d3-a456-426614174000.webp",
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  ProjectCreate: multipartProject([
    "title",
    "description",
    "technologies",
    "githubLink",
    "image",
  ]),
  ProjectReplace: multipartProject([
    "title",
    "description",
    "technologies",
    "githubLink",
  ]),
  ProjectPatch: { ...multipartProject(), minProperties: 1 },
};

const projectList = {
  type: "object",
  required: ["success", "count", "pagination", "data"],
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string" },
    count: { type: "integer", minimum: 0 },
    pagination: schemaRef("Pagination"),
    data: { type: "array", items: schemaRef("Project") },
  },
};

const mutationResponses = (description) => ({
  200: response(
    description,
    dataResponse("ProjectMutationResponse", schemaRef("Project"), {
      message: { type: "string" },
    }),
  ),
  404: { $ref: "#/components/responses/NotFound" },
  413: response(
    "Yuklangan rasm hajmi 5 MB limitdan oshdi.",
    schemaRef("Error"),
  ),
  415: response("Rasm turi qo‘llab-quvvatlanmaydi.", schemaRef("Error")),
  ...standardErrorResponses,
});

const paths = {
  "/api/projects": {
    get: {
      tags: ["Projects"],
      summary: "Loyihalar ro‘yxatini olish",
      operationId: "getProjects",
      parameters: paginationParameters(12, 50),
      responses: {
        200: response("Loyihalar ro‘yxati.", projectList),
        400: { $ref: "#/components/responses/BadRequest" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
    post: {
      tags: ["Projects"],
      summary: "Loyiha yaratish",
      operationId: "createProject",
      security: authSecurity,
      requestBody: projectRequestBody(schemaRef("ProjectCreate")),
      responses: {
        201: response(
          "Loyiha yaratildi.",
          dataResponse("ProjectCreateResponse", schemaRef("Project"), {
            message: { type: "string" },
          }),
        ),
        413: response(
          "Yuklangan rasm hajmi 5 MB limitdan oshdi.",
          schemaRef("Error"),
        ),
        415: response("Rasm turi qo‘llab-quvvatlanmaydi.", schemaRef("Error")),
        ...standardErrorResponses,
      },
    },
  },
  "/api/projects/{id}": {
    get: {
      tags: ["Projects"],
      summary: "Bitta loyihani olish",
      operationId: "getProjectById",
      parameters: [idParameter("Loyiha identifikatori.")],
      responses: {
        200: response(
          "Loyiha ma’lumotlari.",
          dataResponse("ProjectResponse", schemaRef("Project")),
        ),
        400: { $ref: "#/components/responses/BadRequest" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
    put: {
      tags: ["Projects"],
      summary: "Loyihani to‘liq yangilash",
      operationId: "replaceProject",
      security: authSecurity,
      parameters: [idParameter("Loyiha identifikatori.")],
      requestBody: projectRequestBody(schemaRef("ProjectReplace")),
      responses: mutationResponses("Loyiha yangilandi."),
    },
    patch: {
      tags: ["Projects"],
      summary: "Loyihani qisman yangilash",
      operationId: "patchProject",
      security: authSecurity,
      parameters: [idParameter("Loyiha identifikatori.")],
      requestBody: projectRequestBody(schemaRef("ProjectPatch")),
      responses: mutationResponses("Loyiha qisman yangilandi."),
    },
    delete: {
      tags: ["Projects"],
      summary: "Loyiha va uning rasmini o‘chirish",
      operationId: "deleteProject",
      security: authSecurity,
      parameters: [idParameter("Loyiha identifikatori.")],
      responses: {
        200: response("Loyiha o‘chirildi.", {
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
