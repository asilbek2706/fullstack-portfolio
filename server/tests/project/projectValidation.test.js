process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateProjectInput,
} = require("../../middlewares/projectMiddleware");

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const validProject = () => ({
  title: "Test Project",
  description: "Bu yetarlicha uzun loyiha tavsifi.",
  technologies: ["Node.js", "Express"],
  githubLink: "https://github.com/asilbek2706/test-project",
  demoLink: "https://example.com",
});

const runValidation = ({
  method = "POST",
  body,
  file,
} = {}) => {
  const req = {
    method,
    body,
    file,
  };
  const res = createResponse();
  let nextCalled = false;

  validateProjectInput(req, res, () => {
    nextCalled = true;
  });

  return {
    req,
    res,
    nextCalled,
  };
};

test("Project create requires mandatory fields", () => {
  const { res, nextCalled } = runValidation({
    body: {
      title: "Test Project",
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /Majburiy maydonlar/);
});

test("Project rejects unknown fields", () => {
  const body = validProject();
  body.createdBy = "fake-admin";

  const { res, nextCalled } = runValidation({ body });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.equal(
    res.body.message,
    "Ruxsat etilmagan maydonlar: createdBy",
  );
});

test("Project rejects non-string title", () => {
  const body = validProject();
  body.title = {
    value: "Test",
  };

  const { res, nextCalled } = runValidation({ body });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /Sarlavha matn/);
});

test("Project rejects short description", () => {
  const body = validProject();
  body.description = "Qisqa";

  const { res, nextCalled } = runValidation({ body });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /10–3000/);
});

test("Project rejects malformed technologies JSON", () => {
  const body = validProject();
  body.technologies = '["Node.js"';

  const { res, nextCalled } = runValidation({ body });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /1–4 elementli massiv/);
});

test("Project rejects more than four technologies", () => {
  const body = validProject();
  body.technologies = [
    "Node.js",
    "Express",
    "MongoDB",
    "Socket.IO",
    "Pino",
  ];

  const { res, nextCalled } = runValidation({ body });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /1–4 elementli massiv/);
});

test("Project rejects non-string technology", () => {
  const body = validProject();
  body.technologies = ["Node.js", { name: "Express" }];

  const { res, nextCalled } = runValidation({ body });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /matn bo'lishi kerak/);
});

test("Project rejects duplicate technologies", () => {
  const body = validProject();
  body.technologies = ["React", " react "];

  const { res, nextCalled } = runValidation({ body });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /takroriy qiymat/);
});

test("Project rejects non-GitHub repository URL", () => {
  const body = validProject();
  body.githubLink = "https://evil.example/repository";

  const { res, nextCalled } = runValidation({ body });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /github\.com URL/);
});

test("Project rejects unsupported demo URL protocol", () => {
  const body = validProject();
  body.demoLink = "ftp://example.com/project";

  const { res, nextCalled } = runValidation({ body });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /http\/https URL/);
});

test("Project PATCH rejects empty update", () => {
  const { res, nextCalled } = runValidation({
    method: "PATCH",
    body: {},
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /kamida bitta maydon/);
});

test("Project PATCH accepts image-only update", () => {
  const { req, res, nextCalled } = runValidation({
    method: "PATCH",
    body: {},
    file: {
      filename: "test.png",
    },
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.deepEqual(req.body, {});
});

test("Project parses and normalizes technologies JSON", () => {
  const body = validProject();
  body.title = "  Test Project  ";
  body.technologies = '[" Node.js ","Express"]';

  const { req, res, nextCalled } = runValidation({ body });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.equal(req.body.title, "Test Project");
  assert.deepEqual(req.body.technologies, [
    "Node.js",
    "Express",
  ]);
});

test("Project parses comma-separated technologies", () => {
  const body = validProject();
  body.technologies = "Node.js, Express, MongoDB";

  const { req, res, nextCalled } = runValidation({ body });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.deepEqual(req.body.technologies, [
    "Node.js",
    "Express",
    "MongoDB",
  ]);
});
