const logger = require("../utils/logger");

let socketServer = null;

const setRealtimeServer = (io) => {
  socketServer = io;
};

const emitRealtimeEvent = (eventName, payload) => {
  if (!socketServer) {
    logger.warn(
      { eventName },
      "Realtime server hali ishga tushmagan.",
    );
    return false;
  }

  try {
    socketServer.emit(eventName, payload);
    return true;
  } catch (error) {
    logger.error(
      { err: error, eventName },
      "Realtime event yuborilmadi.",
    );
    return false;
  }
};

const disconnectRealtimeClients = () => {
  if (!socketServer) return;

  socketServer.disconnectSockets(true);
};

const clearRealtimeServer = () => {
  socketServer = null;
};

module.exports = {
  setRealtimeServer,
  emitRealtimeEvent,
  disconnectRealtimeClients,
  clearRealtimeServer,
};
