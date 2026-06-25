import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ── Colour palette (matches the UI) ───────────────────────────────────────────
const C = {
  red:        [226, 75,  74],
  redLight:   [252, 235, 235],
  amber:      [239, 159, 39],
  blue:       [55,  138, 221],
  dark:       [30,  30,  30],
  mid:        [90,  90,  90],
  light:      [160, 160, 160],
  border:     [220, 220, 218],
  pageBg:     [250, 249, 247],
  white:      [255, 255, 255],
  greenLight: [234, 243, 222],
  green:      [59,  109, 17],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const setF = (doc, arr) => doc.setFillColor(...arr);
const setT = (doc, arr) => doc.setTextColor(...arr);
const setD = (doc, arr) => doc.setDrawColor(...arr);

function fmt(dateStr) {
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function fmtMs(ms) {
  return ms != null ? `${(ms / 1000).toFixed(1)}s` : "—";
}

// ── Cover page ────────────────────────────────────────────────────────────────
function drawCover(doc, generatedAt) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Background
  setF(doc, C.dark); doc.rect(0, 0, W, H, "F");

  // Red accent bar top
  setF(doc, C.red); doc.rect(0, 0, W, 6, "F");

  // Logo area — circle icon
  setF(doc, [50, 50, 50]); doc.circle(W / 2, 72, 22, "F");
  setF(doc, C.red);         doc.circle(W / 2, 72, 14, "F");
  setT(doc, C.white);
  doc.setFontSize(13).setFont("helvetica", "bold");
  doc.text("EG", W / 2, 76, { align: "center" });

  // Title
  setT(doc, C.white);
  doc.setFontSize(26).setFont("helvetica", "bold");
  doc.text("Echo-Guard IoT", W / 2, 112, { align: "center" });

  doc.setFontSize(13).setFont("helvetica", "normal");
  setT(doc, C.light);
  doc.text("Pipeline Integrity Incident Report", W / 2, 122, { align: "center" });

  // Divider
  setD(doc, [70, 70, 70]);
  doc.setLineWidth(0.4);
  doc.line(40, 132, W - 40, 132);

  // Meta info box
  setF(doc, [40, 40, 40]);
  doc.roundedRect(30, 140, W - 60, 54, 4, 4, "F");

  setT(doc, C.light); doc.setFontSize(9).setFont("helvetica", "normal");
  doc.text("GENERATED",     44, 155);
  doc.text("ORGANISATION",  44, 170);
  doc.text("SYSTEM",        44, 185);

  setT(doc, C.white); doc.setFontSize(10).setFont("helvetica", "bold");
  doc.text(generatedAt,               110, 155);
  doc.text("Maziv Technologies Limited", 110, 170);
  doc.text("Echo-Guard IoT v1.0",        110, 185);

  // Red bottom bar
  setF(doc, C.red); doc.rect(0, H - 6, W, 6, "F");

  // Confidential footer
  setT(doc, C.light); doc.setFontSize(8).setFont("helvetica", "italic");
  doc.text("CONFIDENTIAL — For authorised personnel only", W / 2, H - 12, { align: "center" });
}

// ── Page header (repeated on every content page) ──────────────────────────────
function drawPageHeader(doc, title) {
  const W = doc.internal.pageSize.getWidth();
  setF(doc, C.dark); doc.rect(0, 0, W, 18, "F");
  setT(doc, C.white); doc.setFontSize(9).setFont("helvetica", "bold");
  doc.text("ECHO-GUARD IOT  ·  INCIDENT REPORT", 14, 12);
  setT(doc, C.light); doc.setFontSize(8).setFont("helvetica", "normal");
  doc.text(title, W - 14, 12, { align: "right" });
}

// ── Page footer ───────────────────────────────────────────────────────────────
function drawPageFooter(doc, pageNum, totalPages) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  setF(doc, C.border); doc.rect(0, H - 12, W, 12, "F");
  setT(doc, C.mid); doc.setFontSize(8).setFont("helvetica", "normal");
  doc.text("Maziv Technologies Limited  ·  Echo-Guard IoT", 14, H - 4);
  doc.text(`Page ${pageNum} of ${totalPages}`, W - 14, H - 4, { align: "right" });
}

// ── Section heading ───────────────────────────────────────────────────────────
function sectionHeading(doc, text, y) {
  const W = doc.internal.pageSize.getWidth();
  setF(doc, C.red); doc.rect(14, y, 3, 7, "F");
  setT(doc, C.dark); doc.setFontSize(13).setFont("helvetica", "bold");
  doc.text(text, 20, y + 5.5);
  setD(doc, C.border); doc.setLineWidth(0.3);
  doc.line(14, y + 10, W - 14, y + 10);
  return y + 16;
}

// ── Stat grid (4 boxes in a row) ──────────────────────────────────────────────
function statGrid(doc, items, y) {
  const W    = doc.internal.pageSize.getWidth();
  const cols = items.length;
  const bW   = (W - 28 - (cols - 1) * 5) / cols;

  items.forEach((item, i) => {
    const x = 14 + i * (bW + 5);
    setF(doc, C.pageBg); setD(doc, C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, bW, 24, 3, 3, "FD");

    setT(doc, C.light); doc.setFontSize(7).setFont("helvetica", "normal");
    doc.text(item.label.toUpperCase(), x + 6, y + 8);

    setT(doc, item.warn ? C.red : C.dark);
    doc.setFontSize(15).setFont("helvetica", "bold");
    doc.text(String(item.value ?? "—"), x + 6, y + 19);

    if (item.sub) {
      setT(doc, C.light); doc.setFontSize(7).setFont("helvetica", "normal");
      doc.text(item.sub, x + 6, y + 26);
    }
  });
  return y + (items.some(i => i.sub) ? 32 : 28);
}

// ── Horizontal bar ────────────────────────────────────────────────────────────
function hBar(doc, label, value, max, y, color = C.red) {
  const W      = doc.internal.pageSize.getWidth();
  const barX   = 90;
  const barW   = W - barX - 40;
  const pct    = max > 0 ? value / max : 0;

  setT(doc, C.mid); doc.setFontSize(9).setFont("helvetica", "normal");
  doc.text(label, 14, y + 4);

  setF(doc, C.border); doc.roundedRect(barX, y - 1, barW, 7, 2, 2, "F");
  if (pct > 0) { setF(doc, color); doc.roundedRect(barX, y - 1, barW * pct, 7, 2, 2, "F"); }

  setT(doc, C.dark); doc.setFontSize(9).setFont("helvetica", "bold");
  doc.text(String(value), W - 30, y + 4);
  return y + 12;
}

// ── Main export function ───────────────────────────────────────────────────────
export async function generateIncidentReport({ alerts, stats, settings }) {
  const doc          = new jsPDF({ unit: "mm", format: "a4" });
  const W            = doc.internal.pageSize.getWidth();
  const generatedAt  = new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  // ── Page 1: Cover ──────────────────────────────────────────────────────────
  drawCover(doc, generatedAt);

  // ── Page 2: Executive Summary ──────────────────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, "Executive Summary");
  let y = 28;

  y = sectionHeading(doc, "Executive Summary", y);

  // Intro paragraph
  setT(doc, C.mid); doc.setFontSize(10).setFont("helvetica", "normal");
  const intro = [
    "This report summarises pipeline security events recorded by the Echo-Guard IoT",
    "distributed sensor network. All data is sourced directly from the SQLite event",
    "database and reflects the period up to the time of generation.",
  ];
  intro.forEach(line => { doc.text(line, 14, y); y += 6; });
  y += 4;

  // Overall stat grid
  const ov = stats?.overall ?? {};
  y = statGrid(doc, [
    { label: "Total Events",       value: ov.totalEvents  ?? 0 },
    { label: "Confirmed Alerts",   value: ov.totalAlerts  ?? 0, warn: (ov.totalAlerts ?? 0) > 0 },
    { label: "Ambient Dismissed",  value: ov.totalAmbient ?? 0 },
    { label: "Avg Response Time",  value: ov.avgResponseMs ? fmtMs(ov.avgResponseMs) : "—",
      sub: ov.minResponseMs && ov.maxResponseMs
        ? `Min ${fmtMs(ov.minResponseMs)}  ·  Max ${fmtMs(ov.maxResponseMs)}`
        : null },
  ], y);

  y += 6;
  y = sectionHeading(doc, "Threat Type Breakdown", y);
  const maxThreat = stats?.threats?.length ? Math.max(...stats.threats.map(t => t.count)) : 1;
  (stats?.threats ?? []).forEach(t => {
    y = hBar(doc, t.threat_label, t.count, maxThreat, y, C.red);
  });
  if (!(stats?.threats?.length)) {
    setT(doc, C.light); doc.setFontSize(9); doc.text("No confirmed alerts recorded.", 14, y); y += 10;
  }

  y += 6;
  y = sectionHeading(doc, "Activity Per Node", y);
  const maxNode = stats?.perNode?.length ? Math.max(...stats.perNode.map(n => n.total_events)) : 1;
  (stats?.perNode ?? []).forEach(n => {
    y = hBar(doc, `${n.node_id}  (${n.node_label ?? ""})`, n.alerts, maxNode, y, C.red);
  });

  // ── Page 3: Active Settings ────────────────────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, "System Configuration");
  y = 28;

  y = sectionHeading(doc, "Active Simulation Settings", y);

  const settingRows = [
    ["Confidence Threshold",      `${settings?.confidenceThreshold ?? 90}%`,   "CNN minimum confidence to confirm vandalism"],
    ["Tick Interval",             `${settings?.tickInterval        ?? 3500}ms`, "How often the engine checks for events"],
    ["Threat Probability",        `${settings?.threatProbability   ?? 18}%`,    "Chance per tick of a threat event"],
    ["Ambient Probability",       `${settings?.ambientProbability  ?? 14}%`,    "Chance per tick of ambient noise"],
    ["Mesh Hop Delay",            `${settings?.meshHopDelay        ?? 400}ms`,  "LoRa propagation delay per node hop"],
    ["Post-Alert Reset Delay",    `${settings?.resetDelay          ?? 5000}ms`, "Duration nodes stay in alert state"],
    ["SMS Alerts",                settings?.smsEnabled      ? "Enabled" : "Disabled", "SMS dispatch on confirmed vandalism"],
    ["Telegram Alerts",           settings?.telegramEnabled ? "Enabled" : "Disabled", "Telegram dispatch on confirmed vandalism"],
    ["Persist to Database",       settings?.persistEnabled  ? "Enabled" : "Disabled", "Save events to SQLite backend"],
    ["Auto-Simulation",           settings?.autoSimulate    ? "Enabled" : "Disabled", "Random event injection while running"],
  ];

  autoTable(doc, {
    startY: y,
    head:   [["Parameter", "Value", "Description"]],
    body:   settingRows,
    theme:  "plain",
    styles: { fontSize: 9, cellPadding: 4, textColor: C.dark },
    headStyles: {
      fillColor:  C.dark,
      textColor:  C.white,
      fontStyle:  "bold",
      fontSize:   9,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55 },
      1: { cellWidth: 32, textColor: C.red },
      2: { textColor: C.mid },
    },
    alternateRowStyles: { fillColor: C.pageBg },
    margin: { left: 14, right: 14 },
  });

  // ── Page 4+: Alert Log Table ───────────────────────────────────────────────
  doc.addPage("a4", "landscape");
  drawPageHeader(doc, "Alert Log");
  y = 28;
  y = sectionHeading(doc, "Full Alert Log", y);

  const alertOnly   = alerts.filter(a => a.severity === "ALERT");
  const ambientOnly = alerts.filter(a => a.severity === "AMBIENT");

  // Summary line
  setT(doc, C.mid); doc.setFontSize(9).setFont("helvetica", "normal");
  doc.text(
    `${alerts.length} total records  ·  ${alertOnly.length} confirmed alerts  ·  ${ambientOnly.length} ambient events`,
    14, y
  );
  y += 8;

  // Alert rows
  const tableBody = alerts.map(a => [
    fmt(a.created_at),
    a.node_id,
    a.threat_label,
    `${Number(a.confidence).toFixed(1)}%`,
    a.severity,
    fmtMs(a.response_ms),
    a.notified ? "Yes" : "No",
  ]);

  autoTable(doc, {
    startY: y,
    head:   [["Timestamp", "Node", "Threat", "Confidence", "Severity", "Response", "Notified"]],
    body:   tableBody.length ? tableBody : [["No records found", "", "", "", "", "", ""]],
    theme:  "plain",
    tableWidth: "wrap",
    styles: { fontSize: 8, cellPadding: 2, textColor: C.dark, overflow: "linebreak" },
    headStyles: {
      fillColor: C.dark,
      textColor: C.white,
      fontStyle: "bold",
      fontSize:  8,
    },
    columnStyles: {
      0: { cellWidth: 46 },
      1: { cellWidth: 20 },
      2: { cellWidth: 50 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 28 },
      6: { cellWidth: 24 },
    },
    alternateRowStyles: { fillColor: C.pageBg },
    didParseCell(data) {
      if (data.column.index === 4 && data.section === "body") {
        data.cell.styles.textColor =
          data.cell.raw === "ALERT" ? C.red : C.mid;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.column.index === 3 && data.section === "body") {
        const val = parseFloat(data.cell.raw);
        data.cell.styles.textColor = val >= 90 ? C.red : C.amber;
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Add headers/footers to all pages ──────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(doc, i - 1, totalPages - 1); // cover page not counted
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `echoguard-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
}
