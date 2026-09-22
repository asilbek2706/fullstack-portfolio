process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const { afterEach } = require("node:test");

const Contact = require("../../models/Contact");

const originalFind = Contact.find;
const originalCountDocuments = Contact.countDocuments;

const {
  getAllQuestionsAnswers,
} = require("../../controllers/contactController");

afterEach(() => {
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

const runList = async ({ query = {}, admin, user } = {}) => {
  const req = {
    query,
  };

  if (admin !== undefined) {
    req.admin = admin;
  }

  if (user !== undefined) {
    req.user = user;
  }

  const res = createResponse();

  let nextCalled = false;
  let nextError;

  await getAllQuestionsAnswers(req, res, (error) => {
    nextCalled = true;
    nextError = error;
  });

  return {
    res,
    nextCalled,
    nextError,
  };
};

const mockContactList = ({ contacts, total }) => {
  const calls = {};

  Contact.find = () => ({
    sort(value) {
      calls.sort = value;
      return this;
    },

    skip(value) {
      calls.skip = value;
      return this;
    },

    limit(value) {
      calls.limit = value;
      return this;
    },

    async lean() {
      calls.lean = true;
      return contacts;
    },
  });

  Contact.countDocuments = async () => total;

  return calls;
};

test("Contact admin list uses default pagination", async () => {
  const contacts = [
    {
      _id: "contact-one",
      name: "First user",
    },
    {
      _id: "contact-two",
      name: "Second user",
    },
  ];

  const calls = mockContactList({
    contacts,
    total: 2,
  });

  const result = await runList({
    admin: {
      _id: "admin-id",
    },
  });

  assert.deepEqual(calls.sort, {
    createdAt: -1,
  });

  assert.equal(calls.skip, 0);
  assert.equal(calls.limit, 20);
  assert.equal(calls.lean, true);

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);
  assert.equal(result.res.body.count, 2);

  assert.deepEqual(result.res.body.pagination, {
    page: 1,
    limit: 20,
    total: 2,
    totalPages: 1,
  });

  assert.deepEqual(result.res.body.data, contacts);

  assert.equal(result.nextCalled, false);
});

test("Contact admin list applies requested pagination", async () => {
  const contacts = [
    {
      _id: "contact-three",
      name: "Third user",
    },
  ];

  const calls = mockContactList({
    contacts,
    total: 5,
  });

  const result = await runList({
    query: {
      page: "3",
      limit: "2",
    },
    user: {
      _id: "admin-id",
    },
  });

  assert.equal(calls.skip, 4);
  assert.equal(calls.limit, 2);

  assert.deepEqual(result.res.body.pagination, {
    page: 3,
    limit: 2,
    total: 5,
    totalPages: 3,
  });

  assert.equal(result.res.body.count, 1);
  assert.equal(result.nextCalled, false);
});

test("Contact admin list rejects invalid pagination before database query", async () => {
  let databaseCalled = false;

  Contact.find = () => {
    databaseCalled = true;
  };

  Contact.countDocuments = async () => {
    databaseCalled = true;
  };

  const result = await runList({
    query: {
      page: "1.5",
      limit: "20",
    },
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError.statusCode, 400);

  assert.equal(
    result.nextError.message,
    "page 1 yoki undan katta butun son bo'lishi kerak.",
  );

  assert.equal(databaseCalled, false);
  assert.equal(result.res.body, undefined);
});

test("Contact admin list forwards database errors", async () => {
  const databaseError = new Error("Contact list failed");

  Contact.find = () => ({
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
  });

  Contact.countDocuments = async () => 0;

  const result = await runList();

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);

  assert.equal(result.res.body, undefined);
});
