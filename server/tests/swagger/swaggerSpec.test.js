const assert = require("node:assert/strict");
const test = require("node:test");

const swaggerSpec = require("../../swagger");

const expectedOperations = [
  ["get", "/health"],
  ["get", "/ready"],
  ["post", "/api/auth/login"],
  ["post", "/api/auth/logout"],
  ["patch", "/api/auth/update"],
  ["post", "/api/auth/invite"],
  ["get", "/api/auth/admins"],
  ["put", "/api/auth/update/{id}"],
  ["delete", "/api/auth/admins/{id}"],
  ["get", "/api/auth/me"],
  ["get", "/api/about"],
  ["put", "/api/about"],
  ["get", "/api/projects"],
  ["post", "/api/projects"],
  ["get", "/api/projects/{id}"],
  ["put", "/api/projects/{id}"],
  ["patch", "/api/projects/{id}"],
  ["delete", "/api/projects/{id}"],
  ["post", "/api/contact"],
  ["get", "/api/contact"],
  ["get", "/api/contact/answer"],
  ["get", "/api/contact/answer/{token}"],
  ["patch", "/api/contact/{id}/publication"],
  ["delete", "/api/contact/clear"],
  ["delete", "/api/contact/clear/{id}"],
  ["post", "/api/contact/telegram-webhook"],
  ["get", "/api/faq"],
  ["post", "/api/faq"],
  ["put", "/api/faq/{id}"],
  ["delete", "/api/faq/{id}"],
  ["post", "/api/upload"],
];

const actualOperations = () =>
  Object.entries(swaggerSpec.paths)
    .flatMap(([path, pathItem]) =>
      Object.keys(pathItem)
        .filter((method) =>
          ["get", "post", "put", "patch", "delete"].includes(method),
        )
        .map((method) => [method, path]),
    )
    .sort();

test("Swagger documents every real API operation and no fake operation", () => {
  assert.deepEqual(actualOperations(), [...expectedOperations].sort());
  assert.equal(swaggerSpec.paths["/api/upload"].get, undefined);
});

test("Every operation has stable metadata and responses", () => {
  const operationIds = new Set();

  for (const [method, path] of expectedOperations) {
    const operation = swaggerSpec.paths[path][method];

    assert.ok(
      operation.summary,
      `${method.toUpperCase()} ${path} summary missing`,
    );
    assert.ok(
      operation.operationId,
      `${method.toUpperCase()} ${path} operationId missing`,
    );
    assert.ok(
      operation.tags?.length,
      `${method.toUpperCase()} ${path} tags missing`,
    );
    assert.ok(
      Object.keys(operation.responses || {}).length,
      `${method.toUpperCase()} ${path} responses missing`,
    );
    assert.equal(
      operationIds.has(operation.operationId),
      false,
      `duplicate operationId: ${operation.operationId}`,
    );
    operationIds.add(operation.operationId);
  }
});

test("Protected operations advertise cookie and bearer alternatives", () => {
  const publicOperationIds = new Set([
    "getHealth",
    "getReadiness",
    "loginAdmin",
    "getAbout",
    "getProjects",
    "getProjectById",
    "createContact",
    "getPublicContactAnswers",
    "getContactAnswer",
    "handleTelegramWebhook",
    "getFAQs",
  ]);

  for (const [method, path] of expectedOperations) {
    const operation = swaggerSpec.paths[path][method];

    if (publicOperationIds.has(operation.operationId)) continue;

    assert.deepEqual(operation.security, [
      { cookieAuth: [] },
      { bearerAuth: [] },
    ]);
  }
});

test("Every local component reference resolves", () => {
  const unresolved = [];

  const visit = (value) => {
    if (!value || typeof value !== "object") return;

    if (
      typeof value.$ref === "string" &&
      value.$ref.startsWith("#/components/")
    ) {
      const target = value.$ref
        .slice(2)
        .split("/")
        .reduce((current, key) => current?.[key], swaggerSpec);

      if (!target) unresolved.push(value.$ref);
    }

    for (const nested of Object.values(value)) visit(nested);
  };

  visit(swaggerSpec.paths);
  assert.deepEqual(unresolved, []);
});

test("Swagger exposes both supported authentication mechanisms", () => {
  const schemes = swaggerSpec.components.securitySchemes;

  assert.equal(schemes.cookieAuth.in, "cookie");
  assert.equal(schemes.cookieAuth.name, "token");
  assert.equal(schemes.bearerAuth.scheme, "bearer");
});

test("Swagger public image URLs use ImageKit CDN", () => {
  const schemas = swaggerSpec.components.schemas;

  const imageExamples = [
    schemas.About.properties.avatar.example,
    schemas.Project.properties.image.example,
    schemas.UploadResponse.properties.url.example,
  ];

  for (const example of imageExamples) {
    assert.match(
      example,
      /^https:\/\/ik\.imagekit\.io\/asilbekportfolio\/fullstack-portfolio\//,
    );
  }

  assert.equal(Object.hasOwn(schemas.About.properties, "avatarFileId"), false);

  assert.equal(Object.hasOwn(schemas.Project.properties, "imageFileId"), false);
});
