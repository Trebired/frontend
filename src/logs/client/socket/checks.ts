import { debugLogs } from "#d9s0ly9v6q0k";
import { safeStr } from "#gu61mitj537f";

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

export { logAcceptedBootstrap, shouldIgnoreBootstrap };
