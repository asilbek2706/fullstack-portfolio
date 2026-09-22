process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const crypto = require("node:crypto");
const fs = require("node:fs").promises;
const { after, afterEach } = require("node:test");

const Project = require("../../models/Project");
const realtime = require("../../services/realtime");

const originalFindById = Project.findById;
const originalEmitRealtimeEvent = realtime.emitRealtimeEvent;

const projectId = "507f1f77bcf86cd799439011";

const projectsRoot = path.resolve(__dirname, "../../uploads/projects");

const uploadsRoot = path.resolve(__dirname, "../../uploads");

const createdFiles = [];
let emittedEvents = [];

realtime.emitRealtimeEvent = (...args) => {
  emittedEvents.push(args);
};

const { deleteProject } = require("../../controllers/projectController");

afterEach(async () => {
  Project.findById = originalFindById;
  emittedEvents = [];

  await Promise.all(
    createdFiles.splice(0).map((filePath) =>
      fs.unlink(filePath).catch((error) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }),
    ),
  );
});

after(() => {
  realtime.emitRealtimeEvent = originalEmitRealtimeEvent;
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

const createFile = async (root, label) => {
  await fs.mkdir(root, {
    recursive: true,
  });

  const filename = `${label}-${crypto.randomUUID()}.png`;

  const filePath = path.join(root, filename);

  await fs.writeFile(filePath, Buffer.from(`temporary ${label} image`));

  createdFiles.push(filePath);

  return {
    filename,
    filePath,
  };
};

const runDeleteProject = async (id = projectId) => {
  const req = {
    params: {
      id,
    },
  };

  const res = createResponse();

  let nextCalled = false;
  let nextError;

  await deleteProject(req, res, (error) => {
    nextCalled = true;
    nextError = error;
  });

  return {
    res,
    nextCalled,
    nextError,
  };
};

test("Project deletion rejects invalid ID before database query", async () => {
  let databaseCalled = false;

  Project.findById = async () => {
    databaseCalled = true;
  };

  const result = await runDeleteProject("invalid-id");

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.res.body.success, false);
  assert.equal(result.res.body.message, "ID formati noto'g'ri.");

  assert.equal(databaseCalled, false);
  assert.equal(result.nextCalled, false);
  assert.equal(emittedEvents.length, 0);
});

test("Project deletion returns 404 when project does not exist", async () => {
  Project.findById = async () => null;

  const result = await runDeleteProject();

  assert.equal(result.res.statusCode, 404);
  assert.equal(result.res.body.success, false);
  assert.equal(result.res.body.message, "Loyiha topilmadi.");

  assert.equal(result.nextCalled, false);
  assert.equal(emittedEvents.length, 0);
});

test("Project deletion removes document and image safely", async () => {
  const image = await createFile(projectsRoot, "delete-project");

  let deleteOneCalled = false;

  Project.findById = async () => ({
    _id: projectId,
    image: `/uploads/projects/${image.filename}`,

    async deleteOne() {
      deleteOneCalled = true;
    },
  });

  const result = await runDeleteProject();

  assert.equal(deleteOneCalled, true);
  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);
  assert.equal(result.nextCalled, false);

  assert.deepEqual(emittedEvents, [
    [
      "projectDeleted",
      {
        id: projectId,
      },
    ],
  ]);

  await assert.rejects(fs.access(image.filePath), {
    code: "ENOENT",
  });
});

test("Project database deletion failure preserves image", async () => {
  const image = await createFile(projectsRoot, "delete-error");

  const databaseError = new Error("Project delete failed");

  Project.findById = async () => ({
    _id: projectId,
    image: `/uploads/projects/${image.filename}`,

    async deleteOne() {
      throw databaseError;
    },
  });

  const result = await runDeleteProject();

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);

  assert.equal(result.res.body, undefined);
  assert.equal(emittedEvents.length, 0);

  await fs.access(image.filePath);
});

test("Project deletion cannot remove file outside projects directory", async () => {
  const outsideImage = await createFile(uploadsRoot, "outside-projects");

  let deleteOneCalled = false;

  Project.findById = async () => ({
    _id: projectId,
    image: `/uploads/${outsideImage.filename}`,

    async deleteOne() {
      deleteOneCalled = true;
    },
  });

  const result = await runDeleteProject();

  assert.equal(deleteOneCalled, true);
  assert.equal(result.res.statusCode, 200);
  assert.equal(result.nextCalled, false);

  await fs.access(outsideImage.filePath);

  assert.deepEqual(emittedEvents, [
    [
      "projectDeleted",
      {
        id: projectId,
      },
    ],
  ]);
});
