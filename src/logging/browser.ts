import { pushFrontendLogBatch } from "#a0gi42ggclip";

type FrontendBrowserLogConfig = Record<string, unknown>& {
  allowFrontendLogs?: boolean;
  config_key?: string;
  configKey?: string;
  deploymentId?: string;
  instanceId?: string;
  requestId?: string;
  sessionId?: string;
};

type FrontendBrowserLogFactoryOptions = {
  console?: boolean;
  metadata?: Record<string, unknown>;
  quiet?: boolean;
  source?: string;
  transports?: Array<"console" | {
    name: string;
    write: (entries: unknown[]) => Promise<void>|void;
  }>;
};

type FrontendBrowserLogScope = {
  error?: (metadata: unknown, message?: string) => unknown;
  info?: (message: string, metadata?: unknown) => unknown;
};

type FrontendBrowserLogInstance = {
  withScope?: (source: string, group: string) => FrontendBrowserLogScope;
};

type FrontendBrowserLogBatch = {
  config: FrontendBrowserLogConfig;
  entries: unknown[];
  instanceId: string;
};

type FrontendBrowserLoggerOptions = {
  bindWindowErrors?: boolean;
  createLog: (
    options: FrontendBrowserLogFactoryOptions,
  ) => FrontendBrowserLogInstance;
  fallbackInstanceId?: string;
  pushBatch?: (batch: FrontendBrowserLogBatch) => unknown;
  readConfig?: () => unknown;
  source?: string;
  transportName?: string;
};

const BROWSER_LOG_SOURCE = "frontend";
const BROWSER_LOG_TRANSPORT = "logs-view";

let frontendBrowserLog: FrontendBrowserLogInstance | null = null;
let windowErrorLoggingBound = false;

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown): FrontendBrowserLogConfig | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return { ...value as Record<string, unknown> };
}

function readBrowserLogConfig(
  options: FrontendBrowserLoggerOptions,
): FrontendBrowserLogConfig | null {
  const config = objectValue(options.readConfig?.());
  if (!config) return null;
  const fallbackInstanceId = stringValue(options.fallbackInstanceId) ||
    BROWSER_LOG_TRANSPORT;
  return {
    ...config,
    instanceId: stringValue(config.instanceId) || fallbackInstanceId,
  };
}

function metadataValue(
  metadata: Record<string, unknown>,
  key: string,
  value: unknown,
) {
  const text = stringValue(value);
  if (text) metadata[key] = text;
}

function browserLogMetadata(config: FrontendBrowserLogConfig | null) {
  const metadata: Record<string, unknown> = {};
  if (!config) return metadata;
  metadataValue(metadata, "instanceId", config.instanceId);
  metadataValue(metadata, "deploymentId", config.deploymentId);
  metadataValue(metadata, "requestId", config.requestId);
  metadataValue(metadata, "sessionId", config.sessionId);
  metadataValue(metadata, "configKey", config.configKey || config.config_key);
  return metadata;
}

function browserErrorLocation(event: ErrorEvent) {
  return {
    colno: Number.isFinite(Number(event.colno)) ? Number(event.colno) : null,
    filename: stringValue(event.filename),
    lineno: Number.isFinite(Number(event.lineno)) ? Number(event.lineno) : null,
  };
}

function logWindowError(scope: FrontendBrowserLogScope, event: ErrorEvent) {
  const err = event.error;
  const message = stringValue(event.message);
  if (err instanceof Error) {
    scope.error?.({
        stack: err.stack || "",
        ...browserErrorLocation(event),
      }, err.message);
    return;
  }
  scope.error?.(browserErrorLocation(event), message || "window-error");
}

function logUnhandledRejection(
  scope: FrontendBrowserLogScope,
  event: PromiseRejectionEvent,
) {
  const reason = event.reason;
  if (reason instanceof Error) {
    scope.error?.({
        kind: "unhandledrejection",
        stack: reason.stack || "",
      }, reason.message);
    return;
  }
  scope.error?.({
      kind: "unhandledrejection",
      reason: reason == null ? "" : String(reason),
    }, "Unhandled promise rejection");
}

function bindWindowErrorLogging(log: FrontendBrowserLogInstance | null) {
  if (
    typeof window === "undefined" ||
      !log ||
      typeof log.withScope !== "function" ||
      windowErrorLoggingBound
  )
  return;
  const scoped = log.withScope(BROWSER_LOG_SOURCE, "runtime");
  if (!scoped || typeof scoped.error !== "function") return;
  windowErrorLoggingBound = true;
  window.addEventListener("error", (event) => logWindowError(scoped, event));
  window.addEventListener("unhandledrejection", (event) =>
    logUnhandledRejection(scoped, event));
}

function shouldPushBrowserEntries(config: FrontendBrowserLogConfig | null) {
  return config?.allowFrontendLogs === true;
}

function pushBrowserEntries(entries: unknown[], options: FrontendBrowserLoggerOptions) {
  if (
    !Array.isArray(entries) ||
      !entries.length ||
      typeof window === "undefined"
  )
  return;
  const config = readBrowserLogConfig(options);
  if (!shouldPushBrowserEntries(config)) return;
  const instanceId = stringValue(config?.instanceId) || BROWSER_LOG_TRANSPORT;
  const pushBatch = options.pushBatch || pushFrontendLogBatch;
  pushBatch({ config: config || {}, entries, instanceId });
}

type FrontendBrowserLoggerTypedOptions<
TLog extends FrontendBrowserLogInstance,
> = Omit<FrontendBrowserLoggerOptions, "createLog">& {
  createLog: (options: FrontendBrowserLogFactoryOptions) => TLog;
};

function createFrontendBrowserLogger<TLog extends FrontendBrowserLogInstance>(
  options: FrontendBrowserLoggerTypedOptions<TLog>,
): TLog {
  const config = readBrowserLogConfig(options);
  return options.createLog({
      console: true,
      metadata: browserLogMetadata(config),
      quiet: true,
      source: stringValue(options.source) || BROWSER_LOG_SOURCE,
      transports: [
        "console",
        {
          name: stringValue(options.transportName) || BROWSER_LOG_TRANSPORT,
          write(entries) {
            pushBrowserEntries(entries, options);
          },
        },
      ],
  });
}

function frontendBrowserLogger<TLog extends FrontendBrowserLogInstance>(
  options: FrontendBrowserLoggerTypedOptions<TLog>,
): TLog {
  if (frontendBrowserLog) return frontendBrowserLog as TLog;
  const log = createFrontendBrowserLogger(options);
  frontendBrowserLog = log;
  if (options.bindWindowErrors !== false) bindWindowErrorLogging(log);
  log
  .withScope?.(BROWSER_LOG_SOURCE, "logger")
  ?.info?.("Frontend logger initialized");
  return log;
}

export {
  createFrontendBrowserLogger,
  frontendBrowserLogger,
};
export type {
  FrontendBrowserLogBatch,
  FrontendBrowserLogConfig,
  FrontendBrowserLogFactoryOptions,
  FrontendBrowserLogInstance,
  FrontendBrowserLoggerTypedOptions,
  FrontendBrowserLoggerOptions,
};
