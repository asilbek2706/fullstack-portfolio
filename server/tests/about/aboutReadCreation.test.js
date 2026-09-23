process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const { afterEach } = require("node:test");

const About = require("../../models/About");

const originalFindOne = About.findOne;
const originalCreate = About.create;

const { getAbout, updateAbout } = require("../../controllers/aboutController");

afterEach(() => {
  About.findOne = originalFindOne;
  About.create = originalCreate;
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
    body = {},
    file,
    admin = {
      _id: "admin-id",
    },
  } = {},
) => {
  const req = {
    body,
    file,
    admin,
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

test("About read returns public data", async () => {
  const aboutData = {
    _id: "about-id",
    fullName: "Asilbek Karomatov",
    title: "Frontend Developer",
    avatar: "/uploads/about/123e4567-e89b-12d3-a456-426614174000.png",
    bio: "Portfolio biography.",
    experienceYears: "2",
  };

  let receivedSelect;
  let leanCalled = false;

  About.findOne = () => ({
    select(value) {
      receivedSelect = value;
      return this;
    },

    async lean() {
      leanCalled = true;
      return aboutData;
    },
  });

  const result = await runController(getAbout);

  assert.equal(receivedSelect, "-updatedBy");
  assert.equal(leanCalled, true);

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);

  assert.deepEqual(result.res.body.data, aboutData);

  assert.equal(result.nextCalled, false);
});

test("About read returns 404 before initial setup", async () => {
  About.findOne = () => ({
    select() {
      return this;
    },

    async lean() {
      return null;
    },
  });

  const result = await runController(getAbout);

  assert.equal(result.res.statusCode, 404);
  assert.equal(result.res.body.success, false);

  assert.equal(
    result.res.body.message,
    "Ma'lumotlar topilmadi. Tizim hali sozlanmagan.",
  );

  assert.equal(result.nextCalled, false);
});

test("About read forwards database errors", async () => {
  const databaseError = new Error("About lookup failed");

  About.findOne = () => ({
    select() {
      return this;
    },

    async lean() {
      throw databaseError;
    },
  });

  const result = await runController(getAbout);

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(result.res.body, undefined);
});

test("Initial About creation requires every field", async () => {
  About.findOne = async () => null;

  let createCalled = false;

  About.create = async () => {
    createCalled = true;
  };

  const result = await runController(updateAbout, {
    body: {
      fullName: "Asilbek Karomatov",
      title: "Frontend Developer",
    },
  });

  assert.equal(result.res.statusCode, 400);
  assert.equal(result.res.body.success, false);
  assert.equal(createCalled, false);

  assert.equal(
    result.res.body.message,
    "Majburiy maydonlar yetishmayapti: avatar, bio, experienceYears",
  );
});

test("Initial About creation normalizes fields and hides updatedBy", async () => {
  About.findOne = async () => null;

  let receivedPayload;

  About.create = async (payload) => {
    receivedPayload = payload;

    return {
      _id: "about-id",
      ...payload,

      toObject() {
        return {
          _id: this._id,
          fullName: this.fullName,
          title: this.title,
          avatar: this.avatar,
          bio: this.bio,
          experienceYears: this.experienceYears,
          updatedBy: this.updatedBy,
        };
      },
    };
  };

  const result = await runController(updateAbout, {
    admin: {
      _id: "creator-admin-id",
    },
    body: {
      fullName: "  Asilbek Karomatov  ",
      title: "  Frontend Developer  ",
      bio: "  Portfolio biography.  ",
      experienceYears: "  2  ",
    },
    file: {
      filename: "123e4567-e89b-12d3-a456-426614174000.png",
    },
  });

  assert.deepEqual(receivedPayload, {
    fullName: "Asilbek Karomatov",
    title: "Frontend Developer",
    avatar: "/uploads/about/123e4567-e89b-12d3-a456-426614174000.png",
    bio: "Portfolio biography.",
    experienceYears: "2",
    updatedBy: "creator-admin-id",
  });

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);

  assert.equal(Object.hasOwn(result.res.body.data, "updatedBy"), false);

  assert.equal(result.res.body.data.fullName, "Asilbek Karomatov");
});

test("About creation forwards database errors", async () => {
  About.findOne = async () => null;

  const databaseError = new Error("About create failed");

  About.create = async () => {
    throw databaseError;
  };

  const result = await runController(updateAbout, {
    body: {
      fullName: "Asilbek Karomatov",
      title: "Frontend Developer",
      bio: "Portfolio biography.",
      experienceYears: "2",
    },
    file: {
      filename: "223e4567-e89b-12d3-a456-426614174000.webp",
    },
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(result.res.body, undefined);
});

test("Existing About save errors are forwarded", async () => {
  const databaseError = new Error("About save failed");

  About.findOne = async () => ({
    fullName: "Old name",
    title: "Old title",
    avatar: "/uploads/old.png",
    bio: "Old biography",
    experienceYears: "1",

    async save() {
      throw databaseError;
    },
  });

  const result = await runController(updateAbout, {
    body: {
      title: "Updated title",
    },
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(result.res.body, undefined);
});
