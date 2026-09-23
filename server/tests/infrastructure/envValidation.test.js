const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

const validEnvironment = {
  NODE_ENV: "test",
  LOG_LEVEL: "silent",
  PORT: "8080",
  MONGO_URI: "mongodb://127.0.0.1:27017/test",
  JWT_SECRET: "a-secure-test-secret-with-more-than-32-characters",
  CLIENT_URL: "http://localhost:5173",
  RECAPTCHA_SITE_KEY: "test-recaptcha-site-key",
  RECAPTCHA_SECRET_KEY: "test-recaptcha-secret",
  RECAPTCHA_ACTION: "contact",
  RECAPTCHA_HOSTNAME: "",
  RECAPTCHA_MIN_SCORE: "0.5",
  TELEGRAM_BOT_TOKEN: "test-telegram-token",
  TELEGRAM_CHAT_ID: "test-chat-id",
  WEBHOOK_SECRET_TOKEN: "test-webhook-secret",
  IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/test-account",
  IMAGEKIT_PUBLIC_KEY: "public_test",
  IMAGEKIT_PRIVATE_KEY: "private_test",
};

const validationScript = `
  try {
    const {
      env,
      validateEnv,
    } = require("./config/env");

    validateEnv();

    process.stdout.write(
      JSON.stringify({
        nodeEnv: env.nodeEnv,
        logLevel: env.logLevel,
        port: env.port,
        recaptchaHostname:
          env.recaptchaHostname,
        recaptchaMinScore:
          env.recaptchaMinScore,
      }),
    );
  } catch (error) {
    process.stderr.write(error.message);
    process.exit(1);
  }
`;

const runValidation = (overrides = {}) =>
  spawnSync(process.execPath, ["-e", validationScript], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...validEnvironment,
      ...overrides,
    },
  });

test("Environment validator accepts valid production-like configuration", () => {
  const result = runValidation();

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");

  assert.deepEqual(JSON.parse(result.stdout), {
    nodeEnv: "test",
    logLevel: "silent",
    port: 8080,
    recaptchaHostname: "localhost",
    recaptchaMinScore: 0.5,
  });
});

test("Environment validator rejects missing required values", () => {
  const result = runValidation({
    MONGO_URI: "",
  });

  assert.equal(result.status, 1);

  assert.match(result.stderr, /MONGO_URI/);
});

test("Environment validator rejects short JWT secret", () => {
  const result = runValidation({
    JWT_SECRET: "short-secret",
  });

  assert.equal(result.status, 1);

  assert.match(result.stderr, /kamida 32 ta belgidan/);
});

test("Environment validator rejects invalid log level", () => {
  const result = runValidation({
    LOG_LEVEL: "verbose",
  });

  assert.equal(result.status, 1);

  assert.match(result.stderr, /LOG_LEVEL noto'g'ri/);
});

test("Environment validator rejects invalid port", () => {
  const result = runValidation({
    PORT: "70000",
  });

  assert.equal(result.status, 1);

  assert.match(result.stderr, /PORT 1 va 65535/);
});

test("Environment validator rejects unsupported client URL protocol", () => {
  const result = runValidation({
    CLIENT_URL: "ftp://localhost:5173",
  });

  assert.equal(result.status, 1);

  assert.match(result.stderr, /faqat http yoki https/);
});

test("Environment validator rejects invalid recaptcha score", () => {
  const result = runValidation({
    RECAPTCHA_MIN_SCORE: "1.5",
  });

  assert.equal(result.status, 1);

  assert.match(result.stderr, /0 va 1 oralig'idagi son/);
});
