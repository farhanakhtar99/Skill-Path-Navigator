// api.js
// Thin wrapper around fetch. Keeps the base URL in one place and turns
// non-OK responses into thrown errors the UI can catch and display.

const API_URL =
  import.meta.env.VITE_API_URL || "https://skill-path-navigator.onrender.com";

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export const getSkills = () => request("/api/skills");

export const getReadiness = (knownSkills) =>
  request("/api/readiness", {
    method: "POST",
    body: JSON.stringify({ knownSkills }),
  });

export const getPath = (fromSkill, toSkill) =>
  request("/api/path", {
    method: "POST",
    body: JSON.stringify({ fromSkill, toSkill }),
  });

export const checkHealth = () => request("/api/health");
