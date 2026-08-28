// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { verifyConnection } = require("./db");

const catalogRoutes = require("./routes/catalog");
const readinessRoutes = require("./routes/readiness");
const pathRoutes = require("./routes/path");

const app = express();
app.use(
  cors({
    origin: [
      "https://skill-path-navigator-tqfg.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);

app.use(express.json());

// Health check: confirms the API is up AND can actually reach CognoDB.
app.get("/api/health", async (req, res) => {
  try {
    await verifyConnection();
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res
      .status(503)
      .json({ status: "error", database: "unreachable", message: err.message });
  }
});

app.use("/api", catalogRoutes);
app.use("/api", readinessRoutes);
app.use("/api", pathRoutes);

// Central error handler. Any route that fails to reach CognoDB (or hits
// a bad query) lands here instead of crashing the process or hanging.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(503).json({
    error: "Could not complete the request. The database may be unreachable.",
    detail: err.message,
  });
});

const PORT = process.env.PORT || 8000;

async function start() {
  try {
    await verifyConnection();
    console.log("Connected to CognoDB.");
  } catch (err) {
    console.warn("Warning: could not verify CognoDB connection at startup.");
    console.warn(err.message);
    console.warn(
      "The server will still start, but requests will fail until the database is reachable.",
    );
  }

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start();
