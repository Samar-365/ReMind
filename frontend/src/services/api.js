const API_BASE = "http://localhost:8001";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchAiStatus() {
  const res = await fetch(`${API_BASE}/api/ai/status`);
  return res.json();
}

export async function fetchAggregatedContext(config = {}) {
  const res = await fetch(`${API_BASE}/api/context/aggregate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      include_git: true,
      include_terminal: true,
      include_browser: true,
      include_windows: true,
      ...config,
    }),
  });
  if (!res.ok) throw new Error("Failed to collect context");
  return res.json();
}

export async function generateHandoffNote(payload) {
  const res = await fetch(`${API_BASE}/api/handoff/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Handoff generation failed");
  }
  return res.json();
}

export async function fetchHandoffHistory(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/handoff/list?${query}`);
  if (!res.ok) throw new Error("Failed to fetch handoff history");
  return res.json();
}

export async function fetchHandoffDetail(id) {
  const res = await fetch(`${API_BASE}/api/handoff/${id}`);
  if (!res.ok) throw new Error("Failed to fetch note detail");
  return res.json();
}

export async function updateHandoff(id, updates) {
  const res = await fetch(`${API_BASE}/api/handoff/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

export async function deleteHandoff(id) {
  const res = await fetch(`${API_BASE}/api/handoff/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete note");
  return res.json();
}
