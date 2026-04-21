export function getThumbGrad(type: string, metadata: string): string {
  if (type === "link") return "from-blue-500 to-blue-700";
  if (type === "richtext") return "from-purple-500 to-purple-700";
  let parsed: { fileName?: string } = {};
  try { parsed = JSON.parse(metadata ?? "{}"); } catch {}
  const ext = parsed.fileName?.split(".").pop()?.toUpperCase() ?? "";
  if (ext === "PDF") return "from-red-500 to-red-700";
  if (["PPTX", "PPT"].includes(ext)) return "from-orange-500 to-orange-700";
  return "from-slate-400 to-slate-600";
}

export function getThumbLabel(type: string, metadata: string): string {
  if (type === "link") return "↗";
  if (type === "richtext") return "NOTE";
  let parsed: { fileName?: string } = {};
  try { parsed = JSON.parse(metadata ?? "{}"); } catch {}
  return parsed.fileName?.split(".").pop()?.toUpperCase()?.slice(0, 4) ?? "FILE";
}

export function getMetaText(type: string, metadata: string): string {
  if (type === "link") {
    let parsed: { url?: string } = {};
    try { parsed = JSON.parse(metadata ?? "{}"); } catch {}
    try { return new URL(parsed.url ?? "").hostname; } catch { return ""; }
  }
  let parsed: { fileSize?: number; fileName?: string } = {};
  try { parsed = JSON.parse(metadata ?? "{}"); } catch {}
  if (parsed.fileSize) {
    const mb = parsed.fileSize / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(parsed.fileSize / 1024)} KB`;
  }
  return "";
}
