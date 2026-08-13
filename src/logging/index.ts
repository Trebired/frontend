import {
  resolveLogger,
  type LoggerAdapterDefaultLogger,
  type LoggerAdapterLogger,
  type LoggerAdapterWriter,
  type NormalizedLoggerAdapter,
} from "@package/logger-adapter/browser";

type FrontendLoggingOptions = {
  defaultLogger?: LoggerAdapterDefaultLogger | false;
  frontend_quiet?: boolean;
  logger?: LoggerAdapterLogger;
  loggerAdapter?: LoggerAdapterWriter;
  quiet?: boolean;
};

type FrontendLogger = NormalizedLoggerAdapter;

const FRONTEND_PACKAGE_SOURCE = "frontend";
const FRONTEND_LOG_GROUP = "frontend";

function readGlobalQuiet() {
  const global = globalThis as typeof globalThis& {
    frontend_quiet?: unknown;
  };
  if (typeof global.frontend_quiet === "boolean") return global.frontend_quiet;
  const attr = typeof document === "undefined"
  ? ""
  : document.documentElement.getAttribute("data-tbf-frontend-quiet");
  if (attr === "true" || attr === "1") return true;
  if (attr === "false" || attr === "0") return false;
  return false;
}

function isFrontendQuiet(options: FrontendLoggingOptions = {}) {
  if (typeof options.frontend_quiet === "boolean") return options.frontend_quiet;
  if (typeof options.quiet === "boolean") return options.quiet;
  return readGlobalQuiet();
}

function toFrontendLogGroup(group: string) {
  const normalized = String(group || "").trim();
  if (!normalized) return FRONTEND_LOG_GROUP;
  if (normalized === FRONTEND_LOG_GROUP || normalized.startsWith(`${FRONTEND_LOG_GROUP}.`)) {
    return normalized;
  }
  return `${FRONTEND_LOG_GROUP}.${normalized}`;
}

function quietLoggerMethod() {
  return undefined;
}

function quietLogger(): FrontendLogger {
  return {
    error: quietLoggerMethod,
    fail: quietLoggerMethod,
    info: quietLoggerMethod,
    log: quietLoggerMethod,
    warn: quietLoggerMethod,
  };
}

function resolveFrontendLogger(options: FrontendLoggingOptions = {}): FrontendLogger {
  if (isFrontendQuiet(options)) return quietLogger();
  const logger = resolveLogger({
      adapter: options.loggerAdapter,
      defaultLogger: options.defaultLogger,
      fallback: "noop",
      logger: options.logger,
      source: FRONTEND_PACKAGE_SOURCE,
  });
  return {
    error(group, message, metadata) {
      logger.error(toFrontendLogGroup(group), message, metadata);
    },
    fail(group, message, metadata) {
      logger.fail(toFrontendLogGroup(group), message, metadata);
    },
    info(group, message, metadata) {
      logger.info(toFrontendLogGroup(group), message, metadata);
    },
    log(level, group, message, metadata) {
      logger.log(level, toFrontendLogGroup(group), message, metadata);
    },
    warn(group, message, metadata) {
      logger.warn(toFrontendLogGroup(group), message, metadata);
    },
  };
}

export {
  FRONTEND_LOG_GROUP,
  FRONTEND_PACKAGE_SOURCE,
  isFrontendQuiet,
  resolveFrontendLogger,
  toFrontendLogGroup,
};
export type { FrontendLogger, FrontendLoggingOptions };
export *from "./browser.js";
