process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const { afterEach } = require("node:test");

const FAQ = require("../../models/Faq");

const originalFind = FAQ.find;
const originalCreate = FAQ.create;
const originalFindById = FAQ.findById;
const originalFindByIdAndDelete = FAQ.findByIdAndDelete;

const {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} = require("../../controllers/faqController");

const faqId = "507f1f77bcf86cd799439011";

afterEach(() => {
  FAQ.find = originalFind;
  FAQ.create = originalCreate;
  FAQ.findById = originalFindById;
  FAQ.findByIdAndDelete = originalFindByIdAndDelete;
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

const runController = async (
  controller,
  {
    body = {},
    id = faqId,
    admin = {
      _id: "admin-id",
    },
  } = {},
) => {
  const req = {
    body,
    params: {
      id,
    },
    admin,
  };

  const res = createResponse();

  let nextCalled = false;
  let nextError;

  await controller(req, res, (error) => {
    nextCalled = true;
    nextError = error;
  });

  return {
    res,
    nextCalled,
    nextError,
  };
};

test("FAQ list returns sorted public records", async () => {
  const faqs = [
    {
      _id: "faq-one",
      question: "First question?",
      answer: "First answer.",
      order: 1,
    },
    {
      _id: "faq-two",
      question: "Second question?",
      answer: "Second answer.",
      order: 2,
    },
  ];

  const calls = {};

  FAQ.find = () => ({
    sort(value) {
      calls.sort = value;
      return this;
    },

    select(value) {
      calls.select = value;
      return this;
    },

    async lean() {
      calls.lean = true;
      return faqs;
    },
  });

  const result = await runController(getFAQs);

  assert.deepEqual(calls.sort, {
    order: 1,
    createdAt: 1,
  });

  assert.equal(calls.select, "-createdBy");
  assert.equal(calls.lean, true);

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.count, 2);
  assert.deepEqual(result.res.body.data, faqs);

  assert.equal(result.nextCalled, false);
});

test("FAQ list forwards database errors", async () => {
  const databaseError = new Error("FAQ list failed");

  FAQ.find = () => ({
    sort() {
      return this;
    },

    select() {
      return this;
    },

    async lean() {
      throw databaseError;
    },
  });

  const result = await runController(getFAQs);

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(result.res.body, undefined);
});

test("FAQ creation requires question and answer", async () => {
  let databaseCalled = false;

  FAQ.create = async () => {
    databaseCalled = true;
  };

  const result = await runController(createFAQ, {
    body: {
      question: "Question only",
    },
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(databaseCalled, false);
});

test("FAQ creation normalizes data and hides createdBy", async () => {
  let receivedPayload;

  FAQ.create = async (payload) => {
    receivedPayload = payload;

    return {
      _id: "new-faq-id",
      ...payload,
    };
  };

  const result = await runController(createFAQ, {
    body: {
      question: "  What is Node.js?  ",
      answer: "  JavaScript runtime.  ",
    },
    admin: {
      _id: "creator-admin-id",
    },
  });

  assert.deepEqual(receivedPayload, {
    question: "What is Node.js?",
    answer: "JavaScript runtime.",
    order: 0,
    createdBy: "creator-admin-id",
  });

  assert.equal(result.res.statusCode, 201);
  assert.equal(result.res.body.success, true);

  assert.equal(Object.hasOwn(result.res.body.data, "createdBy"), false);

  assert.equal(result.res.body.data.question, "What is Node.js?");
});

test("FAQ creation preserves explicit zero-based order", async () => {
  let receivedPayload;

  FAQ.create = async (payload) => {
    receivedPayload = payload;

    return {
      ...payload,

      toObject() {
        return {
          ...payload,
        };
      },
    };
  };

  const result = await runController(createFAQ, {
    body: {
      question: "Ordered question?",
      answer: "Ordered answer.",
      order: 3,
    },
  });

  assert.equal(receivedPayload.order, 3);
  assert.equal(result.res.body.data.order, 3);

  assert.equal(Object.hasOwn(result.res.body.data, "createdBy"), false);
});

test("FAQ update rejects invalid ID before database query", async () => {
  let databaseCalled = false;

  FAQ.findById = async () => {
    databaseCalled = true;
  };

  const result = await runController(updateFAQ, {
    id: "invalid-id",
    body: {
      question: "Updated question?",
    },
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(databaseCalled, false);
});

test("FAQ update returns 404 when record does not exist", async () => {
  FAQ.findById = async () => null;

  const result = await runController(updateFAQ, {
    body: {
      question: "Updated question?",
    },
  });

  assert.equal(result.res.statusCode, 404);
  assert.equal(result.res.body.message, "Bunday FAQ topilmadi.");
});

test("FAQ update changes supplied fields and hides createdBy", async () => {
  let saveCalled = false;

  const faq = {
    _id: faqId,
    question: "Old question?",
    answer: "Old answer.",
    order: 1,
    createdBy: "private-admin-id",

    async save() {
      saveCalled = true;
    },

    toObject() {
      return {
        _id: this._id,
        question: this.question,
        answer: this.answer,
        order: this.order,
        createdBy: this.createdBy,
      };
    },
  };

  FAQ.findById = async () => faq;

  const result = await runController(updateFAQ, {
    body: {
      question: "  Updated question?  ",
      order: 5,
    },
  });

  assert.equal(saveCalled, true);
  assert.equal(faq.question, "Updated question?");
  assert.equal(faq.answer, "Old answer.");
  assert.equal(faq.order, 5);

  assert.equal(result.res.statusCode, 200);

  assert.equal(Object.hasOwn(result.res.body.data, "createdBy"), false);
});

test("FAQ deletion rejects invalid ID before database query", async () => {
  let databaseCalled = false;

  FAQ.findByIdAndDelete = async () => {
    databaseCalled = true;
  };

  const result = await runController(deleteFAQ, {
    id: "invalid-id",
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(databaseCalled, false);
});

test("FAQ deletion returns 404 for missing record", async () => {
  FAQ.findByIdAndDelete = async () => null;

  const result = await runController(deleteFAQ);

  assert.equal(result.res.statusCode, 404);
  assert.equal(result.res.body.message, "O'chirmoqchi bo'lgan FAQ topilmadi.");
});

test("FAQ deletion removes existing record", async () => {
  let receivedId;

  FAQ.findByIdAndDelete = async (id) => {
    receivedId = id;

    return {
      _id: id,
    };
  };

  const result = await runController(deleteFAQ);

  assert.equal(receivedId, faqId);
  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);
  assert.equal(result.nextCalled, false);
});

test("FAQ mutation forwards database errors", async () => {
  const databaseError = new Error("FAQ update failed");

  FAQ.findById = async () => {
    throw databaseError;
  };

  const result = await runController(updateFAQ, {
    body: {
      question: "Updated question?",
    },
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(result.res.body, undefined);
});
