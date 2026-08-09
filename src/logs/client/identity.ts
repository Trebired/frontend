import { safeStr } from "./utils.js";
import type { LogEntry } from "./types.js";

export function describeEntryConfigCheck(
  entry: LogEntry,
  config: { config_key?: unknown; deploymentId?: unknown; scopeIds?: unknown },
) {
  if (!entry || typeof entry !== "object") return "invalid-entry";

  const entryConfigKey = safeStr(entry.config_key);
  const config_key = safeStr(config && config.config_key);

  if (config_key && entryConfigKey !== config_key) {
    return `config-key-mismatch entry=${entryConfigKey || "<empty>"} expected=${config_key}`;
  }

  return "";
}

export function entryMatchesConfig(
  entry: LogEntry,
  config: { config_key?: unknown; deploymentId?: unknown; scopeIds?: unknown },
) {
  return !describeEntryConfigCheck(entry, config);
}

function compactMetadata(entry: LogEntry) {
  try {
    return JSON.stringify(entry && entry.metadata ? entry.metadata : {});
  } catch {
    return "";
  }
}

export function makeLogKey(entry: LogEntry, sourceIndex: number): string {
  return [
    safeStr(entry && entry.config_key),
    safeStr(entry && entry.recorded_at),
    safeStr(entry && entry.level).toLowerCase(),
    safeStr(entry && entry.group),
    safeStr(entry && entry.message),
    safeStr(entry && entry.origin && entry.origin.source).toLowerCase(),
    safeStr(entry && entry.origin && entry.origin.instance),
    compactMetadata(entry),
  ].join("|");
}
