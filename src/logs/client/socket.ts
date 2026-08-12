import { io } from "socket.io-client";
import { debugLogs } from "./debug.js";
import { logsT, safeStr } from "./utils.js";
import { describeEntryConfigCheck, entryMatchesConfig } from "./identity.js";
import {
  logsLiveRenderCap,
  mergeLogEntries,
  trimLoadedLogsForCollapsedView,
} from "./socket/entries.js";
import { incrementTotalStats } from "./socket/stats.js";
import { LogsHandlers, LogsPage } from "./types.js";

export { mergeLogEntries, trimLoadedLogsForCollapsedView };

export function buildSubscribePayload(page: LogsPage, options: any = null) {
  const { config, ui } = page;
  if (typeof config.subscribePayload === "function") {
    const customPayload = config.subscribePayload(page, options);
    if (customPayload && typeof customPayload === "object")
    return customPayload;
  }

  const ids = {
    ...(config.scopeIds && typeof config.scopeIds === "object"
      ? config.scopeIds
      : {}),
    id: config.deploymentId,
  };
  const opts = options && typeof options === "object" ? options : {};

  const payload: any = {
    config_key: config.config_key,
    ids,
    includePlatform:
    config.platformLogs === false
    ? false
    : ui.togglePlatform
    ? Boolean(ui.togglePlatform.checked)
    : true,
    with_style: true,
    limit: logsLiveRenderCap(page),
  };

  if (opts.bootstrap === false) payload.bootstrap = false;
  return payload;
}

export function subscribe(page: LogsPage, options: any = null) {
  if (!page.state.socket) return;
  const payload = buildSubscribePayload(page, options);
  debugLogs(page, "subscribe", {
      event: page.config.subscribeEvent,
      payload,
  });
  page.state.socket.emit(page.config.subscribeEvent, payload);
}

function resolveConnectionHandlers(handlers: LogsHandlers) {
  return {
    renderPage:
    typeof handlers.renderPage === "function"
    ? handlers.renderPage
    : function() {},
    syncGroupSelect:
    typeof handlers.syncGroupSelect === "function"
    ? handlers.syncGroupSelect
    : function() {},
    syncLevelSelect:
    typeof handlers.syncLevelSelect === "function"
    ? handlers.syncLevelSelect
    : function() {},
  };
}

function connectionContext(page: LogsPage, handlers: LogsHandlers) {
  return {
    ...resolveConnectionHandlers(handlers),
    bootstrapTimer: null,
    config: page.config,
    page,
    refreshFrame: 0,
    state: page.state,
  };
}

function flushUiRefresh(context) {
  context.refreshFrame = 0;
  context.syncGroupSelect(context.page);
  context.syncLevelSelect(context.page);
  context.renderPage(context.page);
}

function scheduleUiRefresh(context) {
  if (context.refreshFrame) return;
  context.refreshFrame = window.requestAnimationFrame(() =>
    flushUiRefresh(context),
  );
}

function requiresDeploymentScope(context) {
  const hasCustomSubscribePayload =
  typeof context.config.subscribePayload === "function";
  return (
    !hasCustomSubscribePayload &&
      safeStr(context.config.socketNamespace || "/deployments/logs") ===
    "/deployments/logs"
  );
}

function hasMissingConnectionScope(context) {
  const hasCustomSubscribePayload =
  typeof context.config.subscribePayload === "function";
  if (!context.config.config_key) return true;
  if (requiresDeploymentScope(context) && !context.config.deploymentId)
  return true;
  return (
    !hasCustomSubscribePayload &&
      !context.config.allowEmptyScopeIds &&
      !Object.keys(context.config.scopeIds || {}).length
  );
}

function markConnectionSkipped(context) {
  context.state.didBootstrap = true;
  scheduleUiRefresh(context);
}

function markConnecting(context) {
  if (!context.config.isRunning) return;
  context.state.socketMessage = logsT("connectingLogs");
  context.renderPage(context.page);
}

function createLogsSocket(context) {
  const socketOptions =
  context.config.socketOptions &&
    typeof context.config.socketOptions === "object"
  ? context.config.socketOptions
  : {};
  return io(context.config.socketNamespace || "/deployments/logs", {
      transports: ["polling", "websocket"],
      ...socketOptions,
  });
}

function startBootstrapTimer(context) {
  context.bootstrapTimer = setTimeout(function() {
      if (context.state.didBootstrap) return;
      context.state.didBootstrap = true;
      context.state.socketMessage = "";
      debugLogs(context.page, "bootstrap:timeout", {
          namespace: context.config.socketNamespace,
          config_key: context.config.config_key,
          connected: Boolean(
            context.state.socket && context.state.socket.connected === true,
          ),
      });
      context.renderPage(context.page);
    }, 2500);
}

function clearBootstrapTimer(context) {
  if (!context.bootstrapTimer) return;
  clearTimeout(context.bootstrapTimer);
  context.bootstrapTimer = null;
}

function acceptBootstrapLogs(context, data, matchingLogs) {
  const state = context.state;
  state.allLogs = mergeLogEntries(state.allLogs, matchingLogs);
  state.loadedLogs = trimLoadedLogsForCollapsedView(
    context.page,
    mergeLogEntries(state.loadedLogs || [], matchingLogs),
  );
  if (data.stats && typeof data.stats === "object")
  state.totalStats = data.stats;
  state.logStyle =
  data.log_style && typeof data.log_style === "object"
  ? data.log_style
  : state.logStyle;
  state.socketMessage = "";
  if (state.isFollowingBottom && !state.isHistoryExpanded) {
    state.forceBottomVersion = Number(state.forceBottomVersion || 0) + 1;
  }
}

function logAcceptedBootstrap(context, data, incomingLogs, matchingLogs) {
  debugLogs(context.page, "bootstrap:accepted", {
      payload_config_key: safeStr(data.config_key),
      expected_config_key: safeStr(context.config.config_key),
      total_logs: incomingLogs.length,
      matching_logs: matchingLogs.length,
      sample_entry_config_keys: incomingLogs.slice(0, 5).map(function(entry) {
          return safeStr(entry && entry.config_key);
      }),
      sample_messages: incomingLogs.slice(0, 3).map(function(entry) {
          return safeStr(entry && entry.message);
      }),
  });
}

function shouldIgnoreBootstrap(context, data) {
  if (!data || typeof data !== "object") {
    debugLogs(context.page, "bootstrap:ignored", {
        reason: "invalid-payload",
        data,
    });
    return true;
  }
  if (safeStr(data.config_key) === safeStr(context.config.config_key))
  return false;
  debugLogs(context.page, "bootstrap:ignored", {
      reason: "config-key-mismatch",
      payload_config_key: safeStr(data.config_key),
      expected_config_key: safeStr(context.config.config_key),
      log_count: Array.isArray(data.logs) ? data.logs.length : 0,
  });
  return true;
}

function handleLogsBootstrap(context, data) {
  if (shouldIgnoreBootstrap(context, data)) return;
  clearBootstrapTimer(context);
  context.state.didBootstrap = true;
  const incomingLogs = Array.isArray(data.logs) ? data.logs : [];
  const matchingLogs = incomingLogs.filter(function(entry) {
      return entryMatchesConfig(entry, context.config);
  });
  logAcceptedBootstrap(context, data, incomingLogs, matchingLogs);
  acceptBootstrapLogs(context, data, matchingLogs);
  scheduleUiRefresh(context);
}

function appendLiveEntry(context, entry) {
  const state = context.state;
  state.didBootstrap = true;
  state.allLogs.push(entry);
  state.loadedLogs = trimLoadedLogsForCollapsedView(
    context.page,
    mergeLogEntries(state.loadedLogs || [], [entry]),
  );
  incrementTotalStats(context.page, entry);
  if (state.isFollowingBottom && !state.isHistoryExpanded) {
    state.forceBottomVersion = Number(state.forceBottomVersion || 0) + 1;
  }
  state.socketMessage = "";
}

function handleLogEntry(context, entry) {
  const mismatch = describeEntryConfigCheck(entry, context.config);
  if (mismatch) {
    debugLogs(context.page, "log:filtered", {
        reason: mismatch,
        entry_config_key: safeStr(entry && entry.config_key),
        expected_config_key: safeStr(context.config.config_key),
        group: safeStr(entry && entry.group),
        message: safeStr(entry && entry.message),
    });
    return;
  }
  debugLogs(context.page, "log:accepted", {
      entry_config_key: safeStr(entry && entry.config_key),
      expected_config_key: safeStr(context.config.config_key),
      group: safeStr(entry && entry.group),
      message: safeStr(entry && entry.message),
  });
  appendLiveEntry(context, entry);
  scheduleUiRefresh(context);
}

function handleLogsDisconnect(context) {
  debugLogs(context.page, "socket:disconnect", {
      didBootstrap: context.state.didBootstrap === true,
      config_key: context.config.config_key,
  });
  clearBootstrapTimer(context);
  if (context.state.didBootstrap) return;
  if (context.config.isRunning)
  context.state.socketMessage = logsT("disconnectedRetrying");
  else context.state.didBootstrap = true;
  scheduleUiRefresh(context);
}

function handleConnectError(context) {
  debugLogs(context.page, "socket:connect_error", {
      didBootstrap: context.state.didBootstrap === true,
      config_key: context.config.config_key,
  });
  clearBootstrapTimer(context);
  if (context.state.didBootstrap) return;
  if (context.config.isRunning)
  context.state.socketMessage = logsT("connectionErrorRetrying");
  else context.state.didBootstrap = true;
  scheduleUiRefresh(context);
}

function bindLogsSocketEvents(context, socket) {
  socket.on("connect", function() {
      debugLogs(context.page, "socket:connect", {
          namespace: context.config.socketNamespace,
          config_key: context.config.config_key,
      });
      subscribe(context.page);
  });
  socket.on("bootstrap", (data) => handleLogsBootstrap(context, data));
  socket.on("log", (entry) => handleLogEntry(context, entry));
  socket.on("disconnect", () => handleLogsDisconnect(context));
  socket.on("connect_error", () => handleConnectError(context));
}

function subscribeIfAlreadyConnected(context, socket) {
  if (socket.connected !== true) return;
  debugLogs(context.page, "socket:already-connected", {
      namespace: context.config.socketNamespace,
      config_key: context.config.config_key,
  });
  subscribe(context.page);
}

export function connectLogs(page: LogsPage, handlers: LogsHandlers = {}) {
  const context = connectionContext(page, handlers);
  if (hasMissingConnectionScope(context)) {
    markConnectionSkipped(context);
    return;
  }
  markConnecting(context);
  const socket = createLogsSocket(context);
  context.state.socket = socket;
  startBootstrapTimer(context);
  bindLogsSocketEvents(context, socket);
  subscribeIfAlreadyConnected(context, socket);
}
