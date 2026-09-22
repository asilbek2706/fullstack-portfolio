const { response } = require("./common");

const schemas = {
  HealthStatus: {
    type: "object",
    required: ["success", "status", "uptimeSeconds", "timestamp"],
    properties: {
      success: { type: "boolean", example: true },
      status: { type: "string", enum: ["healthy"] },
      uptimeSeconds: { type: "integer", minimum: 0 },
      timestamp: { type: "string", format: "date-time" },
    },
  },
  ReadinessStatus: {
    type: "object",
    required: ["success", "status", "checks", "timestamp"],
    properties: {
      success: { type: "boolean" },
      status: { type: "string", enum: ["ready", "not_ready"] },
      checks: {
        type: "object",
        required: ["database"],
        properties: {
          database: { type: "string", enum: ["connected", "disconnected"] },
        },
      },
      timestamp: { type: "string", format: "date-time" },
    },
  },
};

const paths = {
  "/health": {
    get: {
      tags: ["System"],
      summary: "Process holatini tekshirish",
      operationId: "getHealth",
      responses: {
        200: response("Server process ishlayapti.", {
          $ref: "#/components/schemas/HealthStatus",
        }),
      },
    },
  },
  "/ready": {
    get: {
      tags: ["System"],
      summary: "Xizmat tayyorligini tekshirish",
      operationId: "getReadiness",
      responses: {
        200: response("Server va ma’lumotlar bazasi tayyor.", {
          $ref: "#/components/schemas/ReadinessStatus",
        }),
        503: response("Ma’lumotlar bazasi hali tayyor emas.", {
          $ref: "#/components/schemas/ReadinessStatus",
        }),
      },
    },
  },
};

module.exports = { schemas, paths };
