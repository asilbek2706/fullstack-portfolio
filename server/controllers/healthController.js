const mongoose = require("mongoose");

const setNoStore = (res) => {
  res.setHeader("Cache-Control", "no-store");
};

exports.getHealth = (req, res) => {
  setNoStore(res);

  return res.status(200).json({
    success: true,
    status: "healthy",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

exports.getReadiness = (req, res) => {
  setNoStore(res);

  const databaseReady = mongoose.connection.readyState === 1;

  return res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    status: databaseReady ? "ready" : "not_ready",
    checks: {
      database: databaseReady ? "connected" : "disconnected",
    },
    timestamp: new Date().toISOString(),
  });
};
