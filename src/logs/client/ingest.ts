import { syncGroupSelect, syncLevelSelect } from "./dropdowns.js";
import { bufferFrontendLogBatch } from "./bridge.js";
import { renderLogs } from "./render.js";
import { resolveLogsDomRoot } from "./dom.js";
import { appendLogsToPage, normalizeFrontendLogBatch } from "./view_state.js";
import { readLogsPartialPage } from "./page_registry.js";
import { normalizeLogsConfig, safeStr } from "./utils.js";
import type { LogsConfig } from "./types.js";

function ingestFrontendLogs(
  input:
  | {
    entries?: any[];
    instanceId?: string;
    config?: LogsConfig | null;
  }
  | any[]
  | null
  | undefined,
) {
  const batch = Array.isArray(input)
  ? normalizeFrontendLogBatch({ entries: input })
  : normalizeFrontendLogBatch(input);
  if (!batch.entries.length) return false;

  const root = resolveLogsDomRoot(null, batch.instanceId);
  const page = readLogsPartialPage(root);
  if (page) return ingestIntoPage(page, batch);

  return bufferFallbackLogs(batch);
}

function ingestIntoPage(page: any, batch: any) {
  if (batch.config && typeof batch.config === "object") {
    const nextConfig = normalizeLogsConfig(batch.config);
    if (nextConfig.allowFrontendLogs === true) page.config = nextConfig;
  }
  if (!page.config || page.config.allowFrontendLogs !== true) return false;
  return appendLogsToPage(page, batch.entries, {
      renderLogs,
      syncGroupSelect,
      syncLevelSelect,
  });
}

function bufferFallbackLogs(batch: any) {
  const fallbackConfig =
  batch.config && typeof batch.config === "object"
  ? normalizeLogsConfig(batch.config)
  : null;
  if (!fallbackConfig || fallbackConfig.allowFrontendLogs !== true)
  return false;

  const fallbackEntries = buildFallbackEntries(batch.entries, fallbackConfig);
  if (!fallbackEntries.length) return false;

  bufferFrontendLogBatch({
      entries: fallbackEntries,
      instanceId: batch.instanceId,
      config: fallbackConfig,
  });

  return false;
}

function buildFallbackEntries(entries: any[], fallbackConfig: any) {
  if (!safeStr(fallbackConfig.config_key)) return [];
  return entries.map(function (entry) {
      const src = entry && typeof entry === "object" ? entry : {};
      return {
        ...src,
        config_key: safeStr(fallbackConfig.config_key),
        ids: fallbackIds(fallbackConfig),
        origin: fallbackOrigin(src),
      };
  });
}

function fallbackIds(config: any) {
  return {
    ...(config.scopeIds && typeof config.scopeIds === "object"
      ? config.scopeIds
      : {}),
    ...(safeStr(config.deploymentId)
      ? { id: safeStr(config.deploymentId) }
      : {}),
  };
}

function fallbackOrigin(src: any) {
  return {
    source: safeStr(src.origin && src.origin.source) || "frontend",
    instance:
    src.origin && Object.prototype.hasOwnProperty.call(src.origin, "instance")
    ? src.origin.instance
    : null,
  };
}

export { ingestFrontendLogs };
