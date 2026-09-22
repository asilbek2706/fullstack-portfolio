process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  afterEach,
} = require("node:test");

const Project = require("../../models/Project");

const originalFind = Project.find;
const originalCountDocuments =
  Project.countDocuments;
const originalFindById = Project.findById;

const {
  getAllProjects,
  getProjectById,
} = require("../../controllers/projectController");

const projectId =
  "507f1f77bcf86cd799439011";

afterEach(() => {
  Project.find = originalFind;
  Project.countDocuments =
    originalCountDocuments;
  Project.findById = originalFindById;
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
    query = {},
    id = projectId,
  } = {},
) => {
  const req = {
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

const mockProjectList = ({
  projects,
  total,
}) => {
  const calls = {
    sort: undefined,
    skip: undefined,
    limit: undefined,
    lean: false,
  };

  Project.find = () => ({
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
      return projects;
    },
  });

  Project.countDocuments =
    async () => total;

  return calls;
};

test("Project list uses default pagination", async () => {
  const projects = [
    {
      _id: "project-1",
      title: "First project",
    },
    {
      _id: "project-2",
      title: "Second project",
    },
  ];

  const calls = mockProjectList({
    projects,
    total: 2,
  });

  const result = await runController(
    getAllProjects,
  );

  assert.deepEqual(calls.sort, {
    createdAt: -1,
  });
  assert.equal(calls.skip, 0);
  assert.equal(calls.limit, 12);
  assert.equal(calls.lean, true);

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);
  assert.equal(result.res.body.count, 2);

  assert.deepEqual(
    result.res.body.pagination,
    {
      page: 1,
      limit: 12,
      total: 2,
      totalPages: 1,
    },
  );

  assert.deepEqual(
    result.res.body.data,
    projects,
  );

  assert.equal(result.nextCalled, false);
});

test("Project list applies requested page and limit", async () => {
  const projects = [
    {
      _id: "project-3",
      title: "Third project",
    },
    {
      _id: "project-4",
      title: "Fourth project",
    },
  ];

  const calls = mockProjectList({
    projects,
    total: 5,
  });

  const result = await runController(
    getAllProjects,
    {
      query: {
        page: "2",
        limit: "2",
      },
    },
  );

  assert.equal(calls.skip, 2);
  assert.equal(calls.limit, 2);

  assert.deepEqual(
    result.res.body.pagination,
    {
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3,
    },
  );

  assert.equal(result.res.body.count, 2);
  assert.deepEqual(
    result.res.body.data,
    projects,
  );

  assert.equal(result.nextCalled, false);
});

test("Project list rejects invalid pagination before database query", async () => {
  let databaseCalled = false;

  Project.find = () => {
    databaseCalled = true;
  };

  Project.countDocuments = async () => {
    databaseCalled = true;
  };

  const result = await runController(
    getAllProjects,
    {
      query: {
        page: "0",
        limit: "12",
      },
    },
  );

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError.statusCode, 400);

  assert.equal(
    result.nextError.message,
    "page 1 yoki undan katta butun son bo'lishi kerak.",
  );

  assert.equal(databaseCalled, false);
  assert.equal(result.res.body, undefined);
});

test("Project list forwards database errors", async () => {
  const databaseError =
    new Error("Project list failed");

  Project.find = () => ({
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

  Project.countDocuments = async () => 0;

  const result = await runController(
    getAllProjects,
  );

  assert.equal(result.nextCalled, true);
  assert.equal(
    result.nextError,
    databaseError,
  );
  assert.equal(result.res.body, undefined);
});

test("Project details reject invalid ID before database query", async () => {
  let databaseCalled = false;

  Project.findById = async () => {
    databaseCalled = true;
  };

  const result = await runController(
    getProjectById,
    {
      id: "invalid-id",
    },
  );

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.res.body.success, false);
  assert.equal(
    result.res.body.message,
    "ID formati noto'g'ri.",
  );

  assert.equal(databaseCalled, false);
  assert.equal(result.nextCalled, false);
});

test("Project details return 404 for missing project", async () => {
  Project.findById = async () => null;

  const result = await runController(
    getProjectById,
  );

  assert.equal(result.res.statusCode, 404);
  assert.equal(result.res.body.success, false);
  assert.equal(
    result.res.body.message,
    "Loyiha topilmadi.",
  );

  assert.equal(result.nextCalled, false);
});

test("Project details return existing project", async () => {
  const project = {
    _id: projectId,
    title: "Secure portfolio",
    description:
      "Project details controller testi.",
    technologies: [
      "Node.js",
      "Express",
    ],
    image:
      "/uploads/projects/project.png",
  };

  Project.findById = async (id) => {
    assert.equal(id, projectId);
    return project;
  };

  const result = await runController(
    getProjectById,
  );

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);
  assert.equal(
    result.res.body.message,
    "Loyiha topildi.",
  );

  assert.deepEqual(
    result.res.body.data,
    project,
  );

  assert.equal(result.nextCalled, false);
});

test("Project details forward database errors", async () => {
  const databaseError =
    new Error("Project lookup failed");

  Project.findById = async () => {
    throw databaseError;
  };

  const result = await runController(
    getProjectById,
  );

  assert.equal(result.nextCalled, true);
  assert.equal(
    result.nextError,
    databaseError,
  );
  assert.equal(result.res.body, undefined);
});
