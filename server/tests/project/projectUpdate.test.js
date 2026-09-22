process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const crypto = require("node:crypto");
const fs = require("node:fs").promises;
const {
  after,
  afterEach,
} = require("node:test");

const Project = require("../../models/Project");
const realtime = require("../../services/realtime");

const originalFindById = Project.findById;
const originalFindByIdAndUpdate =
  Project.findByIdAndUpdate;
const originalEmitRealtimeEvent =
  realtime.emitRealtimeEvent;

const projectId =
  "507f1f77bcf86cd799439011";

const projectsRoot = path.resolve(
  __dirname,
  "../../uploads/projects",
);

const createdFiles = [];
let emittedEvents = [];

realtime.emitRealtimeEvent = (...args) => {
  emittedEvents.push(args);
};

const {
  updateProject,
  patchProject,
} = require("../../controllers/projectController");

afterEach(async () => {
  Project.findById = originalFindById;
  Project.findByIdAndUpdate =
    originalFindByIdAndUpdate;

  emittedEvents = [];

  await Promise.all(
    createdFiles.splice(0).map(
      (filePath) =>
        fs.unlink(filePath).catch((error) => {
          if (error.code !== "ENOENT") {
            throw error;
          }
        }),
    ),
  );
});

after(() => {
  realtime.emitRealtimeEvent =
    originalEmitRealtimeEvent;
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

const createImage = async (label) => {
  await fs.mkdir(projectsRoot, {
    recursive: true,
  });

  const filename =
    `${label}-${crypto.randomUUID()}.png`;

  const filePath = path.join(
    projectsRoot,
    filename,
  );

  await fs.writeFile(
    filePath,
    Buffer.from(`temporary ${label} image`),
  );

  createdFiles.push(filePath);

  return {
    filename,
    filePath,
    publicPath:
      `/uploads/projects/${filename}`,
  };
};

const validPutBody = () => ({
  title: "Updated portfolio",
  description:
    "Bu loyiha PUT lifecycle testi orqali yangilandi.",
  technologies:
    '["Node.js","Express","MongoDB"]',
  githubLink:
    "https://github.com/asilbek2706/updated-portfolio",
  demoLink: "https://example.com/updated",
});

const runController = async (
  controller,
  {
    body = {},
    file,
  } = {},
) => {
  const req = {
    params: {
      id: projectId,
    },
    body,
  };

  if (file !== undefined) {
    req.file = file;
  }

  const res = createResponse();

  let nextCalled = false;
  let nextError;

  await controller(req, res, (error) => {
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

test("PUT replaces old image and emits public project", async () => {
  const oldImage =
    await createImage("put-old");

  const newImage =
    await createImage("put-new");

  let receivedId;
  let receivedUpdate;
  let receivedOptions;

  Project.findById = async () => ({
    _id: projectId,
    image: oldImage.publicPath,
  });

  const publicProject = {
    _id: projectId,
    title: "Updated portfolio",
    image: newImage.publicPath,
  };

  Project.findByIdAndUpdate = async (
    id,
    update,
    options,
  ) => {
    receivedId = id;
    receivedUpdate = update;
    receivedOptions = options;

    return {
      ...publicProject,
      createdBy: "private-admin-id",

      toJSON() {
        return {
          ...publicProject,
        };
      },
    };
  };

  const result = await runController(
    updateProject,
    {
      body: validPutBody(),
      file: {
        filename: newImage.filename,
      },
    },
  );

  assert.equal(receivedId, projectId);

  assert.deepEqual(receivedUpdate, {
    title: "Updated portfolio",
    description:
      "Bu loyiha PUT lifecycle testi orqali yangilandi.",
    technologies: [
      "Node.js",
      "Express",
      "MongoDB",
    ],
    githubLink:
      "https://github.com/asilbek2706/updated-portfolio",
    demoLink:
      "https://example.com/updated",
    image: newImage.publicPath,
  });

  assert.deepEqual(receivedOptions, {
    new: true,
    runValidators: true,
  });

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);

  assert.deepEqual(
    result.res.body.data,
    publicProject,
  );

  assert.equal(
    Object.hasOwn(
      result.res.body.data,
      "createdBy",
    ),
    false,
  );

  assert.deepEqual(emittedEvents, [
    [
      "projectUpdated",
      publicProject,
    ],
  ]);

  await assert.rejects(
    fs.access(oldImage.filePath),
    {
      code: "ENOENT",
    },
  );

  await fs.access(newImage.filePath);

  assert.equal(result.nextCalled, false);
});

test("PUT without new image preserves old image", async () => {
  const oldImagePath =
    "/uploads/projects/existing-image.png";

  let receivedUpdate;

  Project.findById = async () => ({
    _id: projectId,
    image: oldImagePath,
  });

  Project.findByIdAndUpdate = async (
    id,
    update,
  ) => {
    receivedUpdate = update;

    return {
      _id: id,
      title: update.title,
      image: update.image,

      toJSON() {
        return {
          _id: id,
          title: update.title,
          image: update.image,
        };
      },
    };
  };

  const result = await runController(
    updateProject,
    {
      body: validPutBody(),
    },
  );

  assert.equal(
    receivedUpdate.image,
    oldImagePath,
  );

  assert.equal(result.res.statusCode, 200);
  assert.equal(
    result.res.body.data.image,
    oldImagePath,
  );

  assert.deepEqual(emittedEvents, [
    [
      "projectUpdated",
      result.res.body.data,
    ],
  ]);

  assert.equal(result.nextCalled, false);
});

test("PUT database failure deletes new image and preserves old image", async () => {
  const oldImage =
    await createImage("put-error-old");

  const newImage =
    await createImage("put-error-new");

  const databaseError =
    new Error("Project update failed");

  Project.findById = async () => ({
    _id: projectId,
    image: oldImage.publicPath,
  });

  Project.findByIdAndUpdate = async () => {
    throw databaseError;
  };

  const result = await runController(
    updateProject,
    {
      body: validPutBody(),
      file: {
        filename: newImage.filename,
      },
    },
  );

  assert.equal(result.nextCalled, true);
  assert.equal(
    result.nextError,
    databaseError,
  );

  assert.equal(result.res.body, undefined);
  assert.equal(emittedEvents.length, 0);

  await fs.access(oldImage.filePath);

  await assert.rejects(
    fs.access(newImage.filePath),
    {
      code: "ENOENT",
    },
  );
});

test("PATCH race condition returns 404 and deletes new image", async () => {
  const oldImage =
    await createImage("patch-race-old");

  const newImage =
    await createImage("patch-race-new");

  Project.findById = async () => ({
    _id: projectId,
    image: oldImage.publicPath,
  });

  Project.findByIdAndUpdate =
    async () => null;

  const result = await runController(
    patchProject,
    {
      body: {
        title: "Race update",
      },
      file: {
        filename: newImage.filename,
      },
    },
  );

  assert.equal(result.res.statusCode, 404);
  assert.equal(result.res.body.success, false);

  assert.equal(
    result.res.body.message,
    "Loyiha yangilash vaqtida topilmadi.",
  );

  assert.equal(result.nextCalled, false);
  assert.equal(emittedEvents.length, 0);

  await fs.access(oldImage.filePath);

  await assert.rejects(
    fs.access(newImage.filePath),
    {
      code: "ENOENT",
    },
  );
});

test("PATCH image-only update removes old image and hides createdBy", async () => {
  const oldImage =
    await createImage("patch-old");

  const newImage =
    await createImage("patch-new");

  let receivedUpdate;

  Project.findById = async () => ({
    _id: projectId,
    image: oldImage.publicPath,
  });

  Project.findByIdAndUpdate = async (
    id,
    update,
  ) => {
    receivedUpdate = update;

    return {
      _id: id,
      title: "Existing project",
      image: update.image,
      createdBy: "private-admin-id",
    };
  };

  const result = await runController(
    patchProject,
    {
      body: {},
      file: {
        filename: newImage.filename,
      },
    },
  );

  assert.deepEqual(receivedUpdate, {
    image: newImage.publicPath,
  });

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);

  assert.equal(
    result.res.body.data.image,
    newImage.publicPath,
  );

  assert.equal(
    Object.hasOwn(
      result.res.body.data,
      "createdBy",
    ),
    false,
  );

  assert.equal(
    Object.hasOwn(
      emittedEvents[0][1],
      "createdBy",
    ),
    false,
  );

  assert.deepEqual(emittedEvents, [
    [
      "projectUpdated",
      result.res.body.data,
    ],
  ]);

  await assert.rejects(
    fs.access(oldImage.filePath),
    {
      code: "ENOENT",
    },
  );

  await fs.access(newImage.filePath);

  assert.equal(result.nextCalled, false);
});
