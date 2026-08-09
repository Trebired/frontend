import { syncCheckboxOption } from "#z2c0jqmjqds4";
import { readHostJsonConfig } from "#aq4qe9opqpbm";

import { getLogsDom, getLogsDomIds, resolveLogsDomRoot } from "./dom.js";
import { readLogsBootData } from "./view_state.js";
import { DEFAULT_LOGS_INSTANCE_ID, LOGS_PAGE_SIZE } from "./types.js";
import {
  logsHistoryPageSize,
  normalizeInstanceId,
  normalizeLogsConfig,
  safeStr,
} from "./utils.js";
import type { LogsConfig, LogsPage, LogsUi } from "./types.js";

function normalizeConfigSignature(config: any) {
  const src = config && typeof config === "object" ? config : {};
  const initial =
  src.initialLogsPage && typeof src.initialLogsPage === "object"
  ? src.initialLogsPage
  : {};
  return JSON.stringify({
      config_key: safeStr(src.config_key),
      deploymentId: safeStr(src.deploymentId),
      logsDataUrl: safeStr(src.logsDataUrl),
      socketNamespace: safeStr(src.socketNamespace),
      subscribeEvent: safeStr(src.subscribeEvent),
      platformLogs: src.platformLogs !== false,
      status: safeStr(src.status),
      logsLength: Array.isArray(src.deploymentLogs)
      ? src.deploymentLogs.length
      : 0,
      nextOffset: Number(initial.nextOffset) || 0,
      total: Number(initial.total) || 0,
      fullscreenGroup: safeStr(src.fullscreenGroup),
      fullscreenId: safeStr(src.fullscreenId),
  });
}

function isEquivalentLogsConfig(left: any, right: any) {
  return normalizeConfigSignature(left) === normalizeConfigSignature(right);
}

function readLogsConfigInput(
  instanceId: string,
  config: LogsConfig | null | undefined,
  root: HTMLElement | null,
) {
  const rootConfig = readLogsRootConfig(root);
  const inputConfig =
  config && typeof config === "object" ? config : readBootConfig(instanceId);
  return {
    ...rootConfig,
    ...(inputConfig && typeof inputConfig === "object" ? inputConfig : {}),
  };
}

function readLogsRootConfig(root: HTMLElement | null) {
  return root
  ? (readHostJsonConfig<Record<string, unknown>>(
      root,
      'script[type="application/json"][data-logs-view-config]',
      {},
    ) as LogsConfig)
  : {};
}

function readBootConfig(instanceId: string) {
  const boot = readLogsBootData();
  if (!boot || typeof boot !== "object") return {};

  const bootInstanceId = normalizeInstanceId(
    (boot as any).instanceId || DEFAULT_LOGS_INSTANCE_ID,
  );
  return bootInstanceId === instanceId ? (boot as LogsConfig) : {};
}

function createLogsState(config: any) {
  return {
    allLogs: config.deploymentLogs.slice(),
    loadedLogs: config.deploymentLogs.slice(),
    logStyle: config.logStyle,
    totalStats: config.totalStats,
    socket: null,
    didBootstrap: config.deploymentLogs.length > 0,
    liveRenderCap: LOGS_PAGE_SIZE,
    focusSearchOnFullscreen: false,
    showMetadata: false,
    rawMode: false,
    isFollowingBottom: true,
    isHistoryExpanded: false,
    showJumpToBottom: false,
    forceBottomVersion: 0,
    nextHistoryOffset: initialNextOffset(config),
    hasMoreHistory: Boolean(
      config.initialLogsPage && config.initialLogsPage.hasMore === true,
    ),
    historyPageSize: logsHistoryPageSize(config),
    isLoadingOlderLogs: false,
    socketMessage: "",
    highlightedLogKey: "",
    markedLogKeys: {},
    logDetailsByKey: {},
  };
}

function initialNextOffset(config: any) {
  return config.initialLogsPage &&
    Number.isFinite(Number(config.initialLogsPage.nextOffset))
  ? Number(config.initialLogsPage.nextOffset)
  : config.deploymentLogs.length;
}

function createLogsPage(
  options: {
    root?: HTMLElement | string | null;
    instanceId?: string;
    config?: LogsConfig | null;
  } = {},
): LogsPage {
  const rootInput = options && options.root ? options.root : null;
  const instanceFromRoot =
  rootInput instanceof HTMLElement
  ? rootInput.getAttribute("data-logs-instance-id")
  : "";
  const instanceId = normalizeInstanceId(
    options.instanceId || instanceFromRoot || DEFAULT_LOGS_INSTANCE_ID,
  );
  const domIds = getLogsDomIds(instanceId);
  const root = resolveLogsDomRoot(rootInput, instanceId);
  const config: any = normalizeLogsConfig(
    readLogsConfigInput(instanceId, options.config, root),
    { instanceId },
  );
  const ui: LogsUi = getLogsDom(root, instanceId);

  if (ui.togglePlatform) {
    ui.togglePlatform.checked = config.platformLogsDefaultOff !== true;
    syncCheckboxOption(ui.togglePlatform);
  }

  return {
    config,
    domIds,
    instanceId,
    state: createLogsState(config),
    ui,
  };
}

export { createLogsPage, isEquivalentLogsConfig };
