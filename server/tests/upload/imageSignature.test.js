process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs").promises;
const { afterEach } = require("node:test");

const validateImageFile = require("../../middlewares/validateImageFile");

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, {
        recursive: true,
        force: true,
      }),
    ),
  );
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

const createTemporaryFile = async (filename, content) => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "portfolio-upload-test-"),
  );

  temporaryDirectories.push(directory);

  const filePath = path.join(directory, filename);

  await fs.writeFile(filePath, content);

  return filePath;
};

const runValidation = async (file) => {
  const req = {};

  if (file !== undefined) {
    req.file = file;
  }

  const res = createResponse();

  let nextCalled = false;
  let nextError;

  await validateImageFile(req, res, (error) => {
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

test("Image validator skips request without a file", async () => {
  const result = await runValidation();

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, undefined);
  assert.equal(result.res.body, undefined);
});

test("Image validator accepts valid PNG signature", async () => {
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
  ]);

  const filePath = await createTemporaryFile("test.png", pngHeader);

  const result = await runValidation({
    path: filePath,
    mimetype: "image/png",
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, undefined);
  assert.equal(result.req.file.path, filePath);
  await fs.access(filePath);
});

test("Image validator accepts valid JPEG signature", async () => {
  const jpegHeader = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);

  const filePath = await createTemporaryFile("test.jpg", jpegHeader);

  const result = await runValidation({
    path: filePath,
    mimetype: "image/jpeg",
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, undefined);
  assert.equal(result.req.file.path, filePath);
  await fs.access(filePath);
});

test("Image validator accepts valid WEBP signature", async () => {
  const webpHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ]);

  const filePath = await createTemporaryFile("test.webp", webpHeader);

  const result = await runValidation({
    path: filePath,
    mimetype: "image/webp",
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, undefined);
  assert.equal(result.req.file.path, filePath);
  await fs.access(filePath);
});

test("Image validator rejects and deletes fake image", async () => {
  const filePath = await createTemporaryFile(
    "fake.png",
    Buffer.from("<script>alert('not an image')</script>"),
  );

  const result = await runValidation({
    path: filePath,
    mimetype: "image/png",
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.res.body.success, false);
  assert.equal(result.nextCalled, false);
  assert.equal(result.req.file, undefined);

  await assert.rejects(fs.access(filePath), {
    code: "ENOENT",
  });
});

test("Image validator deletes file and forwards read errors", async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "portfolio-upload-test-"),
  );

  temporaryDirectories.push(directory);

  const missingPath = path.join(directory, "missing.png");

  const result = await runValidation({
    path: missingPath,
    mimetype: "image/png",
  });

  assert.equal(result.nextCalled, true);
  assert.ok(result.nextError);
  assert.equal(result.nextError.code, "ENOENT");
  assert.equal(result.res.body, undefined);
});
