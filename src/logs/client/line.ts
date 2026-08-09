import { formatTimestamp, safeStr } from "./utils.js";
import { getLevelStyle, getPalette } from "./style.js";
import { getEntryMetadata, getReqId } from "./metadata.js";
import { makeLogKey } from "./identity.js";
import type { FilteredLogItem, LogEntry, LogsPage } from "./types.js";

function getGroupLabel(entry: LogEntry | null) {
  return safeStr(entry && entry.group ? entry.group : "app.log");
}

function compactJson(value: unknown) {
  if (!value || typeof value !== "object") return "";

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function buildLogLineView(page: LogsPage, item: FilteredLogItem) {
  const entry = item && item.entry ? item.entry : null;
  const sourceIndex =
  item && item.sourceIndex != null ? Number(item.sourceIndex) : -1;
  const palette = getPalette(page.state.logStyle);
  const levelCfg = getLevelStyle(page.state.logStyle, entry && entry.level);
  const metadataSource = getEntryMetadata(entry);
  const metadata = metadataSource || {};
  const level = safeStr(entry && entry.level).toLowerCase();
  const reqId = getReqId(entry);
  const stack = safeStr(metadata.stack);
  const logKey = makeLogKey(entry, sourceIndex);

  return {
    entry,
    sourceIndex,
    logKey,
    marked: Boolean(
      page.state.markedLogKeys && page.state.markedLogKeys[logKey] === true,
    ),
    timestamp: formatTimestamp(
      entry && entry.recorded_at ? entry.recorded_at : "",
    ),
    levelLabel:
    safeStr(levelCfg.label) || (level ? level.toUpperCase() : "LOG"),
    levelColor: levelCfg.color || "",
    levelBold: Boolean(levelCfg.bold),
    groupLabel: getGroupLabel(entry),
    message: entry && entry.message != null ? String(entry.message) : "",
    reqId,
    reqColor: palette.req || "",
    stack: Boolean(levelCfg.showStack) ? stack : "",
    metadata:
    page && page.state && page.state.showMetadata && metadataSource
    ? compactJson(metadataSource)
    : "",
    highlighted: Boolean(
      page.state.highlightedLogKey && page.state.highlightedLogKey === logKey,
    ),
  };
}

export function buildLogLineViews(page: LogsPage, items: FilteredLogItem[]) {
  return (Array.isArray(items) ? items : []).map((item) =>
    buildLogLineView(page, item),
  );
}
