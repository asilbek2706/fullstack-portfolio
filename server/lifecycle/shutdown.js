const { disconnectDatabase } = require("../config/database");
const logger = require("../utils/logger");
const {
  disconnectRealtimeClients,
  clearRealtimeServer,
} = require("../services/realtime");

const registerShutdownHandlers = (server) => {
  let isShuttingDown = false;

  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, "Server yopilmoqda.");

    try {
      disconnectRealtimeClients();

      if (server.listening) {
        await new Promise((resolve, reject) => {
          server.close((error) => {
            if (error) return reject(error);
            resolve();
          });
        });
      }

      clearRealtimeServer();
      await disconnectDatabase();
      logger.info("Server muvaffaqiyatli yopildi.");
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, "Serverni yopishda xatolik.");
      process.exit(1);
    }
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));

  return {
    isShuttingDown: () => isShuttingDown,
    shutdown,
  };
};

module.exports = {
  registerShutdownHandlers,
};
