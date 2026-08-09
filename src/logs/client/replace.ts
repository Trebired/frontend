import { syncGroupSelect, syncLevelSelect } from "./dropdowns.js";
import { shouldPreserveLiveLogsOnReplacement } from "./replacement.js";
import { renderLogs } from "./render.js";
import { logsHistoryPageSize, normalizeLogsConfig } from "./utils.js";
import { forceViewportToBottom, refreshLogDom } from "./view_state.js";
import type { LogsConfig, LogsPage } from "./types.js";

function replaceLogsPartialData(
  page: LogsPage,
  configInput: LogsConfig | null | undefined,
) {
  if (!page) return null;

  const config: any = normalizeLogsConfig(configInput);
  const logs = Array.isArray(config.deploymentLogs)
  ? config.deploymentLogs.slice()
  : [];
  const nextLogs = resolveReplacementLogs(page, config, logs);

  page.config = config;
  page.state.allLogs = nextLogs.slice();
  page.state.loadedLogs = nextLogs.slice();
  applyReplacementState(page, config, logs);
  refreshLogDom(page);
  syncGroupSelect(page);
  syncLevelSelect(page);
  forceViewportToBottom(page);
  renderLogs(page);
  return page;
}

function resolveReplacementLogs(page: LogsPage, config: any, logs: any[]) {
  const preserveLiveLogs = shouldPreserveLiveLogsOnReplacement(
    page,
    config,
    logs,
  );
  const nextLogs = preserveLiveLogs
  ? Array.isArray(page.state.allLogs)
  ? page.state.allLogs.slice()
  : []
  : logs.slice();

  if (preserveLiveLogs) updatePreservedConfig(page, config, nextLogs);
  return nextLogs;
}

function updatePreservedConfig(page: LogsPage, config: any, nextLogs: any[]) {
  config.deploymentLogs = nextLogs.slice();
  if (!config.logStyle && page.state.logStyle)
  config.logStyle = page.state.logStyle;
  if (!config.totalStats && page.state.totalStats)
  config.totalStats = page.state.totalStats;
  if (config.initialLogsPage && typeof config.initialLogsPage === "object") {
    config.initialLogsPage = {
      ...config.initialLogsPage,
      logs: nextLogs.slice(),
      nextOffset: Math.max(
        Number(config.initialLogsPage.nextOffset) || 0,
        nextLogs.length,
      ),
      total: Math.max(
        Number(config.initialLogsPage.total) || 0,
        nextLogs.length,
      ),
    };
  }
}

function applyReplacementState(page: LogsPage, config: any, logs: any[]) {
  page.state.logStyle = config.logStyle;
  page.state.totalStats = config.totalStats;
  page.state.didBootstrap = true;
  page.state.isFollowingBottom = true;
  page.state.isHistoryExpanded = false;
  page.state.showJumpToBottom = false;
  page.state.forceBottomVersion =
  Number(page.state.forceBottomVersion || 0) + 1;
  page.state.rawMode = false;
  page.state.nextHistoryOffset = nextHistoryOffset(config, logs);
  page.state.hasMoreHistory = Boolean(
    config.initialLogsPage && config.initialLogsPage.hasMore === true,
  );
  page.state.historyPageSize = logsHistoryPageSize(config);
  page.state.isLoadingOlderLogs = false;
  page.state.socketMessage = "";
  page.state.highlightedLogKey = "";
  page.state.markedLogKeys = {};
  page.state.logDetailsByKey = {};
}

function nextHistoryOffset(config: any, logs: any[]) {
  return config.initialLogsPage &&
    Number.isFinite(Number(config.initialLogsPage.nextOffset))
  ? Number(config.initialLogsPage.nextOffset)
  : logs.length;
}

export { replaceLogsPartialData };
