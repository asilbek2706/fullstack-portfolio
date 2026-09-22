const { authSecurity, response, standardErrorResponses } = require("./common");

const schemas = {
  UploadResponse: {
    type: "object",
    required: ["success", "url"],
    properties: {
      success: { type: "boolean", example: true },
      url: {
        type: "string",
        pattern: "^/uploads/[0-9a-f-]{36}\\.(jpg|png|webp)$",
        example: "/uploads/123e4567-e89b-12d3-a456-426614174000.webp",
      },
    },
  },
};

const paths = {
  "/api/upload": {
    post: {
      tags: ["Uploads"],
      summary: "Rasm yuklash",
      description:
        "Faqat JPG, PNG yoki WEBP; maksimal hajm 5 MB. Faqat SuperAdmin.",
      operationId: "uploadImage",
      security: authSecurity,
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["image"],
              properties: { image: { type: "string", format: "binary" } },
            },
          },
        },
      },
      responses: {
        201: response("Rasm saqlandi.", {
          $ref: "#/components/schemas/UploadResponse",
        }),
        413: response("Rasm yoki multipart maydoni limiti oshdi.", {
          $ref: "#/components/schemas/Error",
        }),
        415: response(
          "Rasm turi yoki haqiqiy fayl signaturasi qo‘llab-quvvatlanmaydi.",
          {
            $ref: "#/components/schemas/Error",
          },
        ),
        ...standardErrorResponses,
      },
    },
  },
};

module.exports = { schemas, paths };
