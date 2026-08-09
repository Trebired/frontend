import { debugLogs } from "./debug.js";
import { entryMatchesConfig } from "./identity.js";
import { logsLiveRenderCap } from "./live_cap.js";
import { safeStr } from "./utils.js";
import type { FilteredLogItem, LogEntry, LogsPage } from "./types.js";

const logEntrySearchTextCache = new WeakMap<object, string>();

export function getLogEntryGroupKey(entry: LogEntry): string {
  return safeStr(entry && entry.group) || "app.log";
}

export function getLogEntryLevelKey(entry: LogEntry): string {
  return safeStr(entry && entry.level).toLowerCase() || "info";
}

function entryPassesUiFilters(
  entry: LogEntry,
  config: LogsPage["config"],
  ui: LogsPage["ui"],
  options: { ignoreUiFilters?: boolean } = {},
) {
  if (options.ignoreUiFilters === true) return true;

  const showPlatform =
  config.platformLogs === false
  ? false
  : ui.togglePlatform
  ? Boolean(ui.togglePlatform.checked)
  : true;
  const groupKey = ui.groupSelect
  ? safeStr(ui.groupSelect.value) || "all"
  : "all";
  const levelKey = ui.levelSelect
  ? safeStr(ui.levelSelect.value).toLowerCase() || "all"
  : "all";
  const searchQuery = ui.searchInput
  ? safeStr(ui.searchInput.value).toLowerCase()
  : "";

  const src = safeStr(
    entry && entry.origin && entry.origin.source ? entry.origin.source : "",
  ).toLowerCase();
  if (!showPlatform && src === "platform") return false;

  const grp = getLogEntryGroupKey(entry);
  if (groupKey !== "all" && grp !== groupKey) return false;

  const lvl = getLogEntryLevelKey(entry);
  if (levelKey !== "all" && lvl !== levelKey) return false;

  if (searchQuery && !getLogEntrySearchText(entry).includes(searchQuery))
  return false;

  return true;
}

function getLogEntrySearchText(entry: LogEntry) {
  const target = entry && typeof entry === "object" ? (entry as any) : {};
  const cached = logEntrySearchTextCache.get(target);
  if (cached) return cached;

  let metadataText = "";

  try {
    metadataText = JSON.stringify(target.metadata || {});
  } catch {}

  const text = [
    safeStr(target.recorded_at),
    safeStr(target.level).toLowerCase(),
    safeStr(target.group),
    safeStr(target.message),
    safeStr(target.source),
    safeStr(target.origin && target.origin.source).toLowerCase(),
    safeStr(target.origin && target.origin.instance),
    safeStr(target.config_key),
    metadataText,
  ]
  .filter(Boolean)
  .join(" ")
  .toLowerCase();

  logEntrySearchTextCache.set(target, text);
  return text;
}

function getLoadedLogs(page: LogsPage): LogEntry[] {
  const loaded =
  page && page.state && Array.isArray(page.state.loadedLogs)
  ? page.state.loadedLogs
  : null;

  if (loaded && loaded.length) return loaded;
  return Array.isArray(page && page.state && page.state.allLogs)
  ? page.state.allLogs
  : [];
}

export function getGroupsFromLogs(page: LogsPage): string[] {
  const { state, config } = page;
  const set = new Set<string>();
  const fallbackSet = new Set<string>();

  for (const entry of getLoadedLogs(page)) {
    const group = getLogEntryGroupKey(entry);
    fallbackSet.add(group);
    if (entryMatchesConfig(entry, config)) set.add(group);
  }

  return Array.from(set.size ? set : fallbackSet).sort(function (a, b) {
      return a.localeCompare(b);
  });
}

export function getLevelsFromLogs(page: LogsPage): string[] {
  const { state, config } = page;
  const set = new Set<string>();
  const fallbackSet = new Set<string>();

  for (const entry of getLoadedLogs(page)) {
    const level = getLogEntryLevelKey(entry);
    fallbackSet.add(level);
    if (entryMatchesConfig(entry, config)) set.add(level);
  }

  return Array.from(set.size ? set : fallbackSet).sort(function (a, b) {
      return a.localeCompare(b);
  });
}

export function getFilteredLogs(page: LogsPage): FilteredLogItem[] {
  const { state, config, ui } = page;
  const ignoreUiFilters = page && page.state && page.state.rawMode === true;
  const filtered: FilteredLogItem[] = [];
  const fallback: FilteredLogItem[] = [];

  for (
    let i = 0;
    i < (Array.isArray(state.allLogs) ? state.allLogs.length : 0);
    i += 1
  ) {
    const entry = state.allLogs[i];

    if (!entryPassesUiFilters(entry, config, ui, { ignoreUiFilters })) continue;

    fallback.push({
        entry,
        sourceIndex: i,
    });

    if (!entryMatchesConfig(entry, config)) continue;

    filtered.push({
        entry,
        sourceIndex: i,
    });
  }

  if (!filtered.length && fallback.length) {
    debugLogs(page, "filter:fallback", {
        reason: "entries-failed-config-match",
        fallback_count: fallback.length,
        config_key: safeStr(config && config.config_key),
        sample_entry_config_keys: fallback.slice(0, 5).map(function (item) {
            return safeStr(item && item.entry && item.entry.config_key);
        }),
    });
  }

  return filtered.length ? filtered : fallback;
}

export function getFilteredLoadedLogs(page: LogsPage): FilteredLogItem[] {
  const { config, ui } = page;
  const ignoreUiFilters = page && page.state && page.state.rawMode === true;
  const source = getLoadedLogs(page);
  const filtered: FilteredLogItem[] = [];
  const fallback: FilteredLogItem[] = [];

  for (let i = 0; i < source.length; i += 1) {
    const entry = source[i];

    if (!entryPassesUiFilters(entry, config, ui, { ignoreUiFilters })) continue;

    fallback.push({
        entry,
        sourceIndex: i,
    });

    if (!entryMatchesConfig(entry, config)) continue;

    filtered.push({
        entry,
        sourceIndex: i,
    });
  }

  if (!filtered.length && fallback.length) {
    debugLogs(page, "filter:loaded-fallback", {
        reason: "loaded-entries-failed-config-match",
        fallback_count: fallback.length,
        config_key: safeStr(config && config.config_key),
        sample_entry_config_keys: fallback.slice(0, 5).map(function (item) {
            return safeStr(item && item.entry && item.entry.config_key);
        }),
    });
  }

  return filtered.length ? filtered : fallback;
}

export function hasHiddenRenderedHistory(
  page: LogsPage,
  items: FilteredLogItem[] | null = null,
) {
  const source = Array.isArray(items) ? items : getFilteredLoadedLogs(page);
  return source.length > logsLiveRenderCap(page);
}

export function getRenderedLogs(page: LogsPage): FilteredLogItem[] {
  const filtered = getFilteredLoadedLogs(page);
  if (page && page.state && page.state.isHistoryExpanded) {
    return filtered;
  }

  const cap = logsLiveRenderCap(page);
  if (filtered.length <= cap) return filtered;
  return filtered.slice(-cap);
}
