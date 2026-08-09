import { safeStr } from "./utils.js";

function configOf(input: unknown) {
  if (!input || typeof input !== "object") return {};
  const page = input as any;
  if (page.config && typeof page.config === "object") return page.config;
  return input as any;
}

export function logsDebugEnabled(input: unknown) {
  const config = configOf(input);
  return config && config.debugLogs === true;
}

export function logsDebugLabel(input: unknown) {
  const config = configOf(input);
  return (
    safeStr(config && config.debugLabel) ||
      safeStr(config && config.config_key) ||
      "logs"
  );
}

export function debugLogs(
  input: unknown,
  event: string,
  detail: unknown = null,
) {
  if (!logsDebugEnabled(input)) return;

  try {
    console.debug(
      `[logs:${logsDebugLabel(input)}] ${safeStr(event) || "event"}`,
      detail,
    );
  } catch {}
}
