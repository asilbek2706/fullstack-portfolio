const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const createImageKitUpload = require("../../middlewares/uploadToImageKit");

const createTemporaryFile = async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "imagekit-upload-"),
  );
  const filePath = path.join(directory, "image.png");

  await fs.writeFile(filePath, "test-image");

  return {
    directory,
    filePath,
  };
};

const runMiddleware = async (middleware, req) => {
  let nextError;

  await new Promise((resolve) => {
    middleware(req, {}, (error) => {
      nextError = error;
      resolve();
    });
  });

  return nextError;
};

test("ImageKit upload skips request without file", async () => {
  let uploadCalled = false;

  const middleware = createImageKitUpload("projects", {
    async uploadImage() {
      uploadCalled = true;
    },
  });

  const error = await runMiddleware(middleware, {});

  assert.equal(error, undefined);
  assert.equal(uploadCalled, false);
});

test("ImageKit upload stores CDN metadata and removes temporary file", async () => {
  const temporary = await createTemporaryFile();
  let receivedUpload;

  const middleware = createImageKitUpload("about", {
    async uploadImage(upload) {
      receivedUpload = upload;

      return {
        url: "https://ik.imagekit.io/test/fullstack-portfolio/about/avatar.png",
        fileId: "imagekit-file-id",
      };
    },
  });

  const req = {
    file: {
      path: temporary.filePath,
      filename: "avatar.png",
    },
  };

  const error = await runMiddleware(middleware, req);

  assert.equal(error, undefined);

  assert.deepEqual(receivedUpload, {
    filePath: temporary.filePath,
    fileName: "avatar.png",
    folder: "about",
  });

  assert.equal(
    req.file.imageKitUrl,
    "https://ik.imagekit.io/test/fullstack-portfolio/about/avatar.png",
  );
  assert.equal(req.file.imageKitFileId, "imagekit-file-id");

  await assert.rejects(
    fs.access(temporary.filePath),
    (accessError) => accessError.code === "ENOENT",
  );

  await fs.rm(temporary.directory, {
    recursive: true,
    force: true,
  });
});

test("ImageKit upload removes temporary file and forwards upload error", async () => {
  const temporary = await createTemporaryFile();
  const uploadError = new Error("ImageKit upload failed");

  const middleware = createImageKitUpload("projects", {
    async uploadImage() {
      throw uploadError;
    },
  });

  const req = {
    file: {
      path: temporary.filePath,
      filename: "project.png",
    },
  };

  const error = await runMiddleware(middleware, req);

  assert.equal(error, uploadError);

  await assert.rejects(
    fs.access(temporary.filePath),
    (accessError) => accessError.code === "ENOENT",
  );

  await fs.rm(temporary.directory, {
    recursive: true,
    force: true,
  });
});

test("ImageKit upload factory requires folder name", () => {
  assert.throws(() => createImageKitUpload(""), /ImageKit papkasi/);
});
