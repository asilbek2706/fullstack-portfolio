process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const crypto = require("node:crypto");
const fs = require("node:fs").promises;
const request = require("supertest");
const { afterEach } = require("node:test");

const app = require("../../app");
const {
  uploadImage,
} = require("../../controllers/uploadController");

const uploadsRoot = path.resolve(
  __dirname,
  "../../uploads",
);

const createdFiles = [];

afterEach(async () => {
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

test("Upload controller rejects request without file", () => {
  const req = {};
  const res = createResponse();

  uploadImage(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: "Rasm yuklanmadi.",
  });
});

test("Upload controller returns only safe relative URL", () => {
  const filename =
    `${crypto.randomUUID()}.png`;

  const req = {
    protocol: "https",
    file: {
      filename,
      path: `/private/server/uploads/${filename}`,
      destination: "/private/server/uploads",
      mimetype: "image/png",
      size: 1234,
    },

    get(headerName) {
      if (headerName === "host") {
        return "attacker-controlled.example";
      }

      return undefined;
    },
  };

  const res = createResponse();

  uploadImage(req, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, {
    success: true,
    url: `/uploads/${filename}`,
  });

  assert.equal(
    Object.hasOwn(res.body, "path"),
    false,
  );
  assert.equal(
    Object.hasOwn(res.body, "destination"),
    false,
  );
  assert.doesNotMatch(
    res.body.url,
    /attacker-controlled/,
  );
  assert.doesNotMatch(
    res.body.url,
    /private\/server/,
  );
});

test("Static image delivery returns hardened cache headers", async () => {
  await fs.mkdir(uploadsRoot, {
    recursive: true,
  });

  const filename =
    `${crypto.randomUUID()}.png`;
  const filePath = path.join(
    uploadsRoot,
    filename,
  );

  const pngContent = Buffer.from([
    0x89, 0x50, 0x4e, 0x47,
    0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x00,
  ]);

  await fs.writeFile(filePath, pngContent);
  createdFiles.push(filePath);

  const response = await request(app)
    .get(`/uploads/${filename}`)
    .set(
      "Origin",
      "http://localhost:5173",
    );

  assert.equal(response.statusCode, 200);
  assert.match(
    response.headers["content-type"],
    /^image\/png/,
  );
  assert.equal(
    response.headers["x-content-type-options"],
    "nosniff",
  );
  assert.equal(
    response.headers[
      "cross-origin-resource-policy"
    ],
    "cross-origin",
  );
  assert.match(
    response.headers["cache-control"],
    /public/,
  );
  assert.match(
    response.headers["cache-control"],
    /max-age=31536000/,
  );
  assert.match(
    response.headers["cache-control"],
    /immutable/,
  );
  assert.equal(
    response.headers["access-control-allow-origin"],
    "http://localhost:5173",
  );
});

test("Static upload directory index is disabled", async () => {
  const response = await request(app)
    .get("/uploads/");

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: "So'ralgan endpoint topilmadi.",
  });
});

test("Static delivery denies hidden dotfiles", async () => {
  await fs.mkdir(uploadsRoot, {
    recursive: true,
  });

  const filename =
    `.secret-${crypto.randomUUID()}`;
  const filePath = path.join(
    uploadsRoot,
    filename,
  );

  await fs.writeFile(
    filePath,
    "private-data",
  );

  createdFiles.push(filePath);

  const response = await request(app)
    .get(`/uploads/${filename}`);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: "So'ralgan endpoint topilmadi.",
  });
});

test("Missing static image returns safe 404 response", async () => {
  const filename =
    `${crypto.randomUUID()}.png`;

  const response = await request(app)
    .get(`/uploads/${filename}`);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: "So'ralgan endpoint topilmadi.",
  });
});
