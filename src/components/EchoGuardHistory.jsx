import { useState, useEffect } from "react";
import { fetchAlerts, fetchStats, clearAlerts, deleteAlert } from "../api/alerts";
import { generateIncidentReport } from "../utils/generateReports"; // ← 3a: import added

// ── Severity badge ─────────────────────────────────────────────────────────────
function Badge({ severity }) {
  const isAlert = severity === "ALERT";
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500,
      background: isAlert ? "#FCEBEB" : "#F1EFE8",
      color:      isAlert ? "#A32D2D" : "#5F5E5A",
    }}>
      {severity}
    </span>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, warn }) {
  return (
    <div style={{
      background: "var(--color-background-primary)", borderRadius: 10,
      border: "0.5px solid var(--color-border-tertiary)", padding: "12px 16px",
    }}>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 500, color: warn ? "#E24B4A" : "var(--color-text-primary)" }}>
        {value ?? "—"}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Mini bar chart for threat breakdown ───────────────────────────────────────
function ThreatBar({ label, count, max }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12,
        color: "var(--color-text-secondary)", marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{count}</span>
      </div>
      <div style={{ background: "var(--color-border-tertiary)", borderRadius: 4, height: 6, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 4,
          background: "#E24B4A", transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

// ── Per-node bar chart ────────────────────────────────────────────────────────
function NodeBar({ nodeId, total, alerts, maxTotal }) {
  const pct      = maxTotal > 0 ? (total  / maxTotal) * 100 : 0;
  const alertPct = total    > 0 ? (alerts / total)    * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12,
        color: "var(--color-text-secondary)", marginBottom: 4 }}>
        <span>{nodeId}</span>
        <span>
          <span style={{ fontWeight: 500, color: "#E24B4A" }}>{alerts} alerts</span>
          <span style={{ color: "var(--color-text-tertiary)" }}> / {total} total</span>
        </span>
      </div>
      <div style={{ background: "var(--color-border-tertiary)", borderRadius: 4, height: 8,
        overflow: "hidden", position: "relative" }}>
        <div style={{ width: `${pct}%`, height: "100%",
          background: "var(--color-border-secondary)", borderRadius: 4, position: "absolute" }} />
        <div style={{ width: `${alertPct}%`, height: "100%", background: "#E24B4A",
          borderRadius: 4, position: "absolute", maxWidth: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Settings slider row ───────────────────────────────────────────────────────
function SliderRow({ label, value, min, max, step = 1, unit = "", onChange, description }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{label}</span>
          {description && (
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>{description}</div>
          )}
        </div>
        <span style={{
          fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)",
          background: "var(--color-background-tertiary)", padding: "2px 10px",
          borderRadius: 6, minWidth: 56, textAlign: "center",
          border: "0.5px solid var(--color-border-tertiary)",
        }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#E24B4A", cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10,
        color: "var(--color-text-tertiary)", marginTop: 2 }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, description, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{label}</div>
        {description && (
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>{description}</div>
        )}
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 42, height: 24, borderRadius: 12, cursor: "pointer", position: "relative",
          background: value ? "#E24B4A" : "var(--color-border-secondary)",
          transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 3, left: value ? 21 : 3,
          width: 18, height: 18, borderRadius: "50%", background: "white",
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
    </div>
  );
}

// ── 3d (bonus): Reusable Export PDF button ────────────────────────────────────
// Extracted as a shared component so History and Analytics toolbars
// don't duplicate the button's inline styles.
function ExportButton({ onClick, exporting }) {
  return (
    <button
      onClick={onClick}
      disabled={exporting}
      style={{
        fontSize:     12,
        background:   exporting ? "var(--color-background-secondary)" : "#1a1a1a",
        color:        exporting ? "var(--color-text-tertiary)" : "white",
        border:       "none",
        borderRadius: 6,
        padding:      "5px 14px",
        cursor:       exporting ? "not-allowed" : "pointer",
        display:      "flex",
        alignItems:   "center",
        gap:          6,
        opacity:      exporting ? 0.6 : 1,
        transition:   "all 0.2s",
      }}
    >
      {exporting ? "⏳ Generating..." : "⬇ Export PDF"}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function EchoGuardHistory({ settings, onSettingsChange }) {
  const [activeSection,  setActiveSection]  = useState("history");
  const [alerts,         setAlerts]         = useState([]);
  const [stats,          setStats]          = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [page,           setPage]           = useState(0);
  const [total,          setTotal]          = useState(0);
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [confirmClear,   setConfirmClear]   = useState(false);
  const [exporting,      setExporting]      = useState(false); // ← 3b: export loading state

  const PAGE_SIZE = 20;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [alertsRes, statsRes] = await Promise.all([
        fetchAlerts(PAGE_SIZE, page * PAGE_SIZE),
        fetchStats(),
      ]);
      setAlerts(alertsRes.data);
      setTotal(alertsRes.total);
      setStats(statsRes);
    } catch (err) {
      console.error("Failed to load EchoGuard history data", err);
      setError("Could not connect to the backend. Make sure the server is running on port 4000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "history" || activeSection === "analytics") loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, page]);

  const handleDelete = async (id) => {
    await deleteAlert(id);
    loadData();
  };

  const handleClearAll = async () => {
    await clearAlerts();
    setConfirmClear(false);
    loadData();
  };

  // ── 3c: PDF export handler ────────────────────────────────────────────────
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Fetch ALL records (bypass page limit) so the report is complete
      const [allAlertsRes, statsRes] = await Promise.all([
        fetchAlerts(1000, 0),
        fetchStats(),
      ]);
      await generateIncidentReport({
        alerts:   allAlertsRes.data,
        stats:    statsRes,
        settings,
      });
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Check the console for details.");
    } finally {
      setExporting(false);
    }
  };

  const filteredAlerts = filterSeverity === "ALL"
    ? alerts
    : alerts.filter(a => a.severity === filterSeverity);

  const maxThreatCount = stats?.threats?.length
    ? Math.max(...stats.threats.map(t => t.count))
    : 1;

  const maxNodeTotal = stats?.perNode?.length
    ? Math.max(...stats.perNode.map(n => n.total_events))
    : 1;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)" }}>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)", padding: "0 1.5rem" }}>
        {[
          { id: "history",   label: "📋  Alert History" },
          { id: "analytics", label: "📊  Analytics"     },
          { id: "settings",  label: "⚙️  Settings"      },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "14px 20px", fontSize: 13, fontWeight: 500,
            color: activeSection === s.id ? "#E24B4A" : "var(--color-text-secondary)",
            borderBottom: activeSection === s.id ? "2px solid #E24B4A" : "2px solid transparent",
            marginBottom: -1, transition: "all 0.15s",
          }}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "1.5rem" }}>

        {/* ── HISTORY SECTION ───────────────────────────────────────────────── */}
        {activeSection === "history" && (
          <div>
            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Filter:</span>
                {["ALL", "ALERT", "AMBIENT"].map(f => (
                  <button key={f} onClick={() => setFilterSeverity(f)} style={{
                    fontSize: 12, padding: "4px 12px", borderRadius: 20, border: "1px solid",
                    cursor: "pointer",
                    background: filterSeverity === f
                      ? (f === "ALERT" ? "#E24B4A" : f === "AMBIENT" ? "#888780" : "#378ADD")
                      : "transparent",
                    borderColor: filterSeverity === f
                      ? (f === "ALERT" ? "#E24B4A" : f === "AMBIENT" ? "#888780" : "#378ADD")
                      : "var(--color-border-tertiary)",
                    color: filterSeverity === f ? "white" : "var(--color-text-secondary)",
                  }}>{f}</button>
                ))}
              </div>

              {/* ── 3d: History toolbar — Refresh · Export PDF · Clear all ── */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={loadData} style={{ fontSize: 12 }}>↺ Refresh</button>

                <ExportButton onClick={handleExportPDF} exporting={exporting} />

                {!confirmClear ? (
                  <button onClick={() => setConfirmClear(true)}
                    style={{ fontSize: 12, background: "#FCEBEB", color: "#A32D2D",
                      border: "1px solid #E24B4A" }}>
                    🗑 Clear all
                  </button>
                ) : (
                  <>
                    <button onClick={handleClearAll}
                      style={{ fontSize: 12, background: "#E24B4A", color: "white", border: "none" }}>
                      Confirm clear
                    </button>
                    <button onClick={() => setConfirmClear(false)} style={{ fontSize: 12 }}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "#FCEBEB", border: "1px solid #E24B4A", borderRadius: 8,
                padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#A32D2D" }}>
                ⚠️ {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: "center", padding: 40,
                color: "var(--color-text-tertiary)", fontSize: 13 }}>
                Loading records...
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
              <>
                <div style={{ background: "var(--color-background-primary)", borderRadius: 10,
                  border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden" }}>
                  {/* Table header */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 1fr 1fr 1fr 40px",
                    padding: "10px 16px", background: "var(--color-background-secondary)",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", gap: 8,
                  }}>
                    <span>Time</span>
                    <span>Node</span>
                    <span>Threat</span>
                    <span>Confidence</span>
                    <span>Severity</span>
                    <span>Response</span>
                    <span></span>
                  </div>

                  {/* Table rows */}
                  {filteredAlerts.length === 0 && (
                    <div style={{ padding: 32, textAlign: "center",
                      color: "var(--color-text-tertiary)", fontSize: 13 }}>
                      No records found.
                    </div>
                  )}
                  {filteredAlerts.map((a, i) => (
                    <div key={a.id} style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 1fr 1fr 1fr 40px",
                      padding: "10px 16px", gap: 8, fontSize: 12,
                      borderBottom: i < filteredAlerts.length - 1
                        ? "0.5px solid var(--color-border-tertiary)" : "none",
                      background: a.severity === "ALERT" ? "#FCEBEB08" : "transparent",
                      alignItems: "center",
                    }}>
                      <span style={{ color: "var(--color-text-tertiary)", fontSize: 11 }}>
                        {new Date(a.created_at).toLocaleString("en-GB", {
                          day: "2-digit", month: "short",
                          hour: "2-digit", minute: "2-digit", second: "2-digit",
                        })}
                      </span>
                      <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                        {a.node_id}
                        {a.node_label && (
                          <span style={{ fontWeight: 400, color: "var(--color-text-tertiary)",
                            fontSize: 10, display: "block" }}>
                            {a.node_label}
                          </span>
                        )}
                      </span>
                      <span style={{ color: "var(--color-text-primary)" }}>
                        {a.threat_label}
                        <span style={{ color: "var(--color-text-tertiary)", fontSize: 10,
                          display: "block" }}>{a.threat_type}</span>
                      </span>
                      <span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ flex: 1, background: "var(--color-border-tertiary)",
                            borderRadius: 3, height: 4, overflow: "hidden" }}>
                            <div style={{
                              width: `${a.confidence}%`, height: "100%", borderRadius: 3,
                              background: a.confidence >= 90 ? "#E24B4A" : "#EF9F27",
                            }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
                            color: a.confidence >= 90 ? "#E24B4A" : "#EF9F27" }}>
                            {Number(a.confidence).toFixed(1)}%
                          </span>
                        </div>
                      </span>
                      <span><Badge severity={a.severity} /></span>
                      <span style={{ color: "var(--color-text-secondary)", fontSize: 11 }}>
                        {a.response_ms != null ? `${(a.response_ms / 1000).toFixed(1)}s` : "—"}
                      </span>
                      <button onClick={() => handleDelete(a.id)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--color-text-tertiary)", fontSize: 14, padding: 4,
                        borderRadius: 4, lineHeight: 1,
                      }} title="Delete record">×</button>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginTop: 12, fontSize: 12,
                  color: "var(--color-text-secondary)" }}>
                  <span>
                    Showing {Math.min(filteredAlerts.length, PAGE_SIZE)} of {total} records
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      style={{ fontSize: 12, opacity: page === 0 ? 0.4 : 1 }}>
                      ← Prev
                    </button>
                    <span style={{ padding: "4px 10px", background: "var(--color-background-primary)",
                      borderRadius: 6, border: "0.5px solid var(--color-border-tertiary)" }}>
                      Page {page + 1} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
                    </span>
                    <button onClick={() => setPage(p => p + 1)}
                      disabled={(page + 1) * PAGE_SIZE >= total}
                      style={{ fontSize: 12, opacity: (page + 1) * PAGE_SIZE >= total ? 0.4 : 1 }}>
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ANALYTICS SECTION ─────────────────────────────────────────────── */}
        {activeSection === "analytics" && (
          <div>
            {loading && (
              <div style={{ textAlign: "center", padding: 40,
                color: "var(--color-text-tertiary)", fontSize: 13 }}>
                Loading analytics...
              </div>
            )}
            {!loading && stats && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                  <StatCard label="Total events"      value={stats.overall.totalEvents} />
                  <StatCard label="Confirmed alerts"  value={stats.overall.totalAlerts}
                    warn={stats.overall.totalAlerts > 0} />
                  <StatCard label="Ambient dismissed" value={stats.overall.totalAmbient} />
                  <StatCard label="Avg response time"
                    value={stats.overall.avgResponseMs
                      ? `${(stats.overall.avgResponseMs / 1000).toFixed(1)}s` : "—"}
                    sub={stats.overall.minResponseMs && stats.overall.maxResponseMs
                      ? `Min ${(stats.overall.minResponseMs / 1000).toFixed(1)}s · Max ${(stats.overall.maxResponseMs / 1000).toFixed(1)}s`
                      : null}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "var(--color-background-primary)", borderRadius: 10,
                    border: "0.5px solid var(--color-border-tertiary)", padding: "16px 20px" }}>
                    <div style={{ fontSize: 13, fontWeight: 500,
                      color: "var(--color-text-primary)", marginBottom: 16 }}>
                      Threat type breakdown
                    </div>
                    {stats.threats.length === 0 && (
                      <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
                        No confirmed alerts yet.
                      </div>
                    )}
                    {stats.threats.map(t => (
                      <ThreatBar key={t.threat_type} label={t.threat_label}
                        count={t.count} max={maxThreatCount} />
                    ))}
                  </div>

                  <div style={{ background: "var(--color-background-primary)", borderRadius: 10,
                    border: "0.5px solid var(--color-border-tertiary)", padding: "16px 20px" }}>
                    <div style={{ fontSize: 13, fontWeight: 500,
                      color: "var(--color-text-primary)", marginBottom: 16 }}>
                      Activity per node
                    </div>
                    {stats.perNode.length === 0 && (
                      <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
                        No data yet.
                      </div>
                    )}
                    {stats.perNode.map(n => (
                      <NodeBar key={n.node_id} nodeId={n.node_id}
                        total={n.total_events} alerts={n.alerts}
                        maxTotal={maxNodeTotal} />
                    ))}
                  </div>
                </div>

                {/* ── 3d: Analytics footer — Refresh + Export PDF ─────────── */}
                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button onClick={loadData} style={{ fontSize: 12 }}>↺ Refresh analytics</button>
                  <ExportButton onClick={handleExportPDF} exporting={exporting} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SETTINGS SECTION ──────────────────────────────────────────────── */}
        {activeSection === "settings" && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>
              Tune the simulation engine. Changes apply immediately to the Live Simulation and GIS Map tabs.
            </div>

            {/* Detection */}
            <div style={{ background: "var(--color-background-primary)", borderRadius: 10,
              border: "0.5px solid var(--color-border-tertiary)", padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500,
                color: "var(--color-text-primary)", marginBottom: 20 }}>
                🎯 Detection Engine
              </div>
              <SliderRow
                label="Confidence threshold"
                description="Minimum CNN confidence required to raise a vandalism alert"
                value={settings.confidenceThreshold} min={50} max={99} step={1} unit="%"
                onChange={v => onSettingsChange("confidenceThreshold", v)}
              />
              <SliderRow
                label="Simulation tick interval"
                description="How often the engine checks for random events"
                value={settings.tickInterval} min={1000} max={10000} step={500} unit="ms"
                onChange={v => onSettingsChange("tickInterval", v)}
              />
              <SliderRow
                label="Vandalism event probability"
                description="Chance per tick that a threat event is injected"
                value={settings.threatProbability} min={1} max={50} step={1} unit="%"
                onChange={v => onSettingsChange("threatProbability", v)}
              />
              <SliderRow
                label="Ambient noise probability"
                description="Chance per tick that an ambient noise event fires"
                value={settings.ambientProbability} min={1} max={40} step={1} unit="%"
                onChange={v => onSettingsChange("ambientProbability", v)}
              />
            </div>

            {/* Mesh */}
            <div style={{ background: "var(--color-background-primary)", borderRadius: 10,
              border: "0.5px solid var(--color-border-tertiary)", padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500,
                color: "var(--color-text-primary)", marginBottom: 20 }}>
                📡 LoRaWAN Mesh
              </div>
              <SliderRow
                label="Mesh hop delay"
                description="Simulated propagation delay between each LoRa node hop"
                value={settings.meshHopDelay} min={100} max={2000} step={100} unit="ms"
                onChange={v => onSettingsChange("meshHopDelay", v)}
              />
              <SliderRow
                label="Post-alert reset delay"
                description="How long nodes stay in alert state before resetting"
                value={settings.resetDelay} min={2000} max={15000} step={500} unit="ms"
                onChange={v => onSettingsChange("resetDelay", v)}
              />
            </div>

            {/* Notifications */}
            <div style={{ background: "var(--color-background-primary)", borderRadius: 10,
              border: "0.5px solid var(--color-border-tertiary)", padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500,
                color: "var(--color-text-primary)", marginBottom: 8 }}>
                🔔 Notifications
              </div>
              <ToggleRow
                label="SMS alerts"
                description="Simulate SMS dispatch on confirmed vandalism"
                value={settings.smsEnabled}
                onChange={v => onSettingsChange("smsEnabled", v)}
              />
              <ToggleRow
                label="Telegram alerts"
                description="Simulate Telegram dispatch on confirmed vandalism"
                value={settings.telegramEnabled}
                onChange={v => onSettingsChange("telegramEnabled", v)}
              />
              <ToggleRow
                label="Persist to database"
                description="Save all events to SQLite via the backend API"
                value={settings.persistEnabled}
                onChange={v => onSettingsChange("persistEnabled", v)}
              />
              <ToggleRow
                label="Auto-simulation"
                description="Automatically inject random events while simulation is running"
                value={settings.autoSimulate}
                onChange={v => onSettingsChange("autoSimulate", v)}
              />
            </div>

            {/* Reset to defaults */}
            <button
              onClick={() => onSettingsChange("__RESET__", null)}
              style={{ fontSize: 12, background: "#FCEBEB", color: "#A32D2D",
                border: "1px solid #E24B4A", borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}
            >
              ↺ Reset all settings to defaults
            </button>
          </div>
        )}
      </div>
    </div>
  );
}