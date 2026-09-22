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

const originalFindOne = Admin.findOne;
const originalFindById = Admin.findById;
const originalCompare = bcrypt.compare;
const originalSign = jwt.sign;

const {
  loginAdmin,
  logoutAdmin,
  getMe,
} = require("../../controllers/authController");

afterEach(() => {
  Admin.findOne = originalFindOne;
  Admin.findById = originalFindById;
  bcrypt.compare = originalCompare;
  jwt.sign = originalSign;
});

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  cookies: [],
  clearedCookies: [],

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

  clearCookie(name, options) {
    this.clearedCookies.push({
      name,
      options,
    });

    return this;
  },
});

const runController = async (
  controller,
  req,
) => {
  const res = createResponse();

  await controller(req, res);

  return res;
};

const mockFindOne = (result) => {
  let receivedFilter;
  let receivedSelect;

  Admin.findOne = (filter) => {
    receivedFilter = filter;

    return {
      async select(value) {
        receivedSelect = value;
        return result;
      },
    };
  };

  return {
    getFilter: () => receivedFilter,
    getSelect: () => receivedSelect,
  };
};

const mockFindById = (result) => {
  let receivedId;
  let receivedSelect;

  Admin.findById = (id) => {
    receivedId = id;

    return {
      async select(value) {
        receivedSelect = value;
        return result;
      },
    };
  };

  return {
    getId: () => receivedId,
    getSelect: () => receivedSelect,
  };
};

test("Login rejects missing credentials", async () => {
  let databaseCalled = false;

  Admin.findOne = () => {
    databaseCalled = true;
  };

  const res = await runController(
    loginAdmin,
    {
      body: {},
    },
  );

  assert.equal(res.statusCode, 400);
  assert.equal(
    res.body.message,
    "Login va parolni kiriting!",
  );

  assert.equal(databaseCalled, false);
  assert.equal(res.cookies.length, 0);
});

test("Login rejects unknown admin safely", async () => {
  const query = mockFindOne(null);

  const res = await runController(
    loginAdmin,
    {
      body: {
        username: "  asilbek  ",
        password: "secure-password",
      },
    },
  );

  assert.deepEqual(query.getFilter(), {
    username: "asilbek",
  });

  assert.equal(
    query.getSelect(),
    "+password +tokenVersion",
  );

  assert.equal(res.statusCode, 400);
  assert.equal(
    res.body.message,
    "Login yoki parol noto'g'ri!",
  );

  assert.equal(res.cookies.length, 0);
});

test("Login rejects incorrect password safely", async () => {
  const admin = {
    _id: "admin-id",
    username: "asilbek",
    password: "stored-hash",
  };

  mockFindOne(admin);

  let comparedPassword;
  let comparedHash;

  bcrypt.compare = async (
    password,
    hash,
  ) => {
    comparedPassword = password;
    comparedHash = hash;
    return false;
  };

  const res = await runController(
    loginAdmin,
    {
      body: {
        username: "asilbek",
        password: "wrong-password",
      },
    },
  );

  assert.equal(
    comparedPassword,
    "wrong-password",
  );
  assert.equal(comparedHash, "stored-hash");

  assert.equal(res.statusCode, 400);
  assert.equal(
    res.body.message,
    "Login yoki parol noto'g'ri!",
  );

  assert.equal(res.cookies.length, 0);
});

test("Login creates secure session without exposing token", async () => {
  const admin = {
    _id: "admin-id",
    username: "asilbek",
    email: "asilbek@mail.ru",
    password: "stored-hash",
    role: "superadmin",
    tokenVersion: 3,
  };

  mockFindOne(admin);

  bcrypt.compare = async () => true;

  let tokenPayload;
  let tokenSecret;
  let tokenOptions;

  jwt.sign = (
    payload,
    secret,
    options,
  ) => {
    tokenPayload = payload;
    tokenSecret = secret;
    tokenOptions = options;

    return "signed-session-token";
  };

  const res = await runController(
    loginAdmin,
    {
      body: {
        username: "asilbek",
        password: "correct-password",
      },
    },
  );

  assert.deepEqual(tokenPayload, {
    id: "admin-id",
    tokenVersion: 3,
  });

  assert.equal(
    typeof tokenSecret,
    "string",
  );
  assert.ok(tokenSecret.length >= 32);

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
    "signed-session-token",
  );

  assert.equal(
    res.cookies[0].options.httpOnly,
    true,
  );
  assert.equal(
    res.cookies[0].options.path,
    "/",
  );
  assert.equal(
    res.cookies[0].options.maxAge,
    24 * 60 * 60 * 1000,
  );

  assert.equal(res.statusCode, 200);
  assert.equal(
    Object.hasOwn(res.body, "token"),
    false,
  );

  assert.deepEqual(res.body.user, {
    username: "asilbek",
    email: "asilbek@mail.ru",
  });

  assert.equal(
    res.body.role,
    "superadmin",
  );
});

test("Login uses zero tokenVersion when field is missing", async () => {
  mockFindOne({
    _id: "legacy-admin-id",
    username: "legacy",
    email: "legacy@example.com",
    password: "stored-hash",
    role: "admin",
  });

  bcrypt.compare = async () => true;

  let tokenPayload;

  jwt.sign = (payload) => {
    tokenPayload = payload;
    return "legacy-token";
  };

  const res = await runController(
    loginAdmin,
    {
      body: {
        username: "legacy",
        password: "correct-password",
      },
    },
  );

  assert.deepEqual(tokenPayload, {
    id: "legacy-admin-id",
    tokenVersion: 0,
  });

  assert.equal(res.statusCode, 200);
});

test("Login returns safe 500 response after database error", async () => {
  const databaseError =
    new Error("Sensitive database error");

  Admin.findOne = () => ({
    async select() {
      throw databaseError;
    },
  });

  const res = await runController(
    loginAdmin,
    {
      body: {
        username: "asilbek",
        password: "correct-password",
      },
    },
  );

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    message:
      "Serverda ichki xatolik yuz berdi.",
  });

  assert.equal(
    JSON.stringify(res.body).includes(
      "Sensitive database error",
    ),
    false,
  );

  assert.equal(res.cookies.length, 0);
});

test("Logout clears authentication cookie", async () => {
  const res = await runController(
    logoutAdmin,
    {},
  );

  assert.equal(
    res.clearedCookies.length,
    1,
  );

  assert.equal(
    res.clearedCookies[0].name,
    "token",
  );

  assert.equal(
    res.clearedCookies[0].options.httpOnly,
    true,
  );

  assert.equal(
    res.clearedCookies[0].options.path,
    "/",
  );

  assert.equal(res.statusCode, 200);
  assert.equal(
    res.body.message,
    "Tizimdan muvaffaqiyatli chiqdingiz! 🚪",
  );
});

test("Get me rejects request without authenticated identity", async () => {
  let databaseCalled = false;

  Admin.findById = () => {
    databaseCalled = true;
  };

  const res = await runController(
    getMe,
    {},
  );

  assert.equal(res.statusCode, 401);
  assert.equal(
    res.body.message,
    "Siz tizimga kirmagansiz!",
  );
  assert.equal(databaseCalled, false);
});

test("Get me returns 404 when admin no longer exists", async () => {
  const query = mockFindById(null);

  const res = await runController(
    getMe,
    {
      user: {
        id: "missing-admin-id",
      },
    },
  );

  assert.equal(
    query.getId(),
    "missing-admin-id",
  );
  assert.equal(
    query.getSelect(),
    "-password",
  );

  assert.equal(res.statusCode, 404);
  assert.equal(
    res.body.message,
    "Admin topilmadi!",
  );
});

test("Get me returns only public admin profile", async () => {
  const query = mockFindById({
    _id: "admin-id",
    username: "asilbek",
    email: "asilbek@mail.ru",
    role: "superadmin",
    password: "must-not-leak",
    tokenVersion: 4,
  });

  const res = await runController(
    getMe,
    {
      admin: {
        id: "admin-id",
      },
    },
  );

  assert.equal(
    query.getId(),
    "admin-id",
  );

  assert.deepEqual(res.body, {
    username: "asilbek",
    role: "superadmin",
    email: "asilbek@mail.ru",
  });

  assert.equal(
    Object.hasOwn(res.body, "password"),
    false,
  );

  assert.equal(
    Object.hasOwn(
      res.body,
      "tokenVersion",
    ),
    false,
  );
});

test("Get me returns safe 500 after database error", async () => {
  Admin.findById = () => ({
    async select() {
      throw new Error(
        "Sensitive lookup failure",
      );
    },
  });

  const res = await runController(
    getMe,
    {
      user: {
        id: "admin-id",
      },
    },
  );

  assert.equal(res.statusCode, 500);

  assert.deepEqual(res.body, {
    message:
      "Serverda ichki xatolik yuz berdi.",
  });
});
