const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function getSheets(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_BASE}/api/schedule/sheets`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function extractSchedule({ file, sheet, channel, advertiser }) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("sheet", sheet);
  fd.append("channel", channel);
  fd.append("advertiser", advertiser);

  const res = await fetch(`${API_BASE}/api/extract`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function downloadExtracted(token) {
  window.open(`${API_BASE}/api/extract/download/${token}`, "_blank");
}

export async function runMonitoring({ token, nilsonFile, roNumber }) {
  const fd = new FormData();
  fd.append("token", token);
  fd.append("ro_number", roNumber);
  fd.append("nilson", nilsonFile);

  const res = await fetch(`${API_BASE}/api/monitor`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function downloadMonitoring(jobId, which) {
  window.open(`${API_BASE}/api/monitor/download/${jobId}/${which}`, "_blank");
}
