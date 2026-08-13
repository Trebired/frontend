import { AsyncLocalStorage } from "async_hooks";

import {
  resolveFrontendServerLogger,
  type FrontendServerLoggerInput,
} from "./logging.js";

type PerformanceDbEntry = {
  caller: string;
  label: string;
  ms: number;
  op: string;
  table: string;
};

type FrontendPerformanceContext = {
  assetCount: number;
  assetMs: number;
  dbCount: number;
  dbEntries: PerformanceDbEntry[];
  dbMs: number;
  id: string;
  method: string;
  path: string;
  renderCount: number;
  renderMs: number;
  startedAt: number;
};

type FrontendPerformanceSnapshot = Omit<FrontendPerformanceContext, "startedAt">& {
  totalMs: number;
};

type FrontendPerformanceMiddlewareOptions = {
  logger?: FrontendServerLoggerInput;
  readLogger?: () => FrontendServerLoggerInput;
  readServerTiming?: () => boolean;
  readSlowRequestMs?: () => number;
  serverTiming?: boolean;
  slowRequestMs?: number;
};

const storage = new AsyncLocalStorage<FrontendPerformanceContext>();
const attachedPerformanceApps = new WeakSet<object>();

function text(value: unknown) {
  return String(value == null ? "" : value).trim();
}

function nowMs() {
  return performance.now();
}

function runWithRequestContext(req: any, fn: () => void) {
  const ctx: FrontendPerformanceContext = {
    assetCount: 0,
    assetMs: 0,
    dbCount: 0,
    dbEntries: [],
    dbMs: 0,
    id: text(req?.req_id),
    method: text(req?.method),
    path: text(req?.originalUrl || req?.url || req?.path),
    renderCount: 0,
    renderMs: 0,
    startedAt: nowMs(),
  };

  storage.run(ctx, fn);
}

function current() {
  return storage.getStore() || null;
}

function recordDbQuery(
  ms: unknown,
  meta?: {
    caller?: unknown;
    label?: unknown;
    op?: unknown;
    table?: unknown;
  },
) {
  const ctx = current();
  if (!ctx) return;
  const durationMs = Number(ms) || 0;
  ctx.dbCount += 1;
  ctx.dbMs += durationMs;
  ctx.dbEntries.push({
      caller: text(meta?.caller),
      label: text(meta?.label),
      ms: durationMs,
      op: text(meta?.op),
      table: text(meta?.table),
  });
}

function recordRender(ms: unknown) {
  const ctx = current();
  if (!ctx) return;
  ctx.renderCount += 1;
  ctx.renderMs += Number(ms) || 0;
}

function recordAsset(ms: unknown) {
  const ctx = current();
  if (!ctx) return;
  ctx.assetCount += 1;
  ctx.assetMs += Number(ms) || 0;
}

function snapshot(): FrontendPerformanceSnapshot | null {
  const ctx = current();
  if (!ctx) return null;

  return {
    assetCount: ctx.assetCount,
    assetMs: ctx.assetMs,
    dbCount: ctx.dbCount,
    dbEntries: ctx.dbEntries.slice(),
    dbMs: ctx.dbMs,
    id: ctx.id,
    method: ctx.method,
    path: ctx.path,
    renderCount: ctx.renderCount,
    renderMs: ctx.renderMs,
    totalMs: nowMs() - ctx.startedAt,
  };
}

function formatServerTiming(data?: FrontendPerformanceSnapshot | null) {
  const snap = data && typeof data === "object" ? data : snapshot();
  if (!snap) return "";

  const part = (name: string, ms: unknown, desc?: string) => {
    const dur = Math.max(0, Number(ms) || 0).toFixed(1);
    return desc ? `${name};dur=${dur};desc="${desc}"` : `${name};dur=${dur}`;
  };

  return [
    part("app", snap.totalMs),
    part("db", snap.dbMs, `${snap.dbCount} queries`),
    part("render", snap.renderMs, `${snap.renderCount} renders`),
    part("asset", snap.assetMs, `${snap.assetCount} assets`),
  ].join(", ");
}

function contentTypeOf(res: any) {
  const value =
  res && typeof res.getHeader === "function"
  ? res.getHeader("content-type")
  : "";
  return String(Array.isArray(value) ? value[0] || "" : value || "").toLowerCase();
}

function isHtmlPageRequest(req: any, res: any) {
  if (text(req?.method).toUpperCase() !== "GET") return false;
  const type = contentTypeOf(res);
  return type.includes("text/html") || type.includes("application/xhtml+xml");
}

function requestLogMeta(snap: FrontendPerformanceSnapshot, res: any) {
  const totalMs = Math.round(snap.totalMs);
  const dbMs = Math.round(snap.dbMs);
  const renderMs = Math.round(snap.renderMs);
  const assetMs = Math.round(snap.assetMs);
  return {
    method: snap.method,
    path: snap.path,
    status: Number(res?.statusCode || 0),
    total_ms: totalMs,
    db_count: snap.dbCount,
    db_ms: dbMs,
    render_count: snap.renderCount,
    render_ms: renderMs,
    asset_count: snap.assetCount,
    asset_ms: assetMs,
    other_ms: Math.max(0, totalMs - dbMs - renderMs - assetMs),
  };
}

function slowDbEntries(snap: FrontendPerformanceSnapshot) {
  return snap.dbEntries
  .slice()
  .sort((a, b) => (Number(b.ms) || 0) - (Number(a.ms) || 0))
  .slice(0, 10)
  .map((entry) => ({
        caller: entry.caller,
        duration_ms: Math.round(Number(entry.ms) || 0),
        label: entry.label,
        op: entry.op,
        table: entry.table,
  }));
}

function readSlowRequestMs(options: FrontendPerformanceMiddlewareOptions) {
  if (typeof options.readSlowRequestMs === "function") {
    return Number(options.readSlowRequestMs()) || 0;
  }
  return Number(options.slowRequestMs ?? 500) || 0;
}

function readServerTimingEnabled(options: FrontendPerformanceMiddlewareOptions) {
  if (typeof options.readServerTiming === "function") {
    return options.readServerTiming() !== false;
  }
  return options.serverTiming !== false;
}

function readPerformanceLogger(options: FrontendPerformanceMiddlewareOptions) {
  return resolveFrontendServerLogger(options.readLogger?.() || options.logger);
}

function attachServerTimingHeader(
  res: any,
  options: FrontendPerformanceMiddlewareOptions,
) {
  const origWriteHead =
  typeof res?.writeHead === "function" ? res.writeHead.bind(res) : null;
  if (!origWriteHead) return;

  res.writeHead = function wrappedWriteHead(...args: unknown[]) {
    if (readServerTimingEnabled(options) && !res.headersSent) {
      const header = formatServerTiming(snapshot());
      if (header) res.setHeader("Server-Timing", header);
    }
    return origWriteHead(...args);
  };
}

function logPerformanceRequest(
  req: any,
  res: any,
  options: FrontendPerformanceMiddlewareOptions,
) {
  const snap = snapshot();
  if (!snap) return;

  const meta = requestLogMeta(snap, res);
  const logger = readPerformanceLogger(options);

  if (isHtmlPageRequest(req, res)) {
    logger.info("performance.request", "page request", meta);
  }

  const slowMs = readSlowRequestMs(options);
  if (!slowMs || snap.totalMs < slowMs) return;

  logger.warn("performance.request", "slow request", {
      ...meta,
      slow_db_entries: slowDbEntries(snap),
  });
}

function attachFrontendPerformanceMiddleware(
  app: any,
  options: FrontendPerformanceMiddlewareOptions = {},
) {
  if (!app || typeof app.use !== "function") return false;
  if (attachedPerformanceApps.has(app)) return false;
  attachedPerformanceApps.add(app);

  app.use((req: any, res: any, next: any) => {
      runWithRequestContext(req, () => {
          attachServerTimingHeader(res, options);
          res.on("finish", () => logPerformanceRequest(req, res, options));
          next();
      });
  });
  return true;
}

export {
  attachFrontendPerformanceMiddleware,
  current,
  formatServerTiming,
  recordAsset,
  recordDbQuery,
  recordRender,
  runWithRequestContext,
  snapshot,
};
export type {
  FrontendPerformanceContext,
  FrontendPerformanceMiddlewareOptions,
  FrontendPerformanceSnapshot,
};
