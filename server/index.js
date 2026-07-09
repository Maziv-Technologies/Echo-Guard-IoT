/* global require, process, __dirname */

const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "echoguard.db");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "dist")));

// ---- Database setup ----
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS alerts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id         TEXT NOT NULL,
    node_label      TEXT,
    threat_type     TEXT NOT NULL,
    threat_label    TEXT NOT NULL,
    confidence      REAL NOT NULL,
    severity        TEXT NOT NULL,        -- 'ALERT' | 'AMBIENT'
    response_ms     INTEGER,              -- null for ambient
    notified        INTEGER DEFAULT 0,    -- 0/1 — SMS/Telegram sent
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts (created_at);
  CREATE INDEX IF NOT EXISTS idx_alerts_node_id ON alerts (node_id);
`);

// ---- Prepared statements ----
const insertAlert = db.prepare(`
  INSERT INTO alerts (node_id, node_label, threat_type, threat_label, confidence, severity, response_ms, notified)
  VALUES (@nodeId, @nodeLabel, @threatType, @threatLabel, @confidence, @severity, @responseMs, @notified)
`);

const listAlerts = db.prepare(`
  SELECT * FROM alerts ORDER BY created_at DESC LIMIT ? OFFSET ?
`);

const countAlerts = db.prepare(`SELECT COUNT(*) AS count FROM alerts`);

const statsQuery = db.prepare(`
  SELECT
    COUNT(*)                                              AS total_events,
    SUM(CASE WHEN severity = 'ALERT' THEN 1 ELSE 0 END)   AS total_alerts,
    SUM(CASE WHEN severity = 'AMBIENT' THEN 1 ELSE 0 END) AS total_ambient,
    AVG(CASE WHEN severity = 'ALERT' THEN response_ms END) AS avg_response_ms,
    MAX(CASE WHEN severity = 'ALERT' THEN response_ms END) AS max_response_ms,
    MIN(CASE WHEN severity = 'ALERT' THEN response_ms END) AS min_response_ms
  FROM alerts
`);

const perNodeStats = db.prepare(`
  SELECT node_id, node_label,
    COUNT(*) AS total_events,
    SUM(CASE WHEN severity = 'ALERT' THEN 1 ELSE 0 END) AS alerts
  FROM alerts
  GROUP BY node_id, node_label
  ORDER BY node_id
`);

const threatBreakdown = db.prepare(`
  SELECT threat_type, threat_label, COUNT(*) AS count
  FROM alerts
  WHERE severity = 'ALERT'
  GROUP BY threat_type, threat_label
  ORDER BY count DESC
`);

// ---- Routes ----

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "echo-guard-api" });
});

// Create a new alert/event record
app.post("/api/alerts", (req, res) => {
  const {
    nodeId, nodeLabel, threatType, threatLabel,
    confidence, severity, responseMs, notified,
  } = req.body;

  if (!nodeId || !threatType || !severity || confidence == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const result = insertAlert.run({
    nodeId,
    nodeLabel: nodeLabel || null,
    threatType,
    threatLabel: threatLabel || threatType,
    confidence,
    severity,
    responseMs: responseMs ?? null,
    notified: notified ? 1 : 0,
  });

  const created = db.prepare("SELECT * FROM alerts WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(created);
});

// List alerts (paginated)
app.get("/api/alerts", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;

  const rows = listAlerts.all(limit, offset);
  const { count } = countAlerts.get();

  res.json({ data: rows, total: count, limit, offset });
});

// Delete a single alert
app.delete("/api/alerts/:id", (req, res) => {
  db.prepare("DELETE FROM alerts WHERE id = ?").run(req.params.id);
  res.status(204).send();
});

// Clear all alerts
app.delete("/api/alerts", (req, res) => {
  db.exec("DELETE FROM alerts");
  res.status(204).send();
});

// Aggregate stats
app.get("/api/stats", (req, res) => {
  const overall = statsQuery.get();
  const perNode = perNodeStats.all();
  const threats = threatBreakdown.all();

  res.json({
    overall: {
      totalEvents:  overall.total_events  || 0,
      totalAlerts:  overall.total_alerts  || 0,
      totalAmbient: overall.total_ambient || 0,
      avgResponseMs: overall.avg_response_ms ? Math.round(overall.avg_response_ms) : null,
      maxResponseMs: overall.max_response_ms || null,
      minResponseMs: overall.min_response_ms || null,
    },
    perNode,
    threats,
  });
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Echo-Guard API running on http://0.0.0.0:${PORT}`);
});
