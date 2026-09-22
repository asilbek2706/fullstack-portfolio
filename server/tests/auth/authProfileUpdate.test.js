process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  afterEach,
} = require("node:test");

const Admin = require("../../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const originalFindByIdAndUpdate =
  Admin.findByIdAndUpdate;
const originalGenSalt = bcrypt.genSalt;
const originalHash = bcrypt.hash;
const originalSign = jwt.sign;

const {
  updateMe,
} = require("../../controllers/authController");

const adminId =
  "507f1f77bcf86cd799439011";

afterEach(() => {
  Admin.findByIdAndUpdate =
    originalFindByIdAndUpdate;
  bcrypt.genSalt = originalGenSalt;
  bcrypt.hash = originalHash;
  jwt.sign = originalSign;
});

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  cookies: [],

  status(code) {
    this.statusCode = code;
    return this;
  },

  json(payload) {
    this.body = payload;
    return this;
  },

  cookie(name, value, options) {
    this.cookies.push({
      name,
      value,
      options,
    });

    return this;
  },
});

const runUpdateMe = async ({
  body = {},
  user,
  admin,
} = {}) => {
  const req = {
    body,
  };

  if (user !== undefined) {
    req.user = user;
  }

  if (admin !== undefined) {
    req.admin = admin;
  }

  const res = createResponse();

  await updateMe(req, res);

  return res;
};

test("Profile update requires authenticated admin identity", async () => {
  let databaseCalled = false;

  Admin.findByIdAndUpdate = () => {
    databaseCalled = true;
  };

  const res = await runUpdateMe({
    body: {
      username: "updated",
    },
  });

  assert.equal(res.statusCode, 401);
  assert.equal(databaseCalled, false);

  assert.equal(
    res.body.message,
    "Foydalanuvchi aniqlanmadi, iltimos qayta login qiling!",
  );
});

test("Profile update rejects short password before database query", async () => {
  let databaseCalled = false;

  Admin.findByIdAndUpdate = () => {
    databaseCalled = true;
  };

  const res = await runUpdateMe({
    user: {
      _id: adminId,
    },
    body: {
      password: "short",
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(databaseCalled, false);

  assert.equal(
    res.body.message,
    "Parol kamida 8 ta belgi bo'lishi shart!",
  );
});

test("Profile update normalizes username and email without revoking session", async () => {
  let receivedId;
  let receivedOperation;
  let receivedOptions;

  const updatedAdmin = {
    _id: adminId,
    username: "updated-admin",
    email: "updated@example.com",
    role: "admin",
  };

  Admin.findByIdAndUpdate = (
    id,
    operation,
    options,
  ) => {
    receivedId = id;
    receivedOperation = operation;
    receivedOptions = options;

    return Promise.resolve(updatedAdmin);
  };

  const res = await runUpdateMe({
    admin: {
      _id: adminId,
    },
    body: {
      username: "  updated-admin  ",
      email: " UPDATED@EXAMPLE.COM ",
    },
  });

  assert.equal(receivedId, adminId);

  assert.deepEqual(receivedOperation, {
    $set: {
      username: "updated-admin",
      email: "updated@example.com",
    },
  });

  assert.deepEqual(receivedOptions, {
    new: true,
    runValidators: true,
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.cookies.length, 0);

  assert.deepEqual(res.body.data, {
    id: adminId,
    username: "updated-admin",
    email: "updated@example.com",
    role: "admin",
  });
});

test("Profile update returns 404 when admin disappears", async () => {
  Admin.findByIdAndUpdate =
    () => Promise.resolve(null);

  const res = await runUpdateMe({
    user: {
      _id: adminId,
    },
    body: {
      username: "updated-admin",
    },
  });

  assert.equal(res.statusCode, 404);
  assert.equal(
    res.body.message,
    "Admin topilmadi.",
  );

  assert.equal(res.cookies.length, 0);
});

test("Password update hashes password, revokes old sessions and renews current cookie", async () => {
  bcrypt.genSalt = async (rounds) => {
    assert.equal(rounds, 10);
    return "profile-salt";
  };

  bcrypt.hash = async (
    password,
    salt,
  ) => {
    assert.equal(
      password,
      "new-secure-password",
    );
    assert.equal(salt, "profile-salt");

    return "new-password-hash";
  };

  let receivedId;
  let receivedOperation;
  let receivedOptions;
  let receivedSelect;

  const updatedAdmin = {
    _id: adminId,
    username: "asilbek",
    email: "asilbek@mail.ru",
    role: "superadmin",
    tokenVersion: 6,
  };

  Admin.findByIdAndUpdate = (
    id,
    operation,
    options,
  ) => {
    receivedId = id;
    receivedOperation = operation;
    receivedOptions = options;

    return {
      async select(value) {
        receivedSelect = value;
        return updatedAdmin;
      },
    };
  };

  let tokenPayload;
  let tokenOptions;

  jwt.sign = (
    payload,
    secret,
    options,
  ) => {
    assert.equal(typeof secret, "string");
    assert.ok(secret.length >= 32);

    tokenPayload = payload;
    tokenOptions = options;

    return "renewed-session-token";
  };

  const res = await runUpdateMe({
    user: {
      _id: adminId,
    },
    body: {
      password:
        "new-secure-password",
    },
  });

  assert.equal(receivedId, adminId);

  assert.deepEqual(receivedOperation, {
    $set: {
      password: "new-password-hash",
    },
    $inc: {
      tokenVersion: 1,
    },
  });

  assert.deepEqual(receivedOptions, {
    new: true,
    runValidators: true,
  });

  assert.equal(
    receivedSelect,
    "+tokenVersion",
  );

  assert.deepEqual(tokenPayload, {
    id: adminId,
    tokenVersion: 6,
  });

  assert.deepEqual(tokenOptions, {
    algorithm: "HS256",
    expiresIn: "1d",
    issuer: "portfolio-api",
    audience: "portfolio-admin",
  });

  assert.equal(res.cookies.length, 1);
  assert.equal(
    res.cookies[0].name,
    "token",
  );
  assert.equal(
    res.cookies[0].value,
    "renewed-session-token",
  );

  assert.equal(
    res.cookies[0].options.httpOnly,
    true,
  );
  assert.equal(
    res.cookies[0].options.maxAge,
    24 * 60 * 60 * 1000,
  );

  assert.equal(res.statusCode, 200);
  assert.equal(
    Object.hasOwn(
      res.body.data,
      "password",
    ),
    false,
  );

  assert.equal(
    Object.hasOwn(
      res.body.data,
      "tokenVersion",
    ),
    false,
  );
});

test("Profile update returns safe response after database error", async () => {
  Admin.findByIdAndUpdate = () => {
    throw new Error(
      "Sensitive profile update failure",
    );
  };

  const res = await runUpdateMe({
    user: {
      _id: adminId,
    },
    body: {
      username: "updated-admin",
    },
  });

  assert.equal(res.statusCode, 500);

  assert.deepEqual(res.body, {
    message:
      "Serverda ichki xatolik yuz berdi.",
  });

  assert.equal(
    JSON.stringify(res.body).includes(
      "Sensitive profile update failure",
    ),
    false,
  );

  assert.equal(res.cookies.length, 0);
});
