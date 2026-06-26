//const API_BASE = "http://localhost:4000/api";
// src/api/alerts.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function fetchAlerts(limit = 50, offset = 0) {
  const res = await fetch(`${API_BASE}/alerts?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function postAlert(payload) {
  const res = await fetch(`${API_BASE}/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save alert");
  return res.json();
}

export async function clearAlerts() {
  const res = await fetch(`${API_BASE}/alerts`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear alerts");
}

export async function deleteAlert(id) {
  const res = await fetch(`${API_BASE}/alerts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete alert");
}