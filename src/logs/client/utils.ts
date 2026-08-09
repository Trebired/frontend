import {
  createLocalTranslator,
  documentLang,
  time,
  toArray as hydrateLogs,
  toObject,
  toString,
} from "#aq4qe9opqpbm";
import { DEFAULT_LOGS_INSTANCE_ID, LOGS_PAGE_SIZE } from "./types.js";
import type { LogsConfig, NormalizedLogsConfig } from "./types.js";

export function safeStr(v: unknown): string {
  return toString(v);
}

export function logsT(key: string, vars?: Record<string, unknown>): string {
  return createLocalTranslator(import.meta.url, documentLang())(key, vars);
}

export function normalizeInstanceId(value: unknown): string {
  let out = safeStr(value)
  .replace(/[^A-Za-z0-9_-]+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^[-_]+|[-_]+$/g, "");

  if (!out) out = DEFAULT_LOGS_INSTANCE_ID;
  if (!/^[A-Za-z]/.test(out)) out = "logs-" + out;
  return out;
}

export function instanceIdToSnake(value: unknown): string {
  const text = normalizeInstanceId(value);
  const out = text
  .replace(/[^A-Za-z0-9]+/g, "_")
  .replace(/_+/g, "_")
  .replace(/^_+|_+$/g, "");

  return out || "logs_view";
}

export function logsHistoryPageSize(config: any): number {
  return config.initialLogsPage &&
    Number.isFinite(Number(config.initialLogsPage.limit))
  ? Number(config.initialLogsPage.limit)
  : LOGS_PAGE_SIZE;
}

export function formatTimestamp(iso: unknown): string {
  const localS: any = safeStr(iso);
  if (!localS) return "";

  try {
    return String(
      time(localS, "abs_datetime", {
          fallback: localS,
          locale:
          typeof document !== "undefined" && document.documentElement
          ? document.documentElement.lang || undefined
          : undefined,
      }) || localS,
    );
  } catch {}

  const localD: any = new Date(localS);
  if (Number.isNaN(localD.getTime())) return localS;

  const dd = String(localD.getDate()).padStart(2, "0");
  const mm = String(localD.getMonth() + 1).padStart(2, "0");
  const yyyy: any = localD.getFullYear();
  const hh = String(localD.getHours()).padStart(2, "0");
  const mi = String(localD.getMinutes()).padStart(2, "0");
  const ss = String(localD.getSeconds()).padStart(2, "0");

  return dd + "." + mm + "." + yyyy + " " + hh + ":" + mi + ":" + ss;
}

export function styleToCssText(styleObj: unknown): string {
  const style: any = toObject(styleObj);
  const parts = [];

  for (const key of Object.keys(style)) {
    if (style[key] == null || style[key] === "") continue;
    parts.push(key + ":" + style[key]);
  }

  return parts.join(";");
}

export function applyStyle(el: Element, styleObj: unknown): void {
  const cssText: any = styleToCssText(styleObj);
  if (cssText) {
    el.setAttribute("style", cssText);
  }
}

export function normalizeScopeIds(input: unknown): Record<string, unknown> {
  const src =
  input && typeof input === "object"
  ? (input as Record<string, unknown>)
  : {};
  const out: Record<string, unknown> = {};

  Object.entries(src).forEach(function ([key, value]) {
      const nextKey: any = safeStr(key);
      const nextValue: any = safeStr(value);
      if (!nextKey || !nextValue) return;
      if (nextKey === "id") return;
      out[nextKey] = nextValue;
  });

  return out;
}

function normalizeCountMap(input: unknown): Record<string, number> {
  const src =
  input && typeof input === "object" && !Array.isArray(input)
  ? (input as Record<string, unknown>)
  : {};
  const out: Record<string, number> = {};
  Object.entries(src).forEach(function ([key, value]) {
      const count = Number(value);
      if (!Number.isFinite(count) || count < 0) return;
      const label = safeStr(key);
      if (label) out[label] = Math.floor(count);
  });
  return out;
}

function hasStatsSummaryFields(src: Record<string, unknown>) {
  return "total" in src || "levelCounts" in src || "groupCounts" in src;
}

function normalizeStatsSummary(input: unknown) {
  const src =
  input && typeof input === "object"
  ? (input as Record<string, unknown>)
  : null;
  if (!src) return null;
  const total = Number(src.total);
  const levelCounts = normalizeCountMap(src.levelCounts);
  const groupCounts = normalizeCountMap(src.groupCounts);
  const normalizedTotal =
  Number.isFinite(total) && total >= 0 ? Math.floor(total) : 0;
  const hasCounts =
  Object.keys(levelCounts).length > 0 || Object.keys(groupCounts).length > 0;
  if (!hasCounts && !hasStatsSummaryFields(src)) return null;
  return {
    total: normalizedTotal,
    levelCounts,
    groupCounts,
  };
}

function normalizeInitialLogsPage(
  cfg: Record<string, any>,
  deploymentLogs: unknown[],
) {
  return cfg.initialLogsPage && typeof cfg.initialLogsPage === "object"
  ? cfg.initialLogsPage
  : {
    logs: [],
    offset: 0,
    nextOffset: deploymentLogs.length,
    hasMore: false,
    total: deploymentLogs.length,
    limit: LOGS_PAGE_SIZE,
  };
}

function defaultFullscreenGroup(instanceId: string) {
  return instanceId === DEFAULT_LOGS_INSTANCE_ID
  ? "logs-container"
  : `${instanceId}-container`;
}

export function normalizeLogsConfig(
  input: LogsConfig | null | undefined,
  options: { instanceId?: unknown } = {},
): NormalizedLogsConfig {
  const genericEmptyMessage = logsT("noLogsAvailable");
  const cfg = input && typeof input === "object" ? input : {};
  const status: any = safeStr((cfg as any).status).toLowerCase();
  const fullscreenId = normalizeInstanceId(
    safeStr((cfg as any).fullscreenId) ||
      safeStr(options.instanceId) ||
      DEFAULT_LOGS_INSTANCE_ID,
  );
  const deploymentLogs = hydrateLogs(
    Array.isArray((cfg as any).logs)
    ? (cfg as any).logs
    : (cfg as any).deploymentLogs,
  );
  const initialLogsPage = normalizeInitialLogsPage(cfg as any, deploymentLogs);
  return {
    raw: (cfg as any).raw || cfg,
    debugLogs: (cfg as any).debugLogs === true,
    debugLabel: safeStr((cfg as any).debugLabel),
    config_key: safeStr((cfg as any).config_key),
    appId: safeStr((cfg as any).appId),
    scopeIds: normalizeScopeIds((cfg as any).scopeIds),
    deploymentId: safeStr((cfg as any).deploymentId),
    status,
    isRunning:
    (cfg as any).isRunning === true ||
      (cfg as any).isLive === true ||
      status === "running",
    deploymentLogs,
    logStyle:
    (cfg as any).logStyle && typeof (cfg as any).logStyle === "object"
    ? (cfg as any).logStyle
    : null,
    totalStats: normalizeStatsSummary(
      (cfg as any).totalStats ||
        ((cfg as any).initialLogsPage && (cfg as any).initialLogsPage.stats),
    ),
    socketNamespace:
    safeStr((cfg as any).socketNamespace) || "/deployments/logs",
    socketOptions:
    (cfg as any).socketOptions &&
      typeof (cfg as any).socketOptions === "object" &&
      !Array.isArray((cfg as any).socketOptions)
    ? { ...((cfg as any).socketOptions as Record<string, unknown>) }
    : null,
    subscribeEvent:
    safeStr((cfg as any).subscribeEvent) || "subscribeDeployment",
    platformLogs: (cfg as any).platformLogs !== false,
    platformLogsDefaultOff: (cfg as any).platformLogsDefaultOff === true,
    allowFrontendLogs: (cfg as any).allowFrontendLogs === true,
    logsDataUrl: safeStr((cfg as any).logsDataUrl),
    initialLogsPage,
    allowEmptyScopeIds: Boolean((cfg as any).allowEmptyScopeIds === true),
    loadingMessage:
    safeStr((cfg as any).loadingMessage) || logsT("loadingLogs"),
    waitingMessage:
    safeStr((cfg as any).waitingMessage) || logsT("waitingForLogs"),
    emptyMessage: safeStr((cfg as any).emptyMessage) || genericEmptyMessage,
    fullscreenGroup:
    safeStr((cfg as any).fullscreenGroup) ||
      defaultFullscreenGroup(fullscreenId),
    fullscreenId,
    subscribePayload:
    typeof (cfg as any).subscribePayload === "function"
    ? (cfg as any).subscribePayload
    : undefined,
  };
}
