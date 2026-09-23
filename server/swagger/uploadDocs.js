const { authSecurity, response, standardErrorResponses } = require("./common");

const schemas = {
  UploadResponse: {
    type: "object",
    required: ["success", "url"],
    properties: {
      success: { type: "boolean", example: true },
      url: {
        type: "string",
        format: "uri",
        pattern: "^https://ik\\.imagekit\\.io/",
        example:
          "https://ik.imagekit.io/asilbekportfolio/fullstack-portfolio/uploads/image.webp",
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
