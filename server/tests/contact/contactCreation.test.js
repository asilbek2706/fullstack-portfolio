process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { afterEach } = require("node:test");

const axios = require("axios");
const Contact = require("../../models/Contact");
const {
  createContact,
} = require("../../controllers/contactController");

const originalAxiosPost = axios.post;
const originalContactSave = Contact.prototype.save;

afterEach(() => {
  axios.post = originalAxiosPost;
  Contact.prototype.save = originalContactSave;
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

const runCreateContact = async (body) => {
  const req = { body };
  const res = createResponse();

  let nextCalled = false;
  let nextError;

  await createContact(req, res, (error) => {
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

const validBody = () => ({
  name: "Asilbek & Co",
  phone: "+998901234567",
  message: "Hello <b>world</b> & portfolio test",
});

test("Contact creation stores hashed tracking token", async () => {
  let savedContact;
  let saveCount = 0;

  Contact.prototype.save = async function saveContact() {
    savedContact = this;
    saveCount += 1;
    return this;
  };

  axios.post = async () => ({
    data: {
      result: {
        message_id: 12345,
      },
    },
  });

  const result = await runCreateContact(validBody());

  assert.equal(result.res.statusCode, 201);
  assert.equal(result.res.body.success, true);
  assert.equal(result.res.body.data.deliveryStatus, "sent");
  assert.equal(result.nextCalled, false);
  assert.equal(saveCount, 2);

  const trackingToken =
    result.res.body.data.trackingToken;

  assert.match(trackingToken, /^[A-Za-z0-9_-]{43}$/);
  assert.match(
    savedContact.trackingTokenHash,
    /^[a-f0-9]{64}$/,
  );

  const expectedHash = crypto
    .createHash("sha256")
    .update(trackingToken)
    .digest("hex");

  assert.equal(
    savedContact.trackingTokenHash,
    expectedHash,
  );
  assert.notEqual(
    savedContact.trackingTokenHash,
    trackingToken,
  );

  assert.equal(savedContact.telegramMessageId, 12345);
  assert.equal(
    savedContact.telegramDeliveryStatus,
    "sent",
  );

  assert.deepEqual(
    Object.keys(result.res.body.data).sort(),
    ["deliveryStatus", "trackingToken"],
  );
});

test("Contact creation escapes Telegram HTML safely", async () => {
  let telegramCall;

  Contact.prototype.save = async function saveContact() {
    return this;
  };

  axios.post = async (...args) => {
    telegramCall = args;

    return {
      data: {
        result: {
          message_id: 777,
        },
      },
    };
  };

  const result = await runCreateContact(validBody());

  assert.equal(result.res.statusCode, 201);
  assert.ok(telegramCall);

  const [url, payload, options] = telegramCall;

  assert.match(
    url,
    /^https:\/\/api\.telegram\.org\/bot.+\/sendMessage$/,
  );
  assert.equal(payload.parse_mode, "HTML");
  assert.equal(options.timeout, 10000);

  assert.match(payload.text, /Asilbek &amp; Co/);
  assert.match(
    payload.text,
    /Hello world &amp; portfolio test/,
  );
  assert.doesNotMatch(payload.text, /<b>world<\/b>/);
});

test("Contact remains stored when Telegram delivery fails", async () => {
  let savedContact;
  let saveCount = 0;

  Contact.prototype.save = async function saveContact() {
    savedContact = this;
    saveCount += 1;
    return this;
  };

  axios.post = async () => {
    const error = new Error("Telegram unavailable");
    error.code = "ECONNABORTED";
    throw error;
  };

  const result = await runCreateContact(validBody());

  assert.equal(result.res.statusCode, 202);
  assert.equal(result.res.body.success, true);
  assert.equal(
    result.res.body.data.deliveryStatus,
    "failed",
  );
  assert.match(
    result.res.body.data.trackingToken,
    /^[A-Za-z0-9_-]{43}$/,
  );
  assert.equal(
    savedContact.telegramDeliveryStatus,
    "failed",
  );
  assert.equal(saveCount, 2);
  assert.equal(result.nextCalled, false);
});

test("Missing Telegram message ID is treated as failed delivery", async () => {
  let savedContact;

  Contact.prototype.save = async function saveContact() {
    savedContact = this;
    return this;
  };

  axios.post = async () => ({
    data: {
      ok: true,
      result: {},
    },
  });

  const result = await runCreateContact(validBody());

  assert.equal(result.res.statusCode, 202);
  assert.equal(
    result.res.body.data.deliveryStatus,
    "failed",
  );
  assert.equal(
    savedContact.telegramDeliveryStatus,
    "failed",
  );
});

test("Database save errors are forwarded to error handler", async () => {
  const databaseError =
    new Error("Database write failed");

  let telegramCalled = false;

  Contact.prototype.save = async function saveContact() {
    throw databaseError;
  };

  axios.post = async () => {
    telegramCalled = true;
  };

  const result = await runCreateContact(validBody());

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(result.res.body, undefined);
  assert.equal(telegramCalled, false);
});
