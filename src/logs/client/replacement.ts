import { safeStr } from "./utils.js";

export function shouldPreserveLiveLogsOnReplacement(
  page: any,
  config: any,
  incomingLogs: any[],
) {
  if (!page || !config) return false;
  if (Array.isArray(incomingLogs) && incomingLogs.length > 0) return false;
  if (!config.isRunning) return false;

  const existingLogs = Array.isArray(page.state && page.state.allLogs)
  ? page.state.allLogs
  : [];
  if (!existingLogs.length) return false;

  return (
    safeStr(page.config && page.config.config_key) ===
    safeStr(config.config_key) &&
      safeStr(page.config && page.config.deploymentId) ===
    safeStr(config.deploymentId) &&
      safeStr(page.config && page.config.logsDataUrl) ===
    safeStr(config.logsDataUrl)
  );
}
