import { logsLiveRenderCap } from "#vbehzu06jsrg";
import type { LogEntry, LogsPage } from "#ej8ewfp5cb1i";
import { safeStr } from "#gu61mitj537f";

function makeEntryMergeKey(entry: LogEntry) {
  const src = entry && typeof entry === "object" ? (entry as any) : {};
  const origin =
  src.origin && typeof src.origin === "object" ? (src.origin as any) : {};
  let metadataText = "";

  try {
    metadataText = JSON.stringify(src.metadata || {});
  } catch {}

  return [
    safeStr(src.config_key),
    safeStr(src.recorded_at),
    safeStr(origin.source).toLowerCase(),
    safeStr(src.level).toLowerCase(),
    safeStr(src.group),
    safeStr(src.message),
    safeStr(origin.instance),
    metadataText,
  ].join("|");
}

function trimLoadedLogsForCollapsedView(page: LogsPage, logs: LogEntry[]) {
  const list = Array.isArray(logs) ? logs : [];
  if (page && page.state && page.state.isHistoryExpanded) return list;

  const cap = logsLiveRenderCap(page);
  if (list.length <= cap) return list;
  return list.slice(-cap);
}

function mergeLogEntries(existing: LogEntry[], incoming: LogEntry[]) {
  const merged: LogEntry[] = [];
  const seen = new Set<string>();

  const push = function (entry) {
    if (!entry || typeof entry !== "object") return;

    const key = makeEntryMergeKey(entry);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(entry);
  };

  (Array.isArray(existing) ? existing : []).forEach(push);
  (Array.isArray(incoming) ? incoming : []).forEach(push);

  merged.sort(function (a, b) {
      const ta = Date.parse(safeStr(a && a.recorded_at)) || 0;
      const tb = Date.parse(safeStr(b && b.recorded_at)) || 0;
      return ta - tb;
  });

  return merged;
}

export { mergeLogEntries, logsLiveRenderCap, trimLoadedLogsForCollapsedView };
