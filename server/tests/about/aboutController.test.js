process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const {
  test,
  afterEach,
} = require("node:test");
const assert = require("node:assert/strict");

const About = require("../../models/About");
const aboutController = require("../../controllers/aboutController");

const originalFindOne = About.findOne;

afterEach(() => {
  About.findOne = originalFindOne;
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

const runUpdateAbout = async (body) => {
  const req = {
    body,
    admin: {
      _id: "507f1f77bcf86cd799439011",
    },
  };
  const res = createResponse();
  let nextError;
  let nextCalled = false;

  await aboutController.updateAbout(
    req,
    res,
    (error) => {
      nextCalled = true;
      nextError = error;
    },
  );

  return {
    req,
    res,
    nextCalled,
    nextError,
  };
};

test("About update rejects unknown fields", async () => {
  const { res, nextCalled } = await runUpdateAbout({
    role: "superadmin",
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.equal(
    res.body.message,
    "Ruxsat etilmagan maydonlar: role",
  );
});

test("About update rejects empty body", async () => {
  const { res, nextCalled } = await runUpdateAbout({});

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /kamida bitta maydon/);
});

test("About update rejects array body", async () => {
  const { res, nextCalled } = await runUpdateAbout([]);

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /kamida bitta maydon/);
});

test("About update rejects non-string field", async () => {
  const { res, nextCalled } = await runUpdateAbout({
    fullName: {
      value: "Asilbek",
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.equal(
    res.body.message,
    "fullName matn ko'rinishida bo'lishi kerak.",
  );
});

test("About update rejects whitespace-only field", async () => {
  const { res, nextCalled } = await runUpdateAbout({
    bio: "   ",
  });

  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.equal(
    res.body.message,
    "bio bo'sh bo'lishi mumkin emas.",
  );
});

test("About partial update trims input and hides updatedBy", async () => {
  let saveCalled = false;

  const aboutDocument = {
    fullName: "Old Name",
    title: "Frontend Developer",
    avatar: "/uploads/avatar.jpg",
    bio: "Old bio",
    experienceYears: "1 yil",
    updatedBy: "old-admin",
    async save() {
      saveCalled = true;
    },
    toObject() {
      return {
        fullName: this.fullName,
        title: this.title,
        avatar: this.avatar,
        bio: this.bio,
        experienceYears: this.experienceYears,
        updatedBy: this.updatedBy,
      };
    },
  };

  About.findOne = async () => aboutDocument;

  const { res, nextCalled, nextError } =
    await runUpdateAbout({
      fullName: "  Asilbek Karomatov  ",
    });

  assert.equal(nextCalled, false);
  assert.equal(nextError, undefined);
  assert.equal(saveCalled, true);
  assert.equal(res.statusCode, 200);
  assert.equal(
    res.body.data.fullName,
    "Asilbek Karomatov",
  );
  assert.equal(
    Object.hasOwn(res.body.data, "updatedBy"),
    false,
  );
});
