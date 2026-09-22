process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs").promises;
const { EventEmitter } = require("node:events");
const { afterEach } = require("node:test");

const cleanupFailedUpload =
  require("../../middlewares/cleanupFailedUpload");

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(
      (directory) =>
        fs.rm(directory, {
          recursive: true,
          force: true,
        }),
    ),
  );
});

const createTemporaryFile = async (
  filename = "uploaded.png",
) => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "portfolio-cleanup-test-"),
  );

  temporaryDirectories.push(directory);

  const filePath = path.join(
    directory,
    filename,
  );

  await fs.writeFile(
    filePath,
    Buffer.from("temporary upload"),
  );

  return {
    directory,
    filePath,
  };
};

const createResponse = (statusCode) => {
  const res = new EventEmitter();
  res.statusCode = statusCode;
  return res;
};

const waitForDeletion = async (filePath) => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code === "ENOENT") {
        return;
      }

      throw error;
    }

    await new Promise((resolve) => {
      setImmediate(resolve);
    });
  }

  assert.fail(
    `Fayl belgilangan vaqtda o‘chirilmadi: ${filePath}`,
  );
};

test("Cleanup skips request without uploaded file", () => {
  const req = {};
  const res = createResponse(400);

  let nextCount = 0;

  cleanupFailedUpload(req, res, () => {
    nextCount += 1;
  });

  assert.equal(nextCount, 1);
  assert.equal(
    res.listenerCount("finish"),
    0,
  );
});

test("Cleanup preserves file after successful response", async () => {
  const { filePath } =
    await createTemporaryFile();

  const req = {
    file: {
      path: filePath,
    },
  };

  const res = createResponse(201);

  let nextCount = 0;

  cleanupFailedUpload(req, res, () => {
    nextCount += 1;
  });

  assert.equal(nextCount, 1);
  assert.equal(
    res.listenerCount("finish"),
    1,
  );

  res.emit("finish");

  await new Promise((resolve) => {
    setImmediate(resolve);
  });

  await fs.access(filePath);
});

test("Cleanup deletes file after failed response", async () => {
  const { filePath } =
    await createTemporaryFile();

  const req = {
    file: {
      path: filePath,
    },
  };

  const res = createResponse(400);

  cleanupFailedUpload(req, res, () => {});

  res.emit("finish");

  await waitForDeletion(filePath);

  await assert.rejects(
    fs.access(filePath),
    {
      code: "ENOENT",
    },
  );
});

test("Cleanup deletes originally captured upload path", async () => {
  const {
    directory,
    filePath: originalPath,
  } = await createTemporaryFile("original.png");

  const replacementPath = path.join(
    directory,
    "replacement.png",
  );

  await fs.writeFile(
    replacementPath,
    Buffer.from("replacement upload"),
  );

  const req = {
    file: {
      path: originalPath,
    },
  };

  const res = createResponse(500);

  cleanupFailedUpload(req, res, () => {});

  req.file.path = replacementPath;

  res.emit("finish");

  await waitForDeletion(originalPath);

  await assert.rejects(
    fs.access(originalPath),
    {
      code: "ENOENT",
    },
  );

  await fs.access(replacementPath);
});

test("Cleanup safely ignores already missing file", async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "portfolio-cleanup-test-"),
  );

  temporaryDirectories.push(directory);

  const missingPath = path.join(
    directory,
    "already-missing.png",
  );

  const req = {
    file: {
      path: missingPath,
    },
  };

  const res = createResponse(422);

  let nextCount = 0;

  cleanupFailedUpload(req, res, () => {
    nextCount += 1;
  });

  assert.equal(nextCount, 1);

  assert.doesNotThrow(() => {
    res.emit("finish");
  });

  await new Promise((resolve) => {
    setImmediate(resolve);
  });

  await new Promise((resolve) => {
    setImmediate(resolve);
  });
});
