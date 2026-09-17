const http = require("http");

const { env, validateEnv } = require("./config/env");
const {
  connectDatabase,
  disconnectDatabase,
} = require("./config/database");
const { createSocketServer } = require("./config/socket");
const logger = require("./utils/logger");
const app = require("./app");
const {
  registerShutdownHandlers,
} = require("./lifecycle/shutdown");

const server = http.createServer(app);
const io = createSocketServer(server);

global.io = io;

const lifecycle = registerShutdownHandlers(server);

server.on("error", async (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(
      { port: env.port },
      "Port boshqa process tomonidan ishlatilmoqda.",
    );
  } else {
    logger.error(
      { err: error },
      "HTTP server xatoligi.",
    );
  }

  await disconnectDatabase().catch(() => {});
  process.exit(1);
});

const startServer = async () => {
  try {
    validateEnv();
    await connectDatabase();

    if (lifecycle.isShuttingDown()) {
      await disconnectDatabase();
      return;
    }

    server.listen(env.port, () => {
      logger.info(
        { port: env.port },
        "Server ishga tushdi.",
      );
    });
  } catch (error) {
    logger.fatal(
      { err: error },
      "Server ishga tushmadi.",
    );
    process.exit(1);
  }
};

startServer();
