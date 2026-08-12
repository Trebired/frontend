import { fetchJson } from "#aq4qe9opqpbm";
import { mergeLogEntries } from "#tso422aj56zf";
import { LOGS_PAGE_SIZE } from "#ej8ewfp5cb1i";
import type { LogsPage } from "#ej8ewfp5cb1i";
import { addLoadedLogs, refreshLogDom } from "#f0itcqtofzxp";

type LoadHandlers = {
  renderLogs: (page: LogsPage) => void;
  syncGroupSelect: (page: LogsPage) => void;
  syncLevelSelect: (page: LogsPage) => void;
};

function hadLogsBeforeRequest(state: any) {
  return (
    (Array.isArray(state.allLogs) && state.allLogs.length > 0) ||
      (Array.isArray(state.loadedLogs) && state.loadedLogs.length > 0)
  );
}

function applyInitialChunk(page: LogsPage, chunk: any, hadLogsBefore: boolean) {
  const { state } = page;
  const incoming = Array.isArray(chunk && chunk.logs) ? chunk.logs : [];
  const alreadyBootstrapped =
  state.didBootstrap === true ||
    (Array.isArray(state.allLogs) && state.allLogs.length > 0) ||
    (Array.isArray(state.loadedLogs) && state.loadedLogs.length > 0);

  state.didBootstrap = true;
  state.nextHistoryOffset =
  Number(chunk && chunk.nextOffset) || incoming.length;
  state.hasMoreHistory = chunk && chunk.hasMore === true;
  state.historyPageSize =
  Number(chunk && chunk.limit) ||
    Number(state.historyPageSize || LOGS_PAGE_SIZE);

  if (alreadyBootstrapped && !hadLogsBefore) {
    mergeInitialLiveChunk(page, chunk, incoming);
    return;
  }

  replaceInitialLogs(page, chunk, incoming);
}

function mergeInitialLiveChunk(page: LogsPage, chunk: any, incoming: any[]) {
  const { state } = page;
  state.allLogs = mergeLogEntries(state.allLogs || [], incoming);
  state.loadedLogs = mergeLogEntries(state.loadedLogs || [], incoming);
  state.nextHistoryOffset = Math.max(
    Number(state.nextHistoryOffset || 0),
    Number(chunk && chunk.nextOffset) || incoming.length,
  );
  state.hasMoreHistory =
  state.hasMoreHistory === true || (chunk && chunk.hasMore === true);

  if (
    !state.totalStats &&
      chunk &&
      chunk.stats &&
      typeof chunk.stats === "object"
  ) {
    state.totalStats = chunk.stats;
  }
  if (
    !state.logStyle &&
      chunk &&
      chunk.log_style &&
      typeof chunk.log_style === "object"
  ) {
    state.logStyle = chunk.log_style;
  }
}

function replaceInitialLogs(page: LogsPage, chunk: any, incoming: any[]) {
  const { state } = page;
  state.allLogs = mergeLogEntries([], incoming);
  state.loadedLogs = mergeLogEntries([], incoming);
  state.totalStats =
  chunk && chunk.stats && typeof chunk.stats === "object"
  ? chunk.stats
  : state.totalStats;

  if (chunk && chunk.log_style && typeof chunk.log_style === "object") {
    state.logStyle = chunk.log_style;
  }
}

function renderAfterHistoryLoad(page: LogsPage, handlers: LoadHandlers) {
  handlers.syncGroupSelect(page);
  handlers.syncLevelSelect(page);
  handlers.renderLogs(page);
}

export async function loadInitialLogs(page: LogsPage, handlers: LoadHandlers) {
  const { config, state } = page;
  if (!config.logsDataUrl) return;
  if (state.didBootstrap === true) return;
  if (state.isLoadingInitialLogs) return;

  const hadLogsBefore = hadLogsBeforeRequest(state);
  state.isLoadingInitialLogs = true;

  try {
    const chunk = await fetchJson(config.logsDataUrl, {
        offset: 0,
        limit: Number(state.historyPageSize || LOGS_PAGE_SIZE),
    });
    applyInitialChunk(page, chunk, hadLogsBefore);
    state.socketMessage = "";
    renderAfterHistoryLoad(page, handlers);
  } catch {
    state.didBootstrap = true;
    handlers.renderLogs(page);
  } finally {
    state.isLoadingInitialLogs = false;
  }
}

function applyOlderChunk(page: LogsPage, chunk: any) {
  const { state } = page;
  const incoming = Array.isArray(chunk && chunk.logs) ? chunk.logs : [];

  state.didBootstrap = true;
  state.nextHistoryOffset =
  Number(chunk && chunk.nextOffset) ||
    Number(state.nextHistoryOffset || 0) + incoming.length;
  state.hasMoreHistory = chunk && chunk.hasMore === true;
  state.historyPageSize =
  Number(chunk && chunk.limit) ||
    Number(state.historyPageSize || LOGS_PAGE_SIZE);
  state.allLogs = mergeLogEntries(state.allLogs, incoming);
  addLoadedLogs(page, incoming);
  state.isHistoryExpanded = true;

  if (
    !state.logStyle &&
      chunk &&
      chunk.log_style &&
      typeof chunk.log_style === "object"
  ) {
    state.logStyle = chunk.log_style;
  }
}

function restoreScrollPosition(
  page: LogsPage,
  previousScrollTop: number,
  previousScrollHeight: number,
) {
  window.requestAnimationFrame(function() {
      const nextBox = refreshLogDom(page).box;
      if (!nextBox) return;

      const heightDelta = nextBox.scrollHeight - previousScrollHeight;
      nextBox.scrollTop = previousScrollTop + Math.max(0, heightDelta);
  });
}

export async function loadOlderLogs(page: LogsPage, handlers: LoadHandlers) {
  const { config, state } = page;
  const ui = refreshLogDom(page);
  const box = ui.box;
  if (!box) return;
  if (!config.logsDataUrl) return;
  if (state.isLoadingOlderLogs) return;
  if (state.hasMoreHistory !== true) return;

  state.isLoadingOlderLogs = true;
  const previousScrollTop = box.scrollTop;
  const previousScrollHeight = box.scrollHeight;

  try {
    const chunk = await fetchJson(config.logsDataUrl, {
        offset: Number(state.nextHistoryOffset || 0),
        limit: Number(state.historyPageSize || LOGS_PAGE_SIZE),
    });
    applyOlderChunk(page, chunk);
    renderAfterHistoryLoad(page, handlers);
    restoreScrollPosition(page, previousScrollTop, previousScrollHeight);
  } catch {
    state.didBootstrap = true;
  } finally {
    state.isLoadingOlderLogs = false;
  }
}
