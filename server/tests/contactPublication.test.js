process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  after,
  afterEach,
} = require("node:test");

const Contact = require("../models/Contact");
const realtime = require("../services/realtime");

const originalFindById = Contact.findById;
const originalEmitRealtimeEvent =
  realtime.emitRealtimeEvent;

let emittedEvents = [];

realtime.emitRealtimeEvent = (...args) => {
  emittedEvents.push(args);
};

const {
  setContactPublication,
} = require("../controllers/contactController");

afterEach(() => {
  Contact.findById = originalFindById;
  emittedEvents = [];
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

const runPublication = async (body) => {
  const req = {
    body,
    params: {
      id: "contact-id",
    },
  };

  const res = createResponse();

  let nextCalled = false;
  let nextError;

  await setContactPublication(req, res, (error) => {
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

const createContact = ({
  isAnswered = true,
  isPublic = false,
} = {}) => ({
  _id: "contact-id",
  name: "Asilbek",
  phone: "+998901234567",
  message: "Portfolio haqida savol",
  answer: "Portfolio javobi",
  isAnswered,
  isPublic,
  trackingTokenHash: "private-hash",
  telegramMessageId: 12345,
  telegramDeliveryStatus: "sent",
  updatedAt: new Date("2026-09-22T07:00:00.000Z"),
  saveCount: 0,

  async save() {
    this.saveCount += 1;
    return this;
  },
});

test("Publication accepts only isPublic boolean field", async () => {
  let databaseCalled = false;

  Contact.findById = async () => {
    databaseCalled = true;
  };

  const invalidBodies = [
    {},
    [],
    null,
    { isPublic: "true" },
    { isPublic: true, role: "admin" },
  ];

  for (const body of invalidBodies) {
    const result = await runPublication(body);

    assert.equal(result.res.statusCode, 400);
    assert.equal(result.res.body.success, false);
    assert.equal(result.nextCalled, false);
  }

  assert.equal(databaseCalled, false);
  assert.equal(emittedEvents.length, 0);
});

test("Publication returns 404 when contact does not exist", async () => {
  Contact.findById = async () => null;

  const result = await runPublication({
    isPublic: true,
  });

  assert.equal(result.res.statusCode, 404);
  assert.equal(result.res.body.success, false);
  assert.equal(result.nextCalled, false);
  assert.equal(emittedEvents.length, 0);
});

test("Unanswered contact cannot be published", async () => {
  const contact = createContact({
    isAnswered: false,
  });

  Contact.findById = async () => contact;

  const result = await runPublication({
    isPublic: true,
  });

  assert.equal(result.res.statusCode, 409);
  assert.equal(result.res.body.success, false);
  assert.equal(contact.isPublic, false);
  assert.equal(contact.saveCount, 0);
  assert.equal(emittedEvents.length, 0);
});

test("Publishing emits only public-safe contact data", async () => {
  const contact = createContact();

  Contact.findById = async (id) => {
    assert.equal(id, "contact-id");
    return contact;
  };

  const result = await runPublication({
    isPublic: true,
  });

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);
  assert.equal(contact.isPublic, true);
  assert.equal(contact.saveCount, 1);

  assert.deepEqual(emittedEvents, [
    [
      "contactPublished",
      {
        _id: contact._id,
        name: contact.name,
        message: contact.message,
        answer: contact.answer,
        updatedAt: contact.updatedAt,
      },
    ],
  ]);

  const emittedPayload = emittedEvents[0][1];

  assert.equal(
    Object.hasOwn(emittedPayload, "phone"),
    false,
  );
  assert.equal(
    Object.hasOwn(
      emittedPayload,
      "trackingTokenHash",
    ),
    false,
  );
  assert.equal(
    Object.hasOwn(
      emittedPayload,
      "telegramMessageId",
    ),
    false,
  );
  assert.equal(
    Object.hasOwn(
      emittedPayload,
      "telegramDeliveryStatus",
    ),
    false,
  );

  assert.deepEqual(result.res.body.data, {
    id: "contact-id",
    isAnswered: true,
    isPublic: true,
  });
});

test("Unpublishing emits only contact identifier", async () => {
  const contact = createContact({
    isPublic: true,
  });

  Contact.findById = async () => contact;

  const result = await runPublication({
    isPublic: false,
  });

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body.success, true);
  assert.equal(contact.isPublic, false);
  assert.equal(contact.saveCount, 1);

  assert.deepEqual(emittedEvents, [
    [
      "contactUnpublished",
      {
        _id: "contact-id",
      },
    ],
  ]);
});

test("Publication forwards database errors", async () => {
  const databaseError =
    new Error("Publication database failure");

  Contact.findById = async () => {
    throw databaseError;
  };

  const result = await runPublication({
    isPublic: true,
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, databaseError);
  assert.equal(result.res.body, undefined);
  assert.equal(emittedEvents.length, 0);
});
