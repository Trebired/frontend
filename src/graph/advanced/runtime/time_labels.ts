import { clockBottomDetails } from "./timeline/model.js";

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
  const size = Math.abs(seconds);
  if (size < 60) return formatter.format(seconds, "second");
  if (size < 60 * 60) return formatter.format(Math.round(seconds / 60), "minute");
  if (size < 24 * 60 * 60) return formatter.format(Math.round(seconds / 3600), "hour");
  return formatter.format(Math.round(seconds / 86400), "day");
}

function timestampBottomDetails(alignedLabels: unknown[], lang?: string, live = true) {
  const times = (Array.isArray(alignedLabels) ? alignedLabels : []).map(labelTime);
  if (times.length < 2 || times.some((time) => time == null)) return [];
  const resolvedLang = lang || documentLanguage();
  const now = times[times.length - 1] as number;
  if (!live) return clockBottomDetails(times[0] as number, now, resolvedLang);
  const middle = times[Math.floor((times.length - 1) / 2)] as number;
  return [
    relativeAgeLabel(times[0] as number, now, resolvedLang),
    relativeAgeLabel(middle, now, resolvedLang),
    relativeAgeLabel(now, now, resolvedLang),
  ];
}

function windowBottomDetails(start: number, end: number, lang?: string, live = true) {
  const resolvedLang = lang || documentLanguage();
  if (!live) return clockBottomDetails(start, end, resolvedLang);
  return [start, (start + end) / 2, end].map((time) => relativeAgeLabel(time, end, resolvedLang));
}

export { timestampBottomDetails, windowBottomDetails };
