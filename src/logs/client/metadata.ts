import { safeStr } from "./utils.js";
import type { LogEntry } from "./types.js";

export function getEntryMetadata(
  entry: LogEntry | null,
): Record<string, unknown> | null {
  if (
    entry &&
      entry.metadata &&
      typeof entry.metadata === "object" &&
      !Array.isArray(entry.metadata)
  ) {
    return entry.metadata;
  }

  return null;
}

export function getReqId(entry: LogEntry | null): string {
  const metadata = getEntryMetadata(entry) || {};
  return safeStr(metadata.req_id || metadata.reqId);
}
