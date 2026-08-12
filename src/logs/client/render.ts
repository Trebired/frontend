import { debugLogs } from "./debug.js";
import { getRenderedLogs } from "./filters.js";
import { entryMatchesConfig, makeLogKey } from "./identity.js";
import { renderLogViewport } from "./react_view.js";
import { updateLogStats } from "./stats.js";
import { logsT, safeStr } from "./utils.js";
import {
  canForceViewportToBottom,
  escapeBottomFollow,
  refreshLogDom,
  syncMetadataButton,
  syncViewportFromScroll,
} from "./view_state.js";
import { loadOlderLogs, openLogDetail, toggleMarkedLog } from "./detail.js";
import { syncGroupSelect, syncLevelSelect } from "./dropdowns.js";
import type { LogsPage } from "./types.js";

function buildRawLogText(page: LogsPage) {
  const source =
  Array.isArray(page.state.loadedLogs) && page.state.loadedLogs.length
  ? page.state.loadedLogs
  : Array.isArray(page.state.allLogs)
  ? page.state.allLogs
  : [];
  const entries = source.filter(function(entry) {
      return entryMatchesConfig(entry, page.config);
  });

  return entries.map(formatRawLogLine).join("\n");
}

function formatRawLogLine(entry: any) {
  const parts = [
    safeStr(entry && entry.recorded_at),
    safeStr(entry && entry.level).toUpperCase() || "LOG",
    safeStr(entry && entry.group) || "app.log",
    entry && entry.message != null ? String(entry.message) : "",
  ].filter(Boolean);
  return parts.join("  ");
}

function syncRawModeUi(page: LogsPage) {
  const ui = refreshLogDom(page);
  const rawMode = Boolean(page && page.state && page.state.rawMode);
  const controls = [
    ui.groupSelect,
    ui.levelSelect,
    ui.searchInput,
    ui.togglePlatform,
    ui.metadataButton,
    ui.searchButton,
  ];

  controls.forEach(function(control) {
      if (control && "disabled"in control)(control as any).disabled = rawMode;
  });
  syncRawDropdowns([ui.groupSelect, ui.levelSelect], rawMode);
  syncRawButton(ui.rawModeButton, rawMode);
}

function syncRawDropdowns(drops: any[], rawMode: boolean) {
  for (const drop of drops) {
    const rootEl =
    drop && drop.closest ? drop.closest("[data-dropdown-root]") : null;
    if (!(rootEl instanceof HTMLElement)) continue;
    rootEl.setAttribute("aria-disabled", rawMode ? "true" : "false");
    rootEl.style.pointerEvents = rawMode ? "none" : "";
    rootEl.style.opacity = rawMode ? "0.7" : "";
  }
}

function syncRawButton(button: HTMLElement | null, rawMode: boolean) {
  if (!button) return;
  button.setAttribute("aria-pressed", rawMode ? "true" : "false");
  button.setAttribute(
    "aria-label",
    rawMode ? logsT("fancyMode") : logsT("rawMode"),
  );
  button.setAttribute("title", rawMode ? logsT("fancyMode") : logsT("rawMode"));
}

function viewportHandlers(page: LogsPage) {
  return {
    onOpen: function(logKey, trigger) {
      openLogDetail(page, logKey, trigger);
    },
    onToggleMarker: function(logKey) {
      toggleMarkedLog(page, logKey, renderLogs);
    },
    onViewportScroll: function() {
      syncViewportFromScroll(page, {
          loadOlderLogs: (nextPage) =>
          loadOlderLogs(nextPage, {
              renderLogs,
              syncGroupSelect,
              syncLevelSelect,
          }),
          renderLogs,
      });
    },
    onViewportEscapeBottom: function() {
      escapeBottomFollow(page, renderLogs);
    },
    canForceBottom: function() {
      return canForceViewportToBottom(page);
    },
  };
}

function emptyLogsText(
  page: LogsPage,
  searchQuery: string,
  hasAnyLoadedLogs: boolean,
) {
  const { state, config } = page;
  if (searchQuery && state.didBootstrap && hasAnyLoadedLogs)
  return logsT("noMatchingLogs");
  return (
    state.socketMessage ||
      (!state.didBootstrap
      ? config.loadingMessage
      : config.isRunning
      ? config.waitingMessage
      : config.emptyMessage)
  );
}

function buildLogDetails(page: LogsPage, filtered: any[]) {
  page.state.logDetailsByKey = {};
  for (const item of filtered) {
    const entry = item && item.entry ? item.entry : null;
    const sourceIndex =
    item && item.sourceIndex != null ? Number(item.sourceIndex) : -1;
    const logKey = makeLogKey(entry, sourceIndex);
    page.state.logDetailsByKey[logKey] = item;
  }
}

function renderEmptyLogs(page: LogsPage, params: any) {
  debugLogs(page, "render:empty", {
      didBootstrap: page.state.didBootstrap === true,
      loaded_logs: Array.isArray(page.state.loadedLogs)
      ? page.state.loadedLogs.length
      : 0,
      all_logs: Array.isArray(page.state.allLogs) ? page.state.allLogs.length : 0,
      search_query: params.searchQuery,
      config_key: page.config.config_key,
      socket_message: page.state.socketMessage || "",
  });

  renderLogViewport(page, {
      emptyText: emptyLogsText(page, params.searchQuery, params.hasAnyLoadedLogs),
      rawMode: params.rawMode,
      ...viewportHandlers(page),
  });
}

function renderLogs(page: LogsPage) {
  const ui = refreshLogDom(page);
  const { state } = page;
  if (!ui.box) return;

  const filtered: any = getRenderedLogs(page);
  const rawMode = state.rawMode === true;
  const rawLines = rawMode ? buildRawLogText(page) : "";
  const searchQuery = ui.searchInput ? safeStr(ui.searchInput.value) : "";
  const hasAnyLoadedLogs = hasLoadedLogs(state);

  syncRawModeUi(page);
  syncMetadataButton(page);
  updateLogStats(page, filtered);

  if (!filtered.length && !(rawMode && rawLines)) {
    renderEmptyLogs(page, { hasAnyLoadedLogs, rawMode, searchQuery });
    return;
  }

  buildLogDetails(page, filtered);
  renderLogViewport(page, {
      items: filtered,
      rawLines,
      rawMode,
      ...viewportHandlers(page),
  });
}

function hasLoadedLogs(state: any) {
  return Array.isArray(state.loadedLogs)
  ? state.loadedLogs.length > 0
  : Array.isArray(state.allLogs) && state.allLogs.length > 0;
}

export { renderLogs };
