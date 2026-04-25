const express = require("express");
const cors    = require("cors");

const signupsRouter = require("./routes/signups");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors());               // allow requests from the Vite dev server
app.use(express.json());       // parse JSON request bodies

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/signups", signupsRouter);

// Health check — useful for Docker health checks and quick browser verification
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
