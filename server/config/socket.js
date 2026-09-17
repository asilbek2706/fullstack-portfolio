const { Server } = require("socket.io");

const { corsOptions } = require("./cors");
const logger = require("../utils/logger");

const createSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      ...corsOptions,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.debug(
      { socketId: socket.id },
      "Socket foydalanuvchisi ulandi.",
    );

    socket.on("disconnect", (reason) => {
      logger.debug(
        { socketId: socket.id, reason },
        "Socket foydalanuvchisi uzildi.",
      );
    });
  });

  return io;
};

module.exports = {
  createSocketServer,
};
