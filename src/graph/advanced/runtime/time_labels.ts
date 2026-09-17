function labelTime(entry: unknown) {
  const raw = entry && typeof entry === "object" ? (entry as { label?: unknown }).label : entry;
  const text = String(raw || "");
  if (text.startsWith("t:")) {
    const time = Number(text.slice(2));
    return Number.isFinite(time) ? time : null;
  }
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function documentLanguage() {
  return typeof document !== "undefined" ? document.documentElement.lang : "";
}

function relativeAgeLabel(time: number, now: number, lang: string) {
  const seconds = Math.round((time - now) / 1000);
  let formatter: Intl.RelativeTimeFormat;
  try {
    formatter = new Intl.RelativeTimeFormat(lang || undefined, { numeric: "auto", style: "narrow" });
  } catch {
    return "";
  }
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  return formatter.format(Math.round(seconds / 60), "minute");
}

function timestampBottomDetails(alignedLabels: unknown[], lang?: string) {
  const times = (Array.isArray(alignedLabels) ? alignedLabels : []).map(labelTime);
  if (times.length < 2 || times.some((time) => time == null)) return [];
  const resolvedLang = lang || documentLanguage();
  const now = times[times.length - 1] as number;
  const middle = times[Math.floor((times.length - 1) / 2)] as number;
  return [
    relativeAgeLabel(times[0] as number, now, resolvedLang),
    relativeAgeLabel(middle, now, resolvedLang),
    relativeAgeLabel(now, now, resolvedLang),
  ];
}

export { timestampBottomDetails };
