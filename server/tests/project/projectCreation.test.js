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

const originalProjectCreate = Project.create;
const originalEmitRealtimeEvent = realtime.emitRealtimeEvent;

let emittedEvents = [];
const createdFiles = [];

realtime.emitRealtimeEvent = (...args) => {
  emittedEvents.push(args);
};

const { createProject } = require("../../controllers/projectController");

const projectsRoot = path.resolve(__dirname, "../../uploads/projects");

const uploadsRoot = path.resolve(__dirname, "../../uploads");

afterEach(async () => {
  Project.create = originalProjectCreate;
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

const validBody = () => ({
  title: "Secure Portfolio",
  description: "Bu loyiha xavfsiz Project create testi uchun yozildi.",
  technologies: '["Node.js","Express"]',
  githubLink: "https://github.com/asilbek2706/secure-portfolio",
  demoLink: "https://example.com",
});

const runCreateProject = async ({
  body = validBody(),
  file,
  user = {
    _id: "507f1f77bcf86cd799439011",
  },
} = {}) => {
  const req = {
    body,
    user,
  };

  if (file !== undefined) {
    req.file = file;
  }

  const res = createResponse();

  let nextCalled = false;
  let nextError;

  await createProject(req, res, (error) => {
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

test("Project creation requires uploaded image", async () => {
  let databaseCalled = false;

  Project.create = async () => {
    databaseCalled = true;
  };

  const result = await runCreateProject();

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.res.body.success, false);
  assert.equal(databaseCalled, false);
  assert.equal(result.nextCalled, false);
  assert.equal(emittedEvents.length, 0);
});

test("Project creation stores normalized data and emits public payload", async () => {
  let createPayload;

  const publicProject = {
    _id: "project-id",
    title: "Secure Portfolio",
    description: "Bu loyiha xavfsiz Project create testi uchun yozildi.",
    technologies: ["Node.js", "Express"],
    githubLink: "https://github.com/asilbek2706/secure-portfolio",
    demoLink: "https://example.com",
    image: "/uploads/projects/project-image.png",
  };

  Project.create = async (payload) => {
    createPayload = payload;

    return {
      ...publicProject,
      createdBy: "507f1f77bcf86cd799439011",

      toJSON() {
        return {
          ...publicProject,
        };
      },
    };
  };

  const result = await runCreateProject({
    file: {
      filename: "project-image.png",
    },
  });

  assert.deepEqual(createPayload, {
    title: "Secure Portfolio",
    description: "Bu loyiha xavfsiz Project create testi uchun yozildi.",
    technologies: ["Node.js", "Express"],
    githubLink: "https://github.com/asilbek2706/secure-portfolio",
    demoLink: "https://example.com",
    image: "/uploads/projects/project-image.png",
    createdBy: "507f1f77bcf86cd799439011",
  });

  assert.equal(result.res.statusCode, 201);
  assert.equal(result.res.body.success, true);
  assert.deepEqual(result.res.body.data, publicProject);
  assert.equal(Object.hasOwn(result.res.body.data, "createdBy"), false);

  assert.deepEqual(emittedEvents, [["projectCreated", publicProject]]);
  assert.equal(result.nextCalled, false);
});

test("Project creation sanitizes plain object payload", async () => {
  Project.create = async () => ({
    _id: "plain-project-id",
    title: "Plain project",
    image: "/uploads/projects/plain.png",
    createdBy: "private-admin-id",
  });

  const result = await runCreateProject({
    file: {
      filename: "plain.png",
    },
  });

  assert.equal(result.res.statusCode, 201);
  assert.equal(Object.hasOwn(result.res.body.data, "createdBy"), false);
  assert.equal(Object.hasOwn(emittedEvents[0][1], "createdBy"), false);
});

test("Project creation deletes new image after database failure", async () => {
  await fs.mkdir(projectsRoot, {
    recursive: true,
  });

  const filename = `${crypto.randomUUID()}.png`;
  const filePath = path.join(projectsRoot, filename);

  await fs.writeFile(filePath, Buffer.from("temporary project image"));

  createdFiles.push(filePath);

  const databaseError = new Error("Project create failed");

  Project.create = async () => {
    throw databaseError;
  };

  const result = await runCreateProject({
    file: {
      filename,
    },
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(result.res.body, undefined);
  assert.equal(emittedEvents.length, 0);

  await assert.rejects(fs.access(filePath), {
    code: "ENOENT",
  });
});

test("Project cleanup cannot escape projects directory", async () => {
  await fs.mkdir(uploadsRoot, {
    recursive: true,
  });

  const filename = `${crypto.randomUUID()}.png`;
  const outsidePath = path.join(uploadsRoot, filename);

  await fs.writeFile(outsidePath, Buffer.from("must remain safe"));

  createdFiles.push(outsidePath);

  const databaseError = new Error("Project create failed");

  Project.create = async () => {
    throw databaseError;
  };

  const result = await runCreateProject({
    file: {
      filename: `../${filename}`,
    },
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(emittedEvents.length, 0);

  await fs.access(outsidePath);
});
