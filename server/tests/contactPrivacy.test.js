process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { afterEach } = require("node:test");

const Contact = require("../models/Contact");
const {
  getContactAnswer,
  getContactAnswers,
} = require("../controllers/contactController");

const originalFindOne = Contact.findOne;
const originalFind = Contact.find;
const originalCountDocuments = Contact.countDocuments;

afterEach(() => {
  Contact.findOne = originalFindOne;
  Contact.find = originalFind;
  Contact.countDocuments = originalCountDocuments;
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

const runHandler = async (
  handler,
  {
    params = {},
    query = {},
  } = {},
) => {
  const req = {
    params,
    query,
  };

  const res = createResponse();

  let nextCalled = false;
  let nextError;

  await handler(req, res, (error) => {
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

test("Tracking endpoint rejects invalid token format", async () => {
  let databaseCalled = false;

  Contact.findOne = async () => {
    databaseCalled = true;
  };

  const result = await runHandler(
    getContactAnswer,
    {
      params: {
        token: "not-valid-token",
      },
    },
  );

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.res.body.success, false);
  assert.equal(databaseCalled, false);
  assert.equal(result.nextCalled, false);
});

test("Tracking endpoint hashes token and returns private-safe response", async () => {
  const token = "A".repeat(43);
  let receivedFilter;

  const createdAt = new Date("2026-09-20T10:00:00.000Z");
  const updatedAt = new Date("2026-09-21T11:00:00.000Z");

  Contact.findOne = async (filter) => {
    receivedFilter = filter;

    return {
      _id: "contact-private-id",
      name: "Private User",
      phone: "+998901234567",
      message: "Private message",
      trackingTokenHash: "must-not-leak",
      telegramMessageId: 999,
      telegramDeliveryStatus: "sent",
      isPublic: false,
      isAnswered: true,
      answer: "Sizga tez orada bog‘lanamiz.",
      createdAt,
      updatedAt,
    };
  };

  const result = await runHandler(
    getContactAnswer,
    {
      params: { token },
    },
  );

  const expectedHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  assert.deepEqual(receivedFilter, {
    trackingTokenHash: expectedHash,
  });

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);

  assert.deepEqual(result.res.body.data, {
    isAnswered: true,
    answer: "Sizga tez orada bog‘lanamiz.",
    createdAt,
    updatedAt,
  });

  assert.equal(
    Object.hasOwn(result.res.body.data, "name"),
    false,
  );
  assert.equal(
    Object.hasOwn(result.res.body.data, "phone"),
    false,
  );
  assert.equal(
    Object.hasOwn(result.res.body.data, "message"),
    false,
  );
  assert.equal(
    Object.hasOwn(result.res.body.data, "trackingTokenHash"),
    false,
  );
  assert.equal(
    Object.hasOwn(result.res.body.data, "telegramMessageId"),
    false,
  );
  assert.equal(result.nextCalled, false);
});

test("Tracking endpoint returns 404 for unknown token", async () => {
  Contact.findOne = async () => null;

  const result = await runHandler(
    getContactAnswer,
    {
      params: {
        token: "B".repeat(43),
      },
    },
  );

  assert.equal(result.res.statusCode, 404);
  assert.equal(result.res.body.success, false);
  assert.equal(result.nextCalled, false);
});

test("Tracking endpoint forwards database errors", async () => {
  const databaseError =
    new Error("Tracking lookup failed");

  Contact.findOne = async () => {
    throw databaseError;
  };

  const result = await runHandler(
    getContactAnswer,
    {
      params: {
        token: "C".repeat(43),
      },
    },
  );

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(result.res.body, undefined);
});

test("Public answers only query answered and published contacts", async () => {
  const publicContacts = [
    {
      _id: "public-contact-id",
      name: "Public User",
      message: "Public question",
      answer: "Public answer",
      updatedAt: new Date("2026-09-21T12:00:00.000Z"),
    },
  ];

  let receivedFindFilter;
  let receivedCountFilter;
  let selectedFields;
  let sortValue;
  let skipValue;
  let limitValue;

  const queryChain = {
    select(value) {
      selectedFields = value;
      return this;
    },

    sort(value) {
      sortValue = value;
      return this;
    },

    skip(value) {
      skipValue = value;
      return this;
    },

    limit(value) {
      limitValue = value;
      return this;
    },

    async lean() {
      return publicContacts;
    },
  };

  Contact.find = (filter) => {
    receivedFindFilter = filter;
    return queryChain;
  };

  Contact.countDocuments = async (filter) => {
    receivedCountFilter = filter;
    return 3;
  };

  const result = await runHandler(
    getContactAnswers,
    {
      query: {
        page: "2",
        limit: "1",
      },
    },
  );

  const expectedFilter = {
    isAnswered: true,
    isPublic: true,
  };

  assert.deepEqual(
    receivedFindFilter,
    expectedFilter,
  );
  assert.deepEqual(
    receivedCountFilter,
    expectedFilter,
  );

  assert.equal(
    selectedFields,
    "name message answer updatedAt",
  );
  assert.deepEqual(sortValue, {
    updatedAt: -1,
  });
  assert.equal(skipValue, 1);
  assert.equal(limitValue, 1);

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);
  assert.equal(result.res.body.count, 1);

  assert.deepEqual(result.res.body.pagination, {
    page: 2,
    limit: 1,
    total: 3,
    totalPages: 3,
  });

  assert.deepEqual(
    result.res.body.data,
    publicContacts,
  );
  assert.equal(result.nextCalled, false);
});

test("Public answers forward database errors", async () => {
  const databaseError =
    new Error("Public contact query failed");

  const queryChain = {
    select() {
      return this;
    },

    sort() {
      return this;
    },

    skip() {
      return this;
    },

    limit() {
      return this;
    },

    async lean() {
      throw databaseError;
    },
  };

  Contact.find = () => queryChain;
  Contact.countDocuments = async () => 0;

  const result = await runHandler(
    getContactAnswers,
    {
      query: {},
    },
  );

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(result.res.body, undefined);
});
