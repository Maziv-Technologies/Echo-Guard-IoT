import { useState, useEffect, useRef, useCallback } from "react";

const PIPELINE_NODES = [
  { id: "N1", label: "Node 1", x: 80,  y: 200, pipeX: 130 },
  { id: "N2", label: "Node 2", x: 230, y: 200, pipeX: 280 },
  { id: "N3", label: "Node 3", x: 380, y: 200, pipeX: 430 },
  { id: "N4", label: "Node 4", x: 530, y: 200, pipeX: 580 },
  { id: "N5", label: "Node 5", x: 680, y: 200, pipeX: 730 },
];

const GATEWAY = { id: "GW", label: "LoRa Gateway", x: 830, y: 200 };

const THREAT_TYPES = [
  { type: "hacksaw",  label: "Hacksaw",      color: "#E24B4A", icon: "🔪", freq: "High-freq friction",  conf: () => 92 + Math.random()*6 },
  { type: "drill",   label: "Motorized drill", color: "#D85A30", icon: "🔩", freq: "Steady vibration",   conf: () => 88 + Math.random()*9 },
  { type: "hammer",  label: "Hammer strike", color: "#BA7517", icon: "🔨", freq: "Rhythmic impulse",    conf: () => 90 + Math.random()*8 },
  { type: "vehicle", label: "Heavy vehicle", color: "#185FA5", icon: "🚛", freq: "Low-freq rumble",     conf: () => 72 + Math.random()*10 },
];

const AMBIENT = ["Rainfall", "Wind gust", "Animal movement", "Thunder"];

function useInterval(cb, delay) {
  const ref = useRef(cb);
  useEffect(() => { ref.current = cb; }, [cb]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => ref.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function FFTBar({ active, threatColor }) {
  const bars = 18;
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:36, marginTop:4 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const base = 4 + Math.sin(i * 0.9) * 3;
        const h = active ? base + Math.abs(Math.sin(i * 2.3)) * 28 : base + Math.abs(Math.sin(i * 1.7)) * 5;
        return (
          <div key={i} style={{
            width: 6, height: `${Math.max(4, h)}px`,
            background: active ? threatColor : "var(--color-border-secondary)",
            borderRadius: 2, transition: "height 0.12s"
          }} />
        );
      })}
    </div>
  );
}

function NodeCard({ node, status, threat, confidence, pulse }) {
  const statusColor = {
    idle:      "var(--color-background-secondary)",
    detecting: "#FAEEDA",
    alert:     "#FCEBEB",
    relaying:  "#E6F1FB",
  }[status] || "var(--color-background-secondary)";

  const borderColor = {
    idle:      "var(--color-border-tertiary)",
    detecting: "#EF9F27",
    alert:     "#E24B4A",
    relaying:  "#378ADD",
  }[status] || "var(--color-border-tertiary)";

  const threatColor = threat?.color || "#E24B4A";

  return (
    <div style={{
      background: statusColor,
      border: `1.5px solid ${borderColor}`,
      borderRadius: 10, padding: "10px 12px", minWidth: 110,
      boxShadow: pulse ? `0 0 0 4px ${borderColor}44` : "none",
      transition: "all 0.3s", position:"relative"
    }}>
      {pulse && (
        <div style={{
          position:"absolute", inset:0, borderRadius:10,
          border:`2px solid ${borderColor}`,
          animation:"ripple 0.8s ease-out forwards",
          pointerEvents:"none"
        }} />
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, fontWeight:500, color:"var(--color-text-primary)" }}>{node.label}</span>
        <span style={{ fontSize:10, padding:"2px 6px", borderRadius:20,
          background: borderColor + "22", color: borderColor, fontWeight:500 }}>
          {status.toUpperCase()}
        </span>
      </div>
      <FFTBar active={status === "alert" || status === "detecting"} threatColor={threatColor} />
      {threat && (
        <div style={{ marginTop:6, fontSize:11, color:"var(--color-text-secondary)" }}>
          <div style={{ fontWeight:500, color: threatColor }}>{threat.icon} {threat.label}</div>
          <div>{threat.freq}</div>
          {confidence && (
            <div style={{ marginTop:4 }}>
              <div style={{ fontSize:10, color:"var(--color-text-tertiary)", marginBottom:2 }}>Confidence</div>
              <div style={{ background:"var(--color-border-tertiary)", borderRadius:4, height:5, overflow:"hidden" }}>
                <div style={{ width:`${confidence}%`, height:"100%",
                  background: confidence >= 90 ? "#E24B4A" : "#EF9F27", borderRadius:4,
                  transition:"width 0.4s" }} />
              </div>
              <div style={{ fontSize:10, fontWeight:500, color: confidence >= 90 ? "#E24B4A" : "#EF9F27" }}>
                {confidence.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AlertLog({ logs }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [logs]);
  return (
    <div style={{ background:"var(--color-background-secondary)", borderRadius:10,
      border:"0.5px solid var(--color-border-tertiary)", padding:"12px 14px", height:220, overflowY:"auto" }}>
      <div style={{ fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", marginBottom:8 }}>
        Alert log
      </div>
      {logs.length === 0 && (
        <div style={{ fontSize:12, color:"var(--color-text-tertiary)" }}>Monitoring... no events yet.</div>
      )}
      {logs.map((l, i) => (
        <div key={i} style={{ display:"flex", gap:8, marginBottom:6, fontSize:12 }}>
          <span style={{ color:"var(--color-text-tertiary)", whiteSpace:"nowrap" }}>{l.time}</span>
          <span style={{ padding:"1px 6px", borderRadius:4, fontSize:11, fontWeight:500,
            background: l.type === "ALERT" ? "#FCEBEB" : l.type === "CLEAR" ? "#EAF3DE" : "#E6F1FB",
            color:       l.type === "ALERT" ? "#A32D2D" : l.type === "CLEAR" ? "#3B6D11" : "#185FA5"
          }}>{l.type}</span>
          <span style={{ color:"var(--color-text-primary)" }}>{l.msg}</span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

export default function EchoGuardSimulation() {
  const [nodeStates, setNodeStates] = useState(
    () => Object.fromEntries(PIPELINE_NODES.map(n => [n.id, { status:"idle", threat:null, confidence:null, pulse:false }]))
  );
  const [gwActive, setGwActive] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ detected:0, ambient:0, alerts:0, avgResponse:0, responseTimes:[] });
  const [running, setRunning] = useState(true);
  const [meshPacket, setMeshPacket] = useState(null); // {from, to, progress}
  const tickRef = useRef(0);

  const addLog = useCallback((type, msg) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
    setLogs(prev => [...prev.slice(-80), { time, type, msg }]);
  }, []);

  const propagateMesh = useCallback((triggerNodeId, threat, detectionStart) => {
    const triggerIdx = PIPELINE_NODES.findIndex(n => n.id === triggerNodeId);
    const chain = [];
    // Relay from trigger node toward gateway
    for (let i = triggerIdx + 1; i < PIPELINE_NODES.length; i++) chain.push(PIPELINE_NODES[i].id);
    chain.push("GW");

    let delay = 400;
    const relayFrom = [triggerNodeId, ...PIPELINE_NODES.slice(triggerIdx + 1).map(n => n.id)];

    chain.forEach((toId, i) => {
      const fromId = relayFrom[i];
      setTimeout(() => {
        setMeshPacket({ from: fromId, to: toId });
        if (toId !== "GW") {
          setNodeStates(prev => ({ ...prev, [toId]: { status:"relaying", threat, confidence:null, pulse:false } }));
          addLog("RELAY", `${fromId} → ${toId} — packet forwarded`);
        } else {
          setGwActive(true);
          const responseMs = Date.now() - detectionStart;
          addLog("ALERT", `✅ Gateway received alert — response time: ${(responseMs/1000).toFixed(1)}s`);
          setStats(prev => {
            const times = [...prev.responseTimes, responseMs];
            return { ...prev, avgResponse: Math.round(times.reduce((a,b)=>a+b,0)/times.length), responseTimes:times };
          });
          // Send SMS/Telegram notification simulation
          setTimeout(() => {
            addLog("NOTIFY", `📱 SMS + Telegram alert dispatched to security team`);
          }, 500);
          // Clear after 5s
          setTimeout(() => {
            setGwActive(false);
            setMeshPacket(null);
            PIPELINE_NODES.forEach(n => {
              setNodeStates(prev => ({ ...prev, [n.id]: { status:"idle", threat:null, confidence:null, pulse:false } }));
            });
            addLog("CLEAR", `System reset — all nodes back to monitoring`);
          }, 5000);
        }
      }, delay * (i + 1));
    });
  }, [addLog]);

  const triggerThreat = useCallback((nodeId) => {
    const threat = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
    const conf = threat.conf();
    const isVandalism = conf >= 90;
    const detectionStart = Date.now();

    setNodeStates(prev => ({ ...prev, [nodeId]: { status:"detecting", threat, confidence: conf * 0.3, pulse:true } }));
    addLog("DETECT", `${nodeId} — ${threat.label} detected (${threat.freq})`);
    setStats(prev => ({ ...prev, detected: prev.detected + 1 }));

    // Confidence rises
    let progress = 0.3;
    const rampUp = setInterval(() => {
      progress = Math.min(1, progress + 0.07);
      setNodeStates(prev => ({
        ...prev,
        [nodeId]: { ...prev[nodeId], confidence: conf * progress, pulse: false }
      }));
      if (progress >= 1) {
        clearInterval(rampUp);
        if (isVandalism) {
          setNodeStates(prev => ({ ...prev, [nodeId]: { status:"alert", threat, confidence:conf, pulse:true } }));
          addLog("ALERT", `🚨 ${nodeId} — VANDALISM CONFIRMED! ${threat.icon} ${threat.label} @ ${conf.toFixed(1)}% conf`);
          setStats(prev => ({ ...prev, alerts: prev.alerts + 1 }));
          // Propagate through mesh
          propagateMesh(nodeId, threat, detectionStart);
        } else {
          setNodeStates(prev => ({ ...prev, [nodeId]: { status:"idle", threat:null, confidence:null, pulse:false } }));
          addLog("CLEAR", `${nodeId} — ${threat.label} below threshold (${conf.toFixed(1)}%) — ignored`);
          setStats(prev => ({ ...prev, ambient: prev.ambient + 1 }));
        }
      }
    }, 120);
  }, [addLog, propagateMesh]);

  const triggerAmbient = useCallback(() => {
    const name = AMBIENT[Math.floor(Math.random() * AMBIENT.length)];
    const nodeId = PIPELINE_NODES[Math.floor(Math.random() * PIPELINE_NODES.length)].id;
    addLog("DETECT", `${nodeId} — ambient noise: ${name}`);
    setStats(prev => ({ ...prev, ambient: prev.ambient + 1 }));
    setNodeStates(prev => ({ ...prev, [nodeId]: { status:"detecting", threat:null, confidence: 55 + Math.random()*20, pulse:false } }));
    setTimeout(() => {
      setNodeStates(prev => ({ ...prev, [nodeId]: { status:"idle", threat:null, confidence:null, pulse:false } }));
      addLog("CLEAR", `${nodeId} — ambient dismissed (multi-sensor fusion: no correlation)`);
    }, 2000);
  }, [addLog]);

  useInterval(() => {
    if (!running) return;
    tickRef.current++;
    const r = Math.random();
    if (r < 0.18) {
      const node = PIPELINE_NODES[Math.floor(Math.random() * PIPELINE_NODES.length)];
      const allIdle = Object.values(nodeStates).every(s => s.status === "idle");
      if (allIdle) triggerThreat(node.id);
    } else if (r < 0.32) {
      triggerAmbient();
    }
  }, running ? 3500 : null);

  const manualTrigger = (nodeId) => {
    const allIdle = Object.values(nodeStates).every(s => s.status === "idle");
    if (allIdle) triggerThreat(nodeId);
  };

  // SVG topology layout
  const svgW = 900, svgH = 185;
  const pipeY = 80;
  const nodeY = 120;

  return (
    <div style={{ padding:"1.5rem 1rem", fontFamily:"var(--font-sans)" }}>
      <h2 style={{ sr: "only", fontSize:18, fontWeight:500, color:"var(--color-text-primary)", marginBottom:4 }}>
        Echo-Guard IoT — Live Pipeline Simulation
      </h2>
      <p style={{ fontSize:13, color:"var(--color-text-secondary)", marginBottom:16 }}>
        Real-time vandalism detection · Edge-AI · LoRaWAN mesh
      </p>

      <style>{`
        @keyframes ripple { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.18)} }
        @keyframes packetMove { 0%{opacity:0;transform:translateX(-8px)} 30%{opacity:1} 100%{opacity:0;transform:translateX(8px)} }
      `}</style>

      {/* Metric cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10, marginBottom:16 }}>
        {[
          { label:"Events detected",   val: stats.detected },
          { label:"Alerts raised",      val: stats.alerts,    warn: stats.alerts > 0 },
          { label:"Ambient dismissed",  val: stats.ambient },
          { label:"Avg response",       val: stats.avgResponse ? `${(stats.avgResponse/1000).toFixed(1)}s` : "—" },
        ].map((c, i) => (
          <div key={i} style={{ background:"var(--color-background-secondary)", borderRadius:8,
            padding:"10px 12px", border:"0.5px solid var(--color-border-tertiary)" }}>
            <div style={{ fontSize:11, color:"var(--color-text-secondary)", marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:22, fontWeight:500,
              color: c.warn ? "#E24B4A" : "var(--color-text-primary)" }}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Pipeline topology SVG */}
      <div style={{ background:"var(--color-background-secondary)", borderRadius:12,
        border:"0.5px solid var(--color-border-tertiary)", padding:"12px 16px", marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", marginBottom:8 }}>
          Pipeline topology — click a node to trigger manual test
        </div>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ overflow:"visible" }}>
          {/* Pipeline pipe */}
          <rect x={60} y={pipeY - 8} width={svgW - 80} height={16} rx={8}
            fill="#B4B2A9" opacity={0.35} />
          {/* Pipe sheen */}
          <rect x={60} y={pipeY - 4} width={svgW - 80} height={4} rx={2}
            fill="white" opacity={0.2} />

          {/* Mesh connections */}
          {PIPELINE_NODES.map((n, i) => {
            const next = i < PIPELINE_NODES.length - 1 ? PIPELINE_NODES[i+1] : null;
            const toGw = i === PIPELINE_NODES.length - 1;
            const endX = toGw ? GATEWAY.x + 20 : (next?.x + 20);
            const isActive = meshPacket &&
              ((meshPacket.from === n.id && meshPacket.to === (toGw ? "GW" : next?.id)));
            return (
              <g key={n.id + "_line"}>
                <line x1={n.x + 20} y1={nodeY + 14} x2={endX} y2={nodeY + 14}
                  stroke={isActive ? "#378ADD" : "var(--color-border-secondary)"}
                  strokeWidth={isActive ? 2 : 1} strokeDasharray={isActive ? "0" : "4 3"} />
                {isActive && (
                  <circle cx={n.x + 40} cy={nodeY + 14} r={5} fill="#378ADD"
                    style={{ animation:"packetMove 0.6s ease-in-out" }} />
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {PIPELINE_NODES.map(n => {
            const s = nodeStates[n.id];
            const col = s.status === "alert" ? "#E24B4A"
                      : s.status === "detecting" ? "#EF9F27"
                      : s.status === "relaying"  ? "#378ADD"
                      : "#888780";
            return (
              <g key={n.id} style={{ cursor:"pointer" }} onClick={() => manualTrigger(n.id)}>
                {/* Connector to pipe */}
                <line x1={n.x + 20} y1={pipeY + 8} x2={n.x + 20} y2={nodeY - 2}
                  stroke={col} strokeWidth={1.5} />
                {/* Node circle */}
                <circle cx={n.x + 20} cy={nodeY + 14} r={18}
                  fill={s.status === "idle" ? "var(--color-background-primary)" : col + "22"}
                  stroke={col} strokeWidth={s.status !== "idle" ? 2 : 1} />
                {s.status !== "idle" && (
                  <circle cx={n.x + 20} cy={nodeY + 14} r={22}
                    fill="none" stroke={col} strokeWidth={1} opacity={0.3} />
                )}
                <text x={n.x + 20} y={nodeY + 18} textAnchor="middle"
                  fontSize={10} fontWeight={500} fill={col}>{n.id}</text>
                <text x={n.x + 20} y={nodeY + 46} textAnchor="middle"
                  fontSize={9} fill="var(--color-text-tertiary)">{n.label}</text>
              </g>
            );
          })}

          {/* Gateway */}
          <g>
            <rect x={GATEWAY.x} y={nodeY - 4} width={46} height={36} rx={6}
              fill={gwActive ? "#E6F1FB" : "var(--color-background-primary)"}
              stroke={gwActive ? "#378ADD" : "#B4B2A9"} strokeWidth={gwActive ? 2 : 1} />
            <text x={GATEWAY.x + 23} y={nodeY + 16} textAnchor="middle"
              fontSize={9} fontWeight={500} fill={gwActive ? "#185FA5" : "#888780"}>GW</text>
            <text x={GATEWAY.x + 23} y={nodeY + 46} textAnchor="middle"
              fontSize={9} fill="var(--color-text-tertiary)">Gateway</text>
            {gwActive && (
              <text x={GATEWAY.x + 23} y={nodeY - 12} textAnchor="middle"
                fontSize={9} fill="#185FA5">▲ SAT</text>
            )}
          </g>

          {/* Legend */}
          {[
            { col:"#888780", lbl:"Idle" },
            { col:"#EF9F27", lbl:"Detecting" },
            { col:"#E24B4A", lbl:"Alert" },
            { col:"#378ADD", lbl:"Relaying" },
          ].map((l, i) => (
            <g key={l.lbl} transform={`translate(${60 + i * 110}, 10)`}>
              <circle cx={6} cy={6} r={5} fill={l.col + "33"} stroke={l.col} strokeWidth={1.5} />
              <text x={14} y={10} fontSize={10} fill="var(--color-text-secondary)">{l.lbl}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Node detail cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:8, marginBottom:16 }}>
        {PIPELINE_NODES.map(n => (
          <NodeCard key={n.id} node={n} {...nodeStates[n.id]} />
        ))}
      </div>

      {/* Alert log */}
      <AlertLog logs={logs} />

      {/* Controls */}
      <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
        <button onClick={() => setRunning(r => !r)} style={{ display:"flex", alignItems:"center", gap:6 }}>
          {running
            ? <><i className="ti ti-player-pause" aria-hidden="true" /> Pause simulation</>
            : <><i className="ti ti-player-play" aria-hidden="true" /> Resume simulation</>}
        </button>
        {PIPELINE_NODES.map(n => (
          <button key={n.id} onClick={() => manualTrigger(n.id)}
            style={{ fontSize:12 }}>
            Trigger {n.id}
          </button>
        ))}
        <button onClick={() => { setLogs([]); setStats({ detected:0, ambient:0, alerts:0, avgResponse:0, responseTimes:[] }); }}
          style={{ fontSize:12, marginLeft:"auto" }}>
          <i className="ti ti-refresh" aria-hidden="true" /> Reset
        </button>
      </div>
    </div>
  );
}