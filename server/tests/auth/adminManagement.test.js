process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const { afterEach } = require("node:test");

const Admin = require("../../models/Admin");
const bcrypt = require("bcryptjs");

const originalFindOne = Admin.findOne;
const originalFind = Admin.find;
const originalCountDocuments = Admin.countDocuments;
const originalFindById = Admin.findById;
const originalFindByIdAndUpdate = Admin.findByIdAndUpdate;
const originalFindByIdAndDelete = Admin.findByIdAndDelete;
const originalSave = Admin.prototype.save;
const originalGenSalt = bcrypt.genSalt;
const originalHash = bcrypt.hash;

const {
  inviteAdmin,
  getAllAdmins,
  updateAdminBySuper,
  deleteAdmin,
} = require("../../controllers/authController");

const adminId = "507f1f77bcf86cd799439011";

afterEach(() => {
  Admin.findOne = originalFindOne;
  Admin.find = originalFind;
  Admin.countDocuments = originalCountDocuments;
  Admin.findById = originalFindById;
  Admin.findByIdAndUpdate = originalFindByIdAndUpdate;
  Admin.findByIdAndDelete = originalFindByIdAndDelete;
  Admin.prototype.save = originalSave;
  bcrypt.genSalt = originalGenSalt;
  bcrypt.hash = originalHash;
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
  { body = {}, query = {}, id = adminId } = {},
) => {
  const req = {
    body,
    query,
    params: {
      id,
    },
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

test("Admin invite rejects invalid input before database query", async () => {
  let databaseCalled = false;

  Admin.findOne = async () => {
    databaseCalled = true;
  };

  const result = await runController(inviteAdmin, {
    body: {
      username: "ab",
      email: "",
      password: "short",
    },
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(databaseCalled, false);
});

test("Admin invite rejects duplicate username or email", async () => {
  let receivedFilter;

  Admin.findOne = async (filter) => {
    receivedFilter = filter;

    return {
      _id: "existing-admin",
    };
  };

  const result = await runController(inviteAdmin, {
    body: {
      username: "  newadmin  ",
      email: "  ADMIN@MAIL.RU ",
      password: "secure-password",
    },
  });

  assert.deepEqual(receivedFilter, {
    $or: [
      {
        username: "newadmin",
      },
      {
        email: "admin@mail.ru",
      },
    ],
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(
    result.res.body.message,
    "Bu username yoki email allaqachon ro'yxatdan o'tgan!",
  );
});

test("Admin invite hashes password and creates ordinary admin", async () => {
  Admin.findOne = async () => null;

  bcrypt.genSalt = async (rounds) => {
    assert.equal(rounds, 10);
    return "test-salt";
  };

  bcrypt.hash = async (password, salt) => {
    assert.equal(password, "secure-password");
    assert.equal(salt, "test-salt");

    return "hashed-password";
  };

  let savedAdmin;

  Admin.prototype.save = async function save() {
    savedAdmin = this;
    return this;
  };

  const result = await runController(inviteAdmin, {
    body: {
      username: "  newadmin  ",
      email: "  ADMIN@MAIL.RU ",
      password: "secure-password",
    },
  });

  assert.equal(savedAdmin.username, "newadmin");
  assert.equal(savedAdmin.email, "admin@mail.ru");
  assert.equal(savedAdmin.password, "hashed-password");
  assert.equal(savedAdmin.role, "admin");

  assert.equal(result.res.statusCode, 201);
  assert.equal(result.res.body.admin.username, "newadmin");
  assert.equal(result.res.body.admin.email, "admin@mail.ru");
  assert.equal(result.res.body.admin.role, "admin");

  assert.equal(Object.hasOwn(result.res.body.admin, "password"), false);
});

const mockAdminList = ({ admins, total }) => {
  const calls = {};

  Admin.find = () => ({
    select(value) {
      calls.select = value;
      return this;
    },

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
      return admins;
    },
  });

  Admin.countDocuments = async () => total;

  return calls;
};

test("Admin list applies pagination and public field selection", async () => {
  const admins = [
    {
      username: "admin-one",
      email: "one@example.com",
      role: "admin",
    },
    {
      username: "admin-two",
      email: "two@example.com",
      role: "admin",
    },
  ];

  const calls = mockAdminList({
    admins,
    total: 5,
  });

  const result = await runController(getAllAdmins, {
    query: {
      page: "2",
      limit: "2",
    },
  });

  assert.equal(calls.select, "username email role createdAt updatedAt");

  assert.deepEqual(calls.sort, {
    createdAt: -1,
  });

  assert.equal(calls.skip, 2);
  assert.equal(calls.limit, 2);

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.count, 2);

  assert.deepEqual(result.res.body.pagination, {
    page: 2,
    limit: 2,
    total: 5,
    totalPages: 3,
  });

  assert.deepEqual(result.res.body.data, admins);
});

test("Admin list rejects invalid pagination before database query", async () => {
  let databaseCalled = false;

  Admin.find = () => {
    databaseCalled = true;
  };

  Admin.countDocuments = async () => {
    databaseCalled = true;
  };

  const result = await runController(getAllAdmins, {
    query: {
      limit: "51",
    },
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError.statusCode, 400);
  assert.equal(databaseCalled, false);
});

test("SuperAdmin update rejects invalid admin ID", async () => {
  let databaseCalled = false;

  Admin.findById = () => {
    databaseCalled = true;
  };

  const result = await runController(updateAdminBySuper, {
    id: "invalid-id",
    body: {
      username: "admin",
      email: "admin@example.com",
      role: "admin",
    },
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(databaseCalled, false);
});

test("SuperAdmin update requires all fields", async () => {
  let databaseCalled = false;

  Admin.findById = () => {
    databaseCalled = true;
  };

  const result = await runController(updateAdminBySuper, {
    body: {
      username: "admin",
    },
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(databaseCalled, false);
});

test("SuperAdmin update returns 404 for missing admin", async () => {
  Admin.findById = () => ({
    async select(value) {
      assert.equal(value, "role");
      return null;
    },
  });

  const result = await runController(updateAdminBySuper, {
    body: {
      username: "admin",
      email: "admin@example.com",
      role: "admin",
    },
  });

  assert.equal(result.res.statusCode, 404);
  assert.equal(result.res.body.message, "Bunday admin topilmadi!");
});

test("SuperAdmin role cannot be downgraded", async () => {
  let updateCalled = false;

  Admin.findById = () => ({
    async select() {
      return {
        role: "superadmin",
      };
    },
  });

  Admin.findByIdAndUpdate = () => {
    updateCalled = true;
  };

  const result = await runController(updateAdminBySuper, {
    body: {
      username: "owner",
      email: "owner@example.com",
      role: "admin",
    },
  });

  assert.equal(result.res.statusCode, 403);
  assert.equal(updateCalled, false);
});

test("SuperAdmin can update ordinary admin with normalized data", async () => {
  Admin.findById = () => ({
    async select() {
      return {
        role: "admin",
      };
    },
  });

  let receivedId;
  let receivedUpdate;
  let receivedOptions;
  let receivedSelect;

  const updatedAdmin = {
    _id: adminId,
    username: "updated-admin",
    email: "updated@example.com",
    role: "admin",
  };

  Admin.findByIdAndUpdate = (id, update, options) => {
    receivedId = id;
    receivedUpdate = update;
    receivedOptions = options;

    return {
      async select(value) {
        receivedSelect = value;
        return updatedAdmin;
      },
    };
  };

  const result = await runController(updateAdminBySuper, {
    body: {
      username: "  updated-admin  ",
      email: " UPDATED@EXAMPLE.COM ",
      role: "admin",
    },
  });

  assert.equal(receivedId, adminId);

  assert.deepEqual(receivedUpdate, {
    username: "updated-admin",
    email: "updated@example.com",
    role: "admin",
  });

  assert.deepEqual(receivedOptions, {
    new: true,
    runValidators: true,
  });

  assert.equal(receivedSelect, "-password");
  assert.equal(result.res.statusCode, 200);

  assert.deepEqual(result.res.body.data, updatedAdmin);
});

test("Admin deletion rejects invalid ID", async () => {
  let databaseCalled = false;

  Admin.findById = async () => {
    databaseCalled = true;
  };

  const result = await runController(deleteAdmin, {
    id: "invalid-id",
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(databaseCalled, false);
});

test("Admin deletion returns 404 for missing admin", async () => {
  Admin.findById = async () => null;

  const result = await runController(deleteAdmin);

  assert.equal(result.res.statusCode, 404);
  assert.equal(
    result.res.body.message,
    "O'chirilishi kerak bo'lgan admin topilmadi!",
  );
});

test("SuperAdmin account cannot be deleted", async () => {
  let deleteCalled = false;

  Admin.findById = async () => ({
    username: "owner",
    role: "superadmin",
  });

  Admin.findByIdAndDelete = async () => {
    deleteCalled = true;
  };

  const result = await runController(deleteAdmin);

  assert.equal(result.res.statusCode, 403);
  assert.equal(deleteCalled, false);
});

test("Ordinary admin can be deleted", async () => {
  Admin.findById = async () => ({
    username: "old-admin",
    role: "admin",
  });

  let deletedId;

  Admin.findByIdAndDelete = async (id) => {
    deletedId = id;

    return {
      _id: id,
    };
  };

  const result = await runController(deleteAdmin);

  assert.equal(deletedId, adminId);
  assert.equal(result.res.statusCode, 200);

  assert.equal(
    result.res.body.message,
    "Admin (old-admin) tizimdan muvaffaqiyatli o'chirildi!",
  );
});

test("Admin management returns safe response after database error", async () => {
  Admin.findOne = async () => {
    throw new Error("Sensitive admin database error");
  };

  const result = await runController(inviteAdmin, {
    body: {
      username: "newadmin",
      email: "new@example.com",
      password: "secure-password",
    },
  });

  assert.equal(result.res.statusCode, 500);

  assert.deepEqual(result.res.body, {
    message: "Serverda ichki xatolik yuz berdi.",
  });

  assert.equal(
    JSON.stringify(result.res.body).includes("Sensitive admin database error"),
    false,
  );
});
