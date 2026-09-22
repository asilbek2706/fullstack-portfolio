process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const { afterEach } = require("node:test");

const bcrypt = require("bcryptjs");
const Contact = require("../models/Contact");
const Admin = require("../models/Admin");
const {
  deleteContact,
  clearAllContacts,
} = require("../controllers/contactController");

const originalFindByIdAndDelete =
  Contact.findByIdAndDelete;
const originalDeleteMany = Contact.deleteMany;
const originalAdminFindById = Admin.findById;
const originalBcryptCompare = bcrypt.compare;

afterEach(() => {
  Contact.findByIdAndDelete =
    originalFindByIdAndDelete;
  Contact.deleteMany = originalDeleteMany;
  Admin.findById = originalAdminFindById;
  bcrypt.compare = originalBcryptCompare;
});

const validContactId =
  "507f1f77bcf86cd799439011";

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
  handler,
  {
    params = {},
    body = {},
    admin = {
      _id: "507f1f77bcf86cd799439012",
    },
  } = {},
) => {
  const req = {
    params,
    body,
    admin,
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

test("Contact delete rejects invalid ID before database query", async () => {
  let databaseCalled = false;

  Contact.findByIdAndDelete = async () => {
    databaseCalled = true;
  };

  const result = await runController(
    deleteContact,
    {
      params: {
        id: "not-valid-id",
      },
    },
  );

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.res.body.success, false);
  assert.equal(databaseCalled, false);
  assert.equal(result.nextCalled, false);
});

test("Contact delete returns 404 when contact does not exist", async () => {
  Contact.findByIdAndDelete = async (id) => {
    assert.equal(id, validContactId);
    return null;
  };

  const result = await runController(
    deleteContact,
    {
      params: {
        id: validContactId,
      },
    },
  );

  assert.equal(result.res.statusCode, 404);
  assert.equal(result.res.body.success, false);
  assert.equal(result.nextCalled, false);
});

test("Contact delete removes an existing contact", async () => {
  const deletedContact = {
    _id: validContactId,
    name: "Test User",
    phone: "+998901234567",
    message: "Test message",
  };

  Contact.findByIdAndDelete = async () =>
    deletedContact;

  const result = await runController(
    deleteContact,
    {
      params: {
        id: validContactId,
      },
    },
  );

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);
  assert.equal(
    result.res.body.data,
    deletedContact,
  );
  assert.match(
    result.res.body.message,
    /Test User/,
  );
  assert.equal(result.nextCalled, false);
});

test("Contact delete forwards database errors", async () => {
  const databaseError =
    new Error("Delete query failed");

  Contact.findByIdAndDelete = async () => {
    throw databaseError;
  };

  const result = await runController(
    deleteContact,
    {
      params: {
        id: validContactId,
      },
    },
  );

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(result.res.body, undefined);
});

test("Clear contacts requires exact confirmation", async () => {
  let adminQueried = false;
  let deleteCalled = false;

  Admin.findById = () => {
    adminQueried = true;
  };

  Contact.deleteMany = async () => {
    deleteCalled = true;
  };

  const result = await runController(
    clearAllContacts,
    {
      body: {
        confirmation: "DELETE_CONTACTS",
        password: "correct-password",
      },
    },
  );

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.res.body.success, false);
  assert.equal(adminQueried, false);
  assert.equal(deleteCalled, false);
});

test("Clear contacts rejects invalid password input", async () => {
  let adminQueried = false;
  let deleteCalled = false;

  Admin.findById = () => {
    adminQueried = true;
  };

  Contact.deleteMany = async () => {
    deleteCalled = true;
  };

  for (const password of [
    "",
    null,
    12345678,
    "A".repeat(129),
  ]) {
    const result = await runController(
      clearAllContacts,
      {
        body: {
          confirmation: "DELETE_ALL_CONTACTS",
          password,
        },
      },
    );

    assert.equal(result.res.statusCode, 400);
    assert.equal(result.res.body.success, false);
  }

  assert.equal(adminQueried, false);
  assert.equal(deleteCalled, false);
});

test("Clear contacts rejects missing admin account", async () => {
  let selectedFields;
  let deleteCalled = false;

  Admin.findById = () => ({
    async select(fields) {
      selectedFields = fields;
      return null;
    },
  });

  Contact.deleteMany = async () => {
    deleteCalled = true;
  };

  const result = await runController(
    clearAllContacts,
    {
      body: {
        confirmation: "DELETE_ALL_CONTACTS",
        password: "correct-password",
      },
    },
  );

  assert.equal(selectedFields, "+password");
  assert.equal(result.res.statusCode, 401);
  assert.equal(result.res.body.success, false);
  assert.equal(deleteCalled, false);
});

test("Clear contacts rejects incorrect admin password", async () => {
  let deleteCalled = false;

  Admin.findById = () => ({
    async select() {
      return {
        _id: "admin-id",
        password: "$2b$10$stored-hash",
      };
    },
  });

  bcrypt.compare = async (
    plainPassword,
    storedPassword,
  ) => {
    assert.equal(
      plainPassword,
      "wrong-password",
    );
    assert.equal(
      storedPassword,
      "$2b$10$stored-hash",
    );
    return false;
  };

  Contact.deleteMany = async () => {
    deleteCalled = true;
  };

  const result = await runController(
    clearAllContacts,
    {
      body: {
        confirmation: "DELETE_ALL_CONTACTS",
        password: "wrong-password",
      },
    },
  );

  assert.equal(result.res.statusCode, 403);
  assert.equal(result.res.body.success, false);
  assert.equal(deleteCalled, false);
});

test("Clear contacts deletes all records after password verification", async () => {
  let receivedAdminId;
  let receivedDeleteFilter;

  Admin.findById = (adminId) => {
    receivedAdminId = adminId;

    return {
      async select(fields) {
        assert.equal(fields, "+password");

        return {
          _id: adminId,
          password: "$2b$10$stored-hash",
        };
      },
    };
  };

  bcrypt.compare = async () => true;

  Contact.deleteMany = async (filter) => {
    receivedDeleteFilter = filter;

    return {
      deletedCount: 7,
    };
  };

  const result = await runController(
    clearAllContacts,
    {
      body: {
        confirmation: "DELETE_ALL_CONTACTS",
        password: "correct-password",
      },
    },
  );

  assert.equal(
    receivedAdminId,
    "507f1f77bcf86cd799439012",
  );
  assert.deepEqual(receivedDeleteFilter, {});

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);
  assert.equal(result.res.body.deletedCount, 7);
  assert.equal(result.nextCalled, false);
});

test("Clear contacts forwards deletion errors", async () => {
  const deletionError =
    new Error("Delete many failed");

  Admin.findById = () => ({
    async select() {
      return {
        password: "$2b$10$stored-hash",
      };
    },
  });

  bcrypt.compare = async () => true;

  Contact.deleteMany = async () => {
    throw deletionError;
  };

  const result = await runController(
    clearAllContacts,
    {
      body: {
        confirmation: "DELETE_ALL_CONTACTS",
        password: "correct-password",
      },
    },
  );

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, deletionError);
  assert.equal(result.res.body, undefined);
});
