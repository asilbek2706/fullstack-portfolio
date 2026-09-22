process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

const test = require("node:test");
const assert = require("node:assert/strict");
const { afterEach } = require("node:test");

const {
  setRealtimeServer,
  emitRealtimeEvent,
  disconnectRealtimeClients,
  clearRealtimeServer,
} = require("../../services/realtime");

afterEach(() => {
  clearRealtimeServer();
});

test("Realtime emit returns false before server initialization", () => {
  const result = emitRealtimeEvent("projectCreated", {
    id: "project-id",
  });

  assert.equal(result, false);
});

test("Realtime emit forwards event and payload", () => {
  const emitted = [];

  setRealtimeServer({
    emit(eventName, payload) {
      emitted.push([eventName, payload]);
    },
  });

  const payload = {
    id: "project-id",
    title: "Portfolio",
  };

  const result = emitRealtimeEvent("projectCreated", payload);

  assert.equal(result, true);

  assert.deepEqual(emitted, [["projectCreated", payload]]);
});

test("Realtime emit safely handles socket errors", () => {
  setRealtimeServer({
    emit() {
      throw new Error("Socket transport failed");
    },
  });

  const result = emitRealtimeEvent("projectUpdated", {
    id: "project-id",
  });

  assert.equal(result, false);
});

test("Realtime disconnect closes every connected client", () => {
  const calls = [];

  setRealtimeServer({
    disconnectSockets(close) {
      calls.push(close);
    },
  });

  disconnectRealtimeClients();

  assert.deepEqual(calls, [true]);
});

test("Cleared realtime server no longer emits or disconnects", () => {
  let emitCalled = false;
  let disconnectCalled = false;

  setRealtimeServer({
    emit() {
      emitCalled = true;
    },

    disconnectSockets() {
      disconnectCalled = true;
    },
  });

  clearRealtimeServer();

  assert.equal(emitRealtimeEvent("contactPublished", {}), false);

  disconnectRealtimeClients();

  assert.equal(emitCalled, false);
  assert.equal(disconnectCalled, false);
});
