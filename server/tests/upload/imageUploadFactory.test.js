process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs").promises;
const express = require("express");
const request = require("supertest");
const { afterEach } = require("node:test");

const { createImageUpload } = require("../../middlewares/createImageUpload");
const errorHandler = require("../../middlewares/errorHandler");

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

const createTestApp = async () => {
  const uploadPath = await fs.mkdtemp(
    path.join(os.tmpdir(), "portfolio-multer-test-"),
  );

  temporaryDirectories.push(uploadPath);

  const upload = createImageUpload(uploadPath);
  const app = express();

  app.post("/upload", upload.single("image"), (req, res) => {
    res.status(201).json({
      success: true,
      file: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        path: req.file.path,
      },
    });
  });

  app.use(errorHandler);

  return {
    app,
    uploadPath,
  };
};

const listUploadedFiles = async (uploadPath) => fs.readdir(uploadPath);

test("Image upload factory requires absolute destination", () => {
  assert.throws(() => createImageUpload("relative/uploads"), {
    name: "TypeError",
    message: "Upload destination mutlaq path bo'lishi kerak.",
  });
});

test("Image upload creates UUID filename for PNG", async () => {
  const { app, uploadPath } = await createTestApp();

  const response = await request(app)
    .post("/upload")
    .attach("image", Buffer.from("png test content"), {
      filename: "../../unsafe-name.png",
      contentType: "image/png",
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.file.mimetype, "image/png");

  assert.match(
    response.body.file.filename,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.png$/i,
  );

  assert.equal(path.dirname(response.body.file.path), uploadPath);

  const files = await listUploadedFiles(uploadPath);

  assert.deepEqual(files, [response.body.file.filename]);
});

test("Image extension is derived from MIME type", async () => {
  const { app, uploadPath } = await createTestApp();

  const response = await request(app)
    .post("/upload")
    .attach("image", Buffer.from("jpeg test content"), {
      filename: "malicious.php",
      contentType: "image/jpeg",
    });

  assert.equal(response.statusCode, 201);
  assert.match(response.body.file.filename, /\.jpg$/);
  assert.doesNotMatch(response.body.file.filename, /\.php$/i);

  const files = await listUploadedFiles(uploadPath);

  assert.equal(files.length, 1);
  assert.match(files[0], /\.jpg$/);
});

test("Unsupported image MIME returns safe 415", async () => {
  const { app, uploadPath } = await createTestApp();

  const response = await request(app)
    .post("/upload")
    .attach("image", Buffer.from("plain text"), {
      filename: "payload.txt",
      contentType: "text/plain",
    });

  assert.equal(response.statusCode, 415);
  assert.deepEqual(response.body, {
    success: false,
    message: "Faqat JPG, PNG yoki WEBP rasmlarini yuklash mumkin.",
  });

  assert.deepEqual(await listUploadedFiles(uploadPath), []);
});

test("Unexpected upload field returns safe 400", async () => {
  const { app, uploadPath } = await createTestApp();

  const response = await request(app)
    .post("/upload")
    .attach("avatar", Buffer.from("test image"), {
      filename: "avatar.png",
      contentType: "image/png",
    });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Rasm maydoni noto'g'ri.");

  assert.deepEqual(await listUploadedFiles(uploadPath), []);
});

test("Image larger than five megabytes returns 413", async () => {
  const { app, uploadPath } = await createTestApp();

  const oversizedImage = Buffer.alloc(5 * 1024 * 1024 + 1, 0x41);

  const response = await request(app)
    .post("/upload")
    .attach("image", oversizedImage, {
      filename: "large.png",
      contentType: "image/png",
    });

  assert.equal(response.statusCode, 413);
  assert.equal(response.body.success, false);
  assert.equal(
    response.body.message,
    "Rasm hajmi belgilangan limitdan oshib ketdi.",
  );

  assert.deepEqual(await listUploadedFiles(uploadPath), []);
});
