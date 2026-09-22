process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const {
  test,
  afterEach,
} = require("node:test");
const assert = require("node:assert/strict");

const Project = require("../../models/Project");
const {
  checkProjectOwnerOrSuper,
} = require("../../middlewares/projectMiddleware");

const originalFindById = Project.findById;

afterEach(() => {
  Project.findById = originalFindById;
});

const projectId = "507f1f77bcf86cd799439011";
const ownerId = "507f191e810c19729de860ea";
const anotherAdminId = "507f1f77bcf86cd799439012";

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

const mockProjectLookup = (result) => {
  Project.findById = () => ({
    select: async () => result,
  });
};

const mockProjectError = (error) => {
  Project.findById = () => ({
    select: async () => {
      throw error;
    },
  });
};

const runOwnershipCheck = async ({
  id = projectId,
  user,
  admin,
} = {}) => {
  const req = {
    params: { id },
    user,
    admin,
  };
  const res = createResponse();
  let nextCalled = false;
  let nextError;

  await checkProjectOwnerOrSuper(
    req,
    res,
    (error) => {
      nextCalled = true;
      nextError = error;
    },
  );

  return {
    req,
    res,
    nextCalled,
    nextError,
  };
};

test("ownership rejects invalid project ID", async () => {
  const { res, nextCalled } = await runOwnershipCheck({
    id: "not-valid-id",
    user: {
      _id: ownerId,
      role: "admin",
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /ID formati noto'g'ri/);
});

test("ownership requires authenticated admin", async () => {
  const { res, nextCalled } =
    await runOwnershipCheck();

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /Avtorizatsiya/);
});

test("ownership returns 404 for missing project", async () => {
  mockProjectLookup(null);

  const { res, nextCalled } = await runOwnershipCheck({
    user: {
      _id: ownerId,
      role: "admin",
    },
  });

  assert.equal(res.statusCode, 404);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /Loyiha topilmadi/);
});

test("superadmin can manage every project", async () => {
  mockProjectLookup({
    _id: projectId,
    createdBy: anotherAdminId,
  });

  const { res, nextCalled, nextError } =
    await runOwnershipCheck({
      user: {
        _id: ownerId,
        role: "superadmin",
      },
    });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.equal(nextError, undefined);
});

test("ordinary admin cannot manage ownerless project", async () => {
  mockProjectLookup({
    _id: projectId,
    createdBy: null,
  });

  const { res, nextCalled } = await runOwnershipCheck({
    user: {
      _id: ownerId,
      role: "admin",
    },
  });

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /faqat SuperAdmin/);
});

test("ordinary admin cannot manage another admin project", async () => {
  mockProjectLookup({
    _id: projectId,
    createdBy: anotherAdminId,
  });

  const { res, nextCalled } = await runOwnershipCheck({
    user: {
      _id: ownerId,
      role: "admin",
    },
  });

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /faqat o'zingiz yaratgan/);
});

test("ordinary admin can manage own project", async () => {
  mockProjectLookup({
    _id: projectId,
    createdBy: ownerId,
  });

  const { res, nextCalled, nextError } =
    await runOwnershipCheck({
      user: {
        _id: ownerId,
        role: "admin",
      },
    });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.equal(nextError, undefined);
});

test("ownership forwards database errors", async () => {
  const databaseError = new Error(
    "Simulated database failure",
  );

  mockProjectError(databaseError);

  const { res, nextCalled, nextError } =
    await runOwnershipCheck({
      user: {
        _id: ownerId,
        role: "admin",
      },
    });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.equal(nextError, databaseError);
});
