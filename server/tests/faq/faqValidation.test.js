process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");

const validateFaq = require("../../middlewares/validateFaq");

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

const runValidation = ({ method = "POST", body } = {}) => {
  const req = {
    method,
    body,
  };
  const res = createResponse();
  let nextCalled = false;

  validateFaq(req, res, () => {
    nextCalled = true;
  });

  return {
    req,
    res,
    nextCalled,
  };
};

test("FAQ create requires question and answer", () => {
  const { res, nextCalled } = runValidation({
    body: {
      question: "Savol mavjudmi?",
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /Savol va javob/);
});

test("FAQ rejects unknown fields", () => {
  const { res, nextCalled } = runValidation({
    body: {
      question: "Test savol?",
      answer: "Test javob.",
      createdBy: "fake-admin",
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.equal(res.body.message, "Ruxsat etilmagan maydonlar: createdBy");
});

test("FAQ rejects non-string question", () => {
  const { res, nextCalled } = runValidation({
    body: {
      question: {
        value: "Test",
      },
      answer: "Test javob.",
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.equal(res.body.message, "question matn ko'rinishida bo'lishi kerak.");
});

test("FAQ rejects too short question", () => {
  const { res, nextCalled } = runValidation({
    body: {
      question: "Hi",
      answer: "Test javob.",
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /3–300/);
});

test("FAQ rejects too long answer", () => {
  const { res, nextCalled } = runValidation({
    body: {
      question: "Test savol?",
      answer: "A".repeat(3001),
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /2–3000/);
});

test("FAQ rejects invalid order", () => {
  const { res, nextCalled } = runValidation({
    body: {
      question: "Test savol?",
      answer: "Test javob.",
      order: 1.5,
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /butun son/);
});

test("FAQ patch rejects empty body", () => {
  const { res, nextCalled } = runValidation({
    method: "PATCH",
    body: {},
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /kamida bitta maydon/);
});

test("FAQ create trims valid fields", () => {
  const { req, res, nextCalled } = runValidation({
    body: {
      question: "  Test savol?  ",
      answer: "  Test javob.  ",
      order: 4,
    },
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.deepEqual(req.body, {
    question: "Test savol?",
    answer: "Test javob.",
    order: 4,
  });
});

test("FAQ patch accepts one valid field", () => {
  const { req, res, nextCalled } = runValidation({
    method: "PATCH",
    body: {
      answer: "  Yangilangan javob.  ",
    },
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.deepEqual(req.body, {
    answer: "Yangilangan javob.",
  });
});
