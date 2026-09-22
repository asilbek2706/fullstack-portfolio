process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const { afterEach } = require("node:test");

const axios = require("axios");
const { env } = require("../config/env");
const {
  validateContactAndRecaptcha,
} = require("../middlewares/contactMiddleware");

const originalAxiosPost = axios.post;

afterEach(() => {
  axios.post = originalAxiosPost;
});

const validBody = () => ({
  name: "  Asilbek Karomatov  ",
  phone: "+998 90 123 45 67",
  message: "  Portfolio bo‘yicha bog‘lanmoqchiman.  ",
  recaptchaToken: "a".repeat(32),
});

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

const runMiddleware = async (body) => {
  const req = {
    body,
    ip: "127.0.0.1",
  };

  const res = createResponse();
  let nextCalled = false;
  let nextError;

  await validateContactAndRecaptcha(req, res, (error) => {
    nextCalled = true;
    nextError = error;
  });

  return {
    req,
    res,
    nextCalled,
    nextError,
  };
};

const mockSuccessfulRecaptcha = () => {
  axios.post = async () => ({
    data: {
      success: true,
      score: env.recaptchaMinScore,
      action: env.recaptchaAction,
      hostname: env.recaptchaHostname,
    },
  });
};

test("Contact rejects array body", async () => {
  const result = await runMiddleware([]);

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.nextCalled, false);
});

test("Contact rejects unknown fields", async () => {
  const result = await runMiddleware({
    ...validBody(),
    isAnswered: true,
  });

  assert.equal(result.res.statusCode, 400);
  assert.match(
    result.res.body.message,
    /Ruxsat etilmagan maydonlar: isAnswered/,
  );
  assert.equal(result.nextCalled, false);
});

test("Contact rejects non-string name", async () => {
  const result = await runMiddleware({
    ...validBody(),
    name: { admin: true },
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.nextCalled, false);
});

test("Contact rejects whitespace-only input", async () => {
  const result = await runMiddleware({
    ...validBody(),
    message: "   ",
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.nextCalled, false);
});

test("Contact rejects forbidden control characters", async () => {
  const result = await runMiddleware({
    ...validBody(),
    name: "Asilbek\u0000Karomatov",
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.nextCalled, false);
});

test("Contact rejects invalid Uzbek phone number", async () => {
  const result = await runMiddleware({
    ...validBody(),
    phone: "+99890123",
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.nextCalled, false);
});

test("Contact rejects short recaptcha token", async () => {
  const result = await runMiddleware({
    ...validBody(),
    recaptchaToken: "short",
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.nextCalled, false);
});

test("Contact validates recaptcha and normalizes input", async () => {
  let capturedCall;

  axios.post = async (...args) => {
    capturedCall = args;

    return {
      data: {
        success: true,
        score: env.recaptchaMinScore,
        action: env.recaptchaAction,
        hostname: env.recaptchaHostname,
      },
    };
  };

  const result = await runMiddleware(validBody());

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, undefined);
  assert.equal(result.res.body, undefined);

  assert.deepEqual(result.req.body, {
    name: "Asilbek Karomatov",
    phone: "+998901234567",
    message: "Portfolio bo‘yicha bog‘lanmoqchiman.",
    recaptchaToken: "a".repeat(32),
  });

  assert.equal(
    capturedCall[0],
    "https://www.google.com/recaptcha/api/siteverify",
  );

  assert.ok(capturedCall[1] instanceof URLSearchParams);
  assert.equal(
    capturedCall[1].get("secret"),
    env.recaptchaSecretKey,
  );
  assert.equal(
    capturedCall[1].get("response"),
    "a".repeat(32),
  );
  assert.equal(
    capturedCall[1].get("remoteip"),
    "127.0.0.1",
  );

  assert.equal(new URL(capturedCall[0]).search, "");
  assert.equal(capturedCall[2].timeout, 5000);
});

test("Contact rejects low recaptcha score", async () => {
  axios.post = async () => ({
    data: {
      success: true,
      score: Math.max(0, env.recaptchaMinScore - 0.1),
      action: env.recaptchaAction,
      hostname: env.recaptchaHostname,
    },
  });

  const result = await runMiddleware(validBody());

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.nextCalled, false);
});

test("Contact rejects incorrect recaptcha action", async () => {
  axios.post = async () => ({
    data: {
      success: true,
      score: 1,
      action: "login",
      hostname: env.recaptchaHostname,
    },
  });

  const result = await runMiddleware(validBody());

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.nextCalled, false);
});

test("Contact rejects incorrect recaptcha hostname", async () => {
  axios.post = async () => ({
    data: {
      success: true,
      score: 1,
      action: env.recaptchaAction,
      hostname: "evil.example",
    },
  });

  const result = await runMiddleware(validBody());

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.nextCalled, false);
});

test("Contact returns 503 when recaptcha service fails", async () => {
  axios.post = async () => {
    throw new Error("Google reCAPTCHA unavailable");
  };

  const result = await runMiddleware(validBody());

  assert.equal(result.res.statusCode, 503);
  assert.equal(result.nextCalled, false);
});

test("Contact accepts valid recaptcha response", async () => {
  mockSuccessfulRecaptcha();

  const result = await runMiddleware(validBody());

  assert.equal(result.nextCalled, true);
  assert.equal(result.res.statusCode, 200);
});
