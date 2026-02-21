const BASE = `http://localhost:${import.meta.env.YU_BACK_PORT}/api`;

export async function loadConfig(name) {
  const fetchUrl = `${BASE}/config${name ? `/${name}` : ""}`;
  const res = await fetch(fetchUrl);
  return res.json();
}

export async function saveConfig(name, data) {
  await fetch(`${BASE}/config/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function launchContent(contentId, tvId) {
  await fetch(`${BASE}/launch/${contentId}/${tvId}`, { method: "POST" });
}
