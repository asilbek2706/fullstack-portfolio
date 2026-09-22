process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const {
  test,
  afterEach,
} = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const { env } = require("../config/env");
const {
  protect,
  restrictToSuperAdmin,
} = require("../middlewares/authMiddleware");

const originalFindById = Admin.findById;

afterEach(() => {
  Admin.findById = originalFindById;
});

const createToken = ({
  id = "507f1f77bcf86cd799439011",
  tokenVersion = 0,
} = {}) =>
  jwt.sign(
    { id, tokenVersion },
    env.jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: "5m",
      issuer: "portfolio-api",
      audience: "portfolio-admin",
    },
  );

const mockAdminLookup = (admin) => {
  Admin.findById = () => ({
    select: async () => admin,
  });
};

const createRequest = ({
  token,
  useCookie = false,
  method = "GET",
  origin,
} = {}) => {
  const headers = {};

  if (origin) {
    headers.origin = origin;
  }

  if (token && !useCookie) {
    headers.authorization = `Bearer ${token}`;
  }

  return {
    method,
    cookies:
      token && useCookie
        ? { token }
        : {},
    get(name) {
      return headers[name.toLowerCase()];
    },
    header(name) {
      return headers[name.toLowerCase()];
    },
  };
};

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

const runProtect = async (options = {}) => {
  const req = createRequest(options);
  const res = createResponse();
  let nextCalled = false;

  await protect(req, res, () => {
    nextCalled = true;
  });

  return {
    req,
    res,
    nextCalled,
  };
};

test("protect rejects request without token", async () => {
  const { res, nextCalled } = await runProtect();

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /Token topilmadi/);
});

test("protect rejects invalid JWT", async () => {
  const { res, nextCalled } = await runProtect({
    token: "invalid.jwt.token",
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /Token yaroqsiz/);
});

test("protect rejects token when admin no longer exists", async () => {
  mockAdminLookup(null);

  const { res, nextCalled } = await runProtect({
    token: createToken(),
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /mavjud emas/);
});

test("protect rejects stale tokenVersion", async () => {
  mockAdminLookup({
    _id: "507f1f77bcf86cd799439011",
    role: "superadmin",
    tokenVersion: 2,
  });

  const { res, nextCalled } = await runProtect({
    token: createToken({ tokenVersion: 1 }),
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /Sessiya bekor qilingan/);
});

test("protect accepts current bearer token", async () => {
  const admin = {
    _id: "507f1f77bcf86cd799439011",
    username: "asilbek",
    role: "superadmin",
    tokenVersion: 3,
  };

  mockAdminLookup(admin);

  const { req, res, nextCalled } = await runProtect({
    token: createToken({ tokenVersion: 3 }),
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.equal(req.admin, admin);
  assert.equal(req.user, admin);
});

test("cookie unsafe request without Origin is rejected", async () => {
  const { res, nextCalled } = await runProtect({
    token: createToken(),
    useCookie: true,
    method: "PATCH",
  });

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /manbasi tasdiqlanmadi/);
});

test("cookie unsafe request with allowed Origin succeeds", async () => {
  const admin = {
    _id: "507f1f77bcf86cd799439011",
    role: "superadmin",
    tokenVersion: 0,
  };

  mockAdminLookup(admin);

  const { res, nextCalled } = await runProtect({
    token: createToken(),
    useCookie: true,
    method: "PATCH",
    origin: "http://localhost:5173",
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
});

test("bearer unsafe request does not require CSRF Origin", async () => {
  mockAdminLookup({
    _id: "507f1f77bcf86cd799439011",
    role: "admin",
    tokenVersion: 0,
  });

  const { res, nextCalled } = await runProtect({
    token: createToken(),
    method: "DELETE",
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
});

test("restrictToSuperAdmin rejects ordinary admin", () => {
  const req = {
    admin: {
      role: "admin",
    },
  };
  const res = createResponse();
  let nextCalled = false;

  restrictToSuperAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
});

test("restrictToSuperAdmin accepts superadmin", () => {
  const req = {
    admin: {
      role: "superadmin",
    },
  };
  const res = createResponse();
  let nextCalled = false;

  restrictToSuperAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
});
