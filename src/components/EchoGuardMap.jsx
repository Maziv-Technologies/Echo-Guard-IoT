import { postAlert } from "../api/alerts";
import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";


// Fix Leaflet default marker icon broken by Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Niger Delta pipeline corridor — state capitals, west to east toward the gateway
const PIPELINE_NODES = [
  { id: "N1", label: "Node 1 — Asaba (Delta State)",        lat: 6.2059, lng: 6.6959 },
  { id: "N2", label: "Node 2 — Yenagoa (Bayelsa State)",    lat: 4.9247, lng: 6.2642 },
  { id: "N3", label: "Node 3 — Owerri (Imo State)",         lat: 5.4836, lng: 7.0333 },
  { id: "N4", label: "Node 4 — Port Harcourt (Rivers State)", lat: 4.8156, lng: 7.0498 },
  { id: "N5", label: "Node 5 — Uyo (Akwa Ibom State)",      lat: 5.0377, lng: 7.9128 },
];

const GATEWAY = {
  id: "GW", label: "LoRa Gateway — Benin City Hub",
  lat: 6.3350, lng: 5.6270,
};

const STATUS_COLORS = {
  idle:      "#888780",
  detecting: "#EF9F27",
  alert:     "#E24B4A",
  relaying:  "#378ADD",
};

const THREAT_TYPES = [
  { type: "hacksaw",  label: "Hacksaw",        icon: "🔪", conf: () => 92 + Math.random() * 6  },
  { type: "drill",    label: "Motorized drill", icon: "🔩", conf: () => 88 + Math.random() * 9  },
  { type: "hammer",   label: "Hammer strike",   icon: "🔨", conf: () => 90 + Math.random() * 8  },
  { type: "vehicle",  label: "Heavy vehicle",   icon: "🚛", conf: () => 72 + Math.random() * 10 },
];

// Animates the map to the alert node
function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 11, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

function createNodeIcon(status, nodeId) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.idle;
  const pulse  = status === "alert";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
      ${pulse ? `<circle cx="22" cy="22" r="20" fill="${color}" opacity="0.2"/>` : ""}
      <circle cx="22" cy="22" r="14" fill="${color}" opacity="0.25" stroke="${color}" stroke-width="2"/>
      <circle cx="22" cy="22" r="8"  fill="${color}"/>
      <text x="22" y="42" text-anchor="middle" font-size="9" fill="#444" font-family="sans-serif" font-weight="600">${nodeId}</text>
    </svg>`;
  return L.divIcon({
    html:      svg,
    className: "",
    iconSize:  [44, 52],
    iconAnchor:[22, 22],
  });
}

function createGatewayIcon(active) {
  const color = active ? "#378ADD" : "#5F5E5A";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
      <rect x="6" y="6" width="36" height="36" rx="6" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="2"/>
      <rect x="14" y="14" width="20" height="20" rx="3" fill="${color}"/>
      <text x="24" y="52" text-anchor="middle" font-size="9" fill="#444" font-family="sans-serif" font-weight="600">GW</text>
    </svg>`;
  return L.divIcon({
    html:      svg,
    className: "",
    iconSize:  [48, 56],
    iconAnchor:[24, 24],
  });
}

export default function EchoGuardMap() {
  const [nodeStates, setNodeStates] = useState(
    () => Object.fromEntries(PIPELINE_NODES.map(n => [n.id, { status: "idle", threat: null, confidence: null }]))
  );
  const [gwActive,   setGwActive]   = useState(false);
  const [logs,       setLogs]       = useState([]);
  const [stats,      setStats]      = useState({ detected: 0, alerts: 0, ambient: 0, avgResponse: 0, responseTimes: [] });
  const [running,    setRunning]    = useState(true);
  const [flyTo,      setFlyTo]      = useState(null);
  const [activePacket, setActivePacket] = useState(null); // {fromIdx, toIdx}
  const logEndRef = useRef(null);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const addLog = useCallback((type, msg) => {
    const t = new Date().toLocaleTimeString("en-GB");
    setLogs(prev => [...prev.slice(-100), { time: t, type, msg }]);
  }, []);

  const propagateMesh = useCallback((triggerNodeId, threat, detectionStart, confidence) => {
    const triggerIdx = PIPELINE_NODES.findIndex(n => n.id === triggerNodeId);
    const chain = [];
    for (let i = triggerIdx + 1; i < PIPELINE_NODES.length; i++) chain.push(PIPELINE_NODES[i].id);
    chain.push("GW");

    chain.forEach((toId, i) => {
      const fromId = i === 0 ? triggerNodeId : chain[i - 1];
      const fromIdx = PIPELINE_NODES.findIndex(n => n.id === fromId);
      const toIdx   = PIPELINE_NODES.findIndex(n => n.id === toId);

      setTimeout(() => {
        setActivePacket({ fromIdx, toIdx });
        if (toId !== "GW") {
          setNodeStates(prev => ({ ...prev, [toId]: { status: "relaying", threat, confidence: null } }));
          addLog("RELAY", `${fromId} → ${toId} — packet forwarded`);
        } else {
  setGwActive(true);
  const ms = Date.now() - detectionStart;
  addLog("ALERT", `✅ Gateway alert received — response: ${(ms / 1000).toFixed(1)}s`);
  setStats(prev => {
    const times = [...prev.responseTimes, ms];
    return { ...prev, avgResponse: Math.round(times.reduce((a, b) => a + b, 0) / times.length), responseTimes: times };
  });
  setTimeout(() => addLog("NOTIFY", "📱 SMS + Telegram alert dispatched"), 500);

  // Persist confirmed alert
  const triggerNode = PIPELINE_NODES.find(n => n.id === triggerNodeId);
  postAlert({
    nodeId: triggerNodeId,
    nodeLabel: triggerNode?.label,
    threatType: threat.type,
    threatLabel: threat.label,
    confidence: confidence,
    severity: "ALERT",
    responseMs: ms,
    notified: true,
  }).catch(err => console.error("Failed to save alert:", err));
          setTimeout(() => {
            setGwActive(false);
            setActivePacket(null);
            PIPELINE_NODES.forEach(n =>
              setNodeStates(prev => ({ ...prev, [n.id]: { status: "idle", threat: null, confidence: null } }))
            );
            addLog("CLEAR", "System reset — all nodes monitoring");
          }, 5500);
        }
      }, 500 * (i + 1));
    });
  }, [addLog]);

  const triggerThreat = useCallback((nodeId) => {
    const threat = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
    const conf   = threat.conf();
    const isVandalism = conf >= 90;
    const detectionStart = Date.now();
    const node = PIPELINE_NODES.find(n => n.id === nodeId);

    setNodeStates(prev => ({ ...prev, [nodeId]: { status: "detecting", threat, confidence: conf * 0.3 } }));
    setFlyTo([node.lat, node.lng]);
    addLog("DETECT", `${nodeId} — ${threat.label} detected`);
    setStats(prev => ({ ...prev, detected: prev.detected + 1 }));

    let progress = 0.3;
    const ramp = setInterval(() => {
      progress = Math.min(1, progress + 0.08);
      setNodeStates(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], confidence: conf * progress } }));
      if (progress >= 1) {
        clearInterval(ramp);
        if (isVandalism) {
          setNodeStates(prev => ({ ...prev, [nodeId]: { status: "alert", threat, confidence: conf } }));
          addLog("ALERT", `🚨 ${nodeId} — VANDALISM CONFIRMED! ${threat.icon} ${threat.label} @ ${conf.toFixed(1)}%`);
          setStats(prev => ({ ...prev, alerts: prev.alerts + 1 }));
          propagateMesh(nodeId, threat, detectionStart, conf);
        } else {
          setNodeStates(prev => ({ ...prev, [nodeId]: { status: "idle", threat: null, confidence: null } }));
          addLog("CLEAR", `${nodeId} — below threshold (${conf.toFixed(1)}%) — dismissed`);
          setStats(prev => ({ ...prev, ambient: prev.ambient + 1 }));

          // Persist ambient event
          postAlert({
            nodeId,
            nodeLabel: node.label,
            threatType: threat.type,
            threatLabel: threat.label,
            confidence: conf,
            severity: "AMBIENT",
            responseMs: null,
            notified: false,
          }).catch(err => console.error("Failed to save ambient event:", err));
        }      
      }
    }, 110);
  }, [addLog, propagateMesh]);

  // Auto simulation tick
  const nodeStatesRef = useRef(nodeStates);
  useEffect(() => { nodeStatesRef.current = nodeStates; }, [nodeStates]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const allIdle = Object.values(nodeStatesRef.current).every(s => s.status === "idle");
      if (!allIdle) return;
      const r = Math.random();
      if (r < 0.5) {
        const node = PIPELINE_NODES[Math.floor(Math.random() * PIPELINE_NODES.length)];
        triggerThreat(node.id);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [running, triggerThreat]);

  // Pipeline polyline coords
  const pipelineCoords = PIPELINE_NODES.map(n => [n.lat, n.lng]);
  const center = [5.6, 6.8];

  const logTypeStyle = (type) => ({
    padding: "1px 6px", borderRadius: 4, fontSize: 11, fontWeight: 500,
    background: type === "ALERT"  ? "#FCEBEB" : type === "CLEAR"  ? "#EAF3DE"
              : type === "RELAY"  ? "#E6F1FB" : type === "NOTIFY" ? "#FAEEDA" : "#F1EFE8",
    color:      type === "ALERT"  ? "#A32D2D" : type === "CLEAR"  ? "#3B6D11"
              : type === "RELAY"  ? "#185FA5" : type === "NOTIFY" ? "#854F0B" : "#5F5E5A",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "1.5rem 1rem", background: "var(--color-background-tertiary)", minHeight: "100vh" }}>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {[
          { label: "Events detected",  val: stats.detected },
          { label: "Alerts raised",    val: stats.alerts,   warn: stats.alerts > 0 },
          { label: "Ambient dismissed",val: stats.ambient },
          { label: "Avg response",     val: stats.avgResponse ? `${(stats.avgResponse / 1000).toFixed(1)}s` : "—" },
        ].map((c, i) => (
          <div key={i} style={{ background: "var(--color-background-primary)", borderRadius: 8,
            border: "0.5px solid var(--color-border-tertiary)", padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: c.warn ? "#E24B4A" : "var(--color-text-primary)" }}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Map + Log side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, alignItems: "start" }}>

        {/* Map */}
        <div style={{ borderRadius: 12, overflow: "hidden", border: "0.5px solid var(--color-border-tertiary)", height: 480 }}>
          <MapContainer center={center} zoom={8} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyTo coords={flyTo} />

            {/* Pipeline polyline */}
            <Polyline positions={pipelineCoords} color="#888780" weight={4} opacity={0.6} dashArray="8 4" />

            {/* Active mesh packet highlight */}
            {activePacket && activePacket.toIdx >= 0 && (
              <Polyline
                positions={[
                  [PIPELINE_NODES[activePacket.fromIdx]?.lat, PIPELINE_NODES[activePacket.fromIdx]?.lng],
                  activePacket.toIdx < PIPELINE_NODES.length
                    ? [PIPELINE_NODES[activePacket.toIdx].lat, PIPELINE_NODES[activePacket.toIdx].lng]
                    : [GATEWAY.lat, GATEWAY.lng],
                ]}
                color="#378ADD" weight={4} opacity={0.9}
              />
            )}

            {/* Pipeline nodes */}
            {PIPELINE_NODES.map(n => {
              const s = nodeStates[n.id];
              return (
                <Marker
                  key={n.id}
                  position={[n.lat, n.lng]}
                  icon={createNodeIcon(s.status, n.id)}
                  eventHandlers={{ click: () => {
                    const allIdle = Object.values(nodeStates).every(st => st.status === "idle");
                    if (allIdle) triggerThreat(n.id);
                  }}}
                >
                  <Popup>
                    <strong>{n.label}</strong><br />
                    Status: <span style={{ color: STATUS_COLORS[s.status] }}>{s.status.toUpperCase()}</span><br />
                    {s.threat && <>{s.threat.icon} {s.threat.label}<br /></>}
                    {s.confidence && <>Confidence: {s.confidence.toFixed(1)}%<br /></>}
                    <em style={{ fontSize: 11, color: "#888" }}>Click to trigger manual test</em>
                  </Popup>
                </Marker>
              );
            })}

            {/* Gateway */}
            <Marker position={[GATEWAY.lat, GATEWAY.lng]} icon={createGatewayIcon(gwActive)}>
              <Popup>
                <strong>{GATEWAY.label}</strong><br />
                Status: {gwActive ? <span style={{ color: "#378ADD" }}>ACTIVE — forwarding alert</span> : "Standby"}
              </Popup>
            </Marker>

            {/* Alert pulse rings */}
            {PIPELINE_NODES.map(n => {
              const s = nodeStates[n.id];
              if (s.status !== "alert") return null;
              return (
                <CircleMarker key={n.id + "_pulse"} center={[n.lat, n.lng]}
                  radius={28} color="#E24B4A" fillColor="#E24B4A" fillOpacity={0.08} weight={2} opacity={0.5} />
              );
            })}
          </MapContainer>
        </div>

        {/* Alert log */}
        <div style={{ background: "var(--color-background-primary)", borderRadius: 12,
          border: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", height: 480 }}>
          <div style={{ padding: "12px 14px 8px", borderBottom: "0.5px solid var(--color-border-tertiary)",
            fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>
            Alert log
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
            {logs.length === 0 && (
              <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Monitoring... no events yet.</div>
            )}
            {logs.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 12, alignItems: "flex-start" }}>
                <span style={{ color: "var(--color-text-tertiary)", whiteSpace: "nowrap", paddingTop: 1 }}>{l.time}</span>
                <span style={logTypeStyle(l.type)}>{l.type}</span>
                <span style={{ color: "var(--color-text-primary)", lineHeight: 1.4 }}>{l.msg}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      {/* Node status strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
        {PIPELINE_NODES.map(n => {
          const s = nodeStates[n.id];
          const col = STATUS_COLORS[s.status];
          return (
            <div key={n.id} style={{ background: "var(--color-background-primary)", borderRadius: 8,
              border: `1.5px solid ${col}`, padding: "10px 12px", cursor: "pointer" }}
              onClick={() => {
                const allIdle = Object.values(nodeStates).every(st => st.status === "idle");
                if (allIdle) triggerThreat(n.id);
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{n.id}</span>
                <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 20,
                  background: col + "22", color: col, fontWeight: 500 }}>
                  {s.status.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>
                {n.label.split("—")[1]?.trim()}
              </div>
              {s.confidence && (
                <div>
                  <div style={{ background: "var(--color-border-tertiary)", borderRadius: 4, height: 4, overflow: "hidden" }}>
                    <div style={{ width: `${s.confidence}%`, height: "100%", background: col, borderRadius: 4, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 10, color: col, marginTop: 2 }}>{s.confidence.toFixed(1)}%</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => setRunning(r => !r)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {running ? "⏸ Pause simulation" : "▶ Resume simulation"}
        </button>
        {PIPELINE_NODES.map(n => (
          <button key={n.id} onClick={() => {
            const allIdle = Object.values(nodeStates).every(s => s.status === "idle");
            if (allIdle) triggerThreat(n.id);
          }} style={{ fontSize: 12 }}>
            Trigger {n.id}
          </button>
        ))}
        <button onClick={() => {
          setLogs([]);
          setStats({ detected: 0, alerts: 0, ambient: 0, avgResponse: 0, responseTimes: [] });
        }} style={{ fontSize: 12, marginLeft: "auto" }}>
          ↺ Reset
        </button>
      </div>
    </div>
  );
}