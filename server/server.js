const http = require("http");

const { env, validateEnv } = require("./config/env");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const { createSocketServer } = require("./config/socket");
const logger = require("./utils/logger");
const app = require("./app");
const { registerShutdownHandlers } = require("./lifecycle/shutdown");

const server = http.createServer(app);

server.requestTimeout = 30_000;
server.headersTimeout = 15_000;
server.keepAliveTimeout = 5_000;
server.maxHeadersCount = 100;
server.maxRequestsPerSocket = 1_000;

createSocketServer(server);

const lifecycle = registerShutdownHandlers(server);

server.on("clientError", (error, socket) => {
  logger.warn(
    {
      errorCode: error.code,
      remoteAddress: socket.remoteAddress,
    },
    "Noto'g'ri HTTP connection rad etildi.",
  );

  if (socket.writable) {
    socket.end(
      "HTTP/1.1 400 Bad Request\r\n" +
        "Connection: close\r\n" +
        "Content-Length: 0\r\n\r\n",
    );
  }
});

server.on("error", async (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(
      { port: env.port },
      "Port boshqa process tomonidan ishlatilmoqda.",
    );
  } else {
    logger.error({ err: error }, "HTTP server xatoligi.");
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
      logger.info({ port: env.port }, "Server ishga tushdi.");
    });
  } catch (error) {
    logger.fatal({ err: error }, "Server ishga tushmadi.");
    process.exit(1);
  }
};

startServer();
