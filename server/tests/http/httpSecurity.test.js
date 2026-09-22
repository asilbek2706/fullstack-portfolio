process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../../app");

test("GET /health returns healthy response", async () => {
  const response = await request(app).get("/health").expect(200);

  assert.equal(response.body.success, true);
  assert.equal(response.body.status, "healthy");
  assert.equal(response.headers["cache-control"], "no-store");
});

test("GET /ready returns 503 without database connection", async () => {
  const response = await request(app).get("/ready").expect(503);

  assert.equal(response.body.success, false);
  assert.equal(response.body.status, "not_ready");
  assert.equal(response.body.checks.database, "disconnected");
});

test("security headers are attached", async () => {
  const response = await request(app).get("/health").expect(200);

  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.headers["x-frame-options"], "SAMEORIGIN");
});

test("unknown endpoint returns safe 404 response", async () => {
  const response = await request(app).get("/api/mavjud-emas").expect(404);

  assert.deepEqual(response.body, {
    success: false,
    message: "So'ralgan endpoint topilmadi.",
  });
});

test("denied CORS origin returns 403", async () => {
  const response = await request(app)
    .get("/api/projects")
    .set("Origin", "https://evil.example")
    .expect(403);

  assert.deepEqual(response.body, {
    success: false,
    message: "So'rov manbasi tasdiqlanmadi.",
  });

  assert.equal(response.headers["access-control-allow-origin"], undefined);
});

test("allowed CORS preflight returns 204", async () => {
  const response = await request(app)
    .options("/api/auth/login")
    .set("Origin", "http://localhost:5173")
    .set("Access-Control-Request-Method", "POST")
    .expect(204);

  assert.equal(
    response.headers["access-control-allow-origin"],
    "http://localhost:5173",
  );
  assert.equal(response.headers["access-control-allow-credentials"], "true");
});

test("malformed JSON returns safe 400 response", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send('{"username":"asilbek","password":')
    .expect(400);

  assert.deepEqual(response.body, {
    success: false,
    message: "JSON ma'lumoti noto'g'ri formatda.",
  });
});

test("oversized JSON body returns 413", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      message: "A".repeat(110 * 1024),
    })
    .expect(413);

  assert.deepEqual(response.body, {
    success: false,
    message: "So'rov hajmi belgilangan limitdan oshib ketdi.",
  });
});

test("invalid login field type returns 400", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      username: { admin: true },
      password: "12345678",
    })
    .expect(400);

  assert.deepEqual(response.body, {
    success: false,
    message: "Login yoki parol noto'g'ri.",
  });
});

test("unknown login fields are rejected", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      username: "asilbek",
      password: "not-a-real-password",
      role: "superadmin",
    })
    .expect(400);

  assert.deepEqual(response.body, {
    success: false,
    message: "Ruxsat etilmagan maydonlar: role",
  });
});
