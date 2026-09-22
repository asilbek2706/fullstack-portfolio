process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  after,
  afterEach,
} = require("node:test");

const Contact = require("../../models/Contact");
const { env } = require("../../config/env");
const realtime = require("../../services/realtime");

const originalFindOne = Contact.findOne;
const originalEmitRealtimeEvent =
  realtime.emitRealtimeEvent;

let emittedEvents = [];

realtime.emitRealtimeEvent = (...args) => {
  emittedEvents.push(args);
};

const {
  handleTelegramWebhook,
} = require("../../controllers/contactController");

afterEach(() => {
  Contact.findOne = originalFindOne;
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

  send(payload) {
    this.body = payload;
    return this;
  },
});

const createValidRequest = () => ({
  headers: {
    "x-telegram-bot-api-secret-token":
      env.webhookSecretToken,
  },
  ip: "127.0.0.1",
  body: {
    update_id: 1001,
    message: {
      chat: {
        id: env.telegramChatId,
      },
      reply_to_message: {
        message_id: 9876,
      },
      text: "  Telegram orqali berilgan javob.  ",
    },
  },
});

const runWebhook = async (request) => {
  const res = createResponse();

  await handleTelegramWebhook(request, res);

  return {
    req: request,
    res,
  };
};

test("Webhook rejects incorrect secret token", async () => {
  let databaseCalled = false;

  Contact.findOne = () => {
    databaseCalled = true;
  };

  const req = createValidRequest();

  req.headers[
    "x-telegram-bot-api-secret-token"
  ] = "incorrect-webhook-secret";

  const result = await runWebhook(req);

  assert.equal(result.res.statusCode, 403);
  assert.deepEqual(result.res.body, {
    success: false,
    message: "Ruxsat etilmagan so'rov.",
  });
  assert.equal(databaseCalled, false);
  assert.equal(emittedEvents.length, 0);
});

test("Webhook ignores replies from another Telegram chat", async () => {
  let databaseCalled = false;

  Contact.findOne = () => {
    databaseCalled = true;
  };

  const req = createValidRequest();
  req.body.message.chat.id = "unauthorized-chat";

  const result = await runWebhook(req);

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body, "OK");
  assert.equal(databaseCalled, false);
  assert.equal(emittedEvents.length, 0);
});

test("Webhook ignores invalid Telegram reply payload", async () => {
  let databaseCalled = false;

  Contact.findOne = () => {
    databaseCalled = true;
  };

  const req = createValidRequest();
  req.body.message.reply_to_message.message_id = 0;
  req.body.message.text = "\u0000invalid";

  const result = await runWebhook(req);

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body, "OK");
  assert.equal(databaseCalled, false);
  assert.equal(emittedEvents.length, 0);
});

test("Webhook stores a valid Telegram reply privately", async () => {
  let receivedFilter;
  let selectedFields;
  let saveCount = 0;

  const contact = {
    _id: {
      toString: () => "contact-id",
    },
    answer: "",
    isAnswered: false,

    async save() {
      saveCount += 1;
      return this;
    },
  };

  Contact.findOne = (filter) => {
    receivedFilter = filter;

    return {
      async select(fields) {
        selectedFields = fields;
        return contact;
      },
    };
  };

  const result = await runWebhook(
    createValidRequest(),
  );

  assert.deepEqual(receivedFilter, {
    telegramMessageId: 9876,
  });
  assert.equal(
    selectedFields,
    "+telegramMessageId",
  );

  assert.equal(
    contact.answer,
    "Telegram orqali berilgan javob.",
  );
  assert.equal(contact.isAnswered, true);
  assert.equal(saveCount, 1);

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body, "OK");

  assert.equal(
    emittedEvents.length,
    0,
    "Private Telegram javobi realtime orqali uzatilmasligi kerak.",
  );
});

test("Webhook safely accepts reply for unknown contact", async () => {
  Contact.findOne = () => ({
    async select() {
      return null;
    },
  });

  const result = await runWebhook(
    createValidRequest(),
  );

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body, "OK");
  assert.equal(emittedEvents.length, 0);
});

test("Webhook returns OK when database processing fails", async () => {
  Contact.findOne = () => ({
    async select() {
      throw new Error("Database unavailable");
    },
  });

  const result = await runWebhook(
    createValidRequest(),
  );

  assert.equal(result.res.statusCode, 200);
  assert.equal(result.res.body, "OK");
  assert.equal(emittedEvents.length, 0);
});
