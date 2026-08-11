import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  serverString,
  setResponseHeader,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./http.js";

type StaticDirectoryOptions = {
  cacheControl?: string;
  etag?: boolean;
  immutable?: boolean;
  maxAgeSeconds?: number;
  noSniff?: boolean;
  stripPrefix?: string;
};

type PackageStaticRouteOptions = StaticDirectoryOptions& {
  packageName: string;
  packageSubpath?: string;
  resolve?: (specifier: string) => string;
  route?: string;
};

type StaticRouteAttachment = {
  attached: boolean;
  reason: string;
  root: string;
  route: string;
};

type StaticAppLike = {
  use?: (route: string, handler: unknown) => unknown;
};

const STATIC_MIME_TYPES: Record<string, string> = Object.freeze({
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".wasm": "application/wasm",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
});

function staticRoute(value: unknown, fallback = "/") {
  const route = serverString(value).trim() || fallback;
  return route.startsWith("/") ? route : `/${route}`;
}

function stripRoutePrefix(pathname: string, prefixInput: unknown) {
  const prefix = staticRoute(prefixInput, "");
  if (!prefix || prefix === "/") return pathname;
  if (pathname === prefix) return "/";
  return pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
}

function requestStaticPath(req: ServerRequestLike, options: StaticDirectoryOptions = {}) {
  const raw = serverString(
    (req as { url?: unknown }).url ||
      req.path ||
      req.originalUrl ||
      "/",
  );
  const withoutQuery = raw.split("?")[0] || "/";
  const decoded = decodeURIComponent(withoutQuery);
  const pathname = decoded.startsWith("/") ? decoded : `/${decoded}`;
  return stripRoutePrefix(pathname, options.stripPrefix);
}

function staticCacheControl(options: StaticDirectoryOptions = {}) {
  if (options.cacheControl) return options.cacheControl;
  const seconds = Number(options.maxAgeSeconds);
  const maxAge = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return options.immutable
  ? `public, max-age=${maxAge}, immutable`
  : `public, max-age=${maxAge}`;
}

function staticContentType(filePath: string) {
  return STATIC_MIME_TYPES[path.extname(filePath).toLowerCase()] ||
    "application/octet-stream";
}

function resolveStaticFile(rootInput: unknown, requestPathInput: unknown) {
  const root = path.resolve(serverString(rootInput));
  const clean = serverString(requestPathInput)
  .replace(/^\/+/, "")
  .replace(/\\/g, "/");
  const filePath = path.resolve(root, clean || "index.html");
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) return "";
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return "";
  return filePath;
}

function sendStaticFile(
  res: ServerResponseLike,
  filePath: string,
  options: StaticDirectoryOptions = {},
) {
  const body = fs.readFileSync(filePath);
  setResponseHeader(res, "Cache-Control", staticCacheControl(options));
  setResponseHeader(res, "Content-Type", staticContentType(filePath));
  setResponseHeader(res, "Content-Length", String(body.byteLength));
  if (options.etag === false) setResponseHeader(res, "ETag", "");
  if (options.noSniff !== false) setResponseHeader(res, "X-Content-Type-Options", "nosniff");
  if (res && typeof res.status === "function") res.status(200);
  if (res && typeof res.send === "function") return res.send(body);
  if (res && typeof res.end === "function") return res.end(body);
  return body;
}

function createStaticDirectoryMiddleware(
  rootAbs: unknown,
  options: StaticDirectoryOptions = {},
) {
  return function staticDirectoryMiddleware(
    req: ServerRequestLike,
    res: ServerResponseLike,
    next?: () => unknown,
  ) {
    const filePath = resolveStaticFile(rootAbs, requestStaticPath(req, options));
    if (!filePath) return typeof next === "function" ? next() : undefined;
    return sendStaticFile(res, filePath, options);
  };
}

function attachStaticDirectory(
  appInput: unknown,
  routeInput: unknown,
  rootAbs: unknown,
  options: StaticDirectoryOptions = {},
): StaticRouteAttachment {
  const app = appInput as StaticAppLike;
  const route = staticRoute(routeInput);
  const root = path.resolve(serverString(rootAbs));
  if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return { attached: false, reason: "directory-not-found", root, route };
  }
  if (!app || typeof app.use !== "function") {
    return { attached: false, reason: "app-use-unavailable", root, route };
  }
  app.use(route, createStaticDirectoryMiddleware(root, options));
  return { attached: true, reason: "attached", root, route };
}

function defaultPackageResolver(specifier: string) {
  const resolver = (import.meta as { resolve?: (specifier: string) => string }).resolve;
  return typeof resolver === "function" ? resolver(specifier) : "";
}

function safePackageSubpath(value: unknown) {
  return serverString(value)
  .split(/[\\/]+/u)
  .map((segment) => segment.trim())
  .filter((segment) => segment && segment !== "." && segment !== "..");
}

function resolvePackageDirectory(options: PackageStaticRouteOptions) {
  const packageName = serverString(options.packageName).trim();
  if (!packageName) return "";
  const resolver = options.resolve || defaultPackageResolver;
  const packageJson = resolver(`${packageName}/package.json`);
  const packageJsonPath = packageJson.startsWith("file:")
  ? fileURLToPath(packageJson)
  : packageJson;
  if (!packageJsonPath) return "";
  return path.join(
    path.dirname(packageJsonPath),
    ...safePackageSubpath(options.packageSubpath),
  );
}

function attachPackageStaticRoute(
  app: unknown,
  options: PackageStaticRouteOptions,
): StaticRouteAttachment {
  const route = staticRoute(options.route, `/${options.packageName}`);
  const root = resolvePackageDirectory(options);
  if (!root) return { attached: false, reason: "package-not-resolved", root, route };
  return attachStaticDirectory(app, route, root, {
      ...options,
      stripPrefix: options.stripPrefix || route,
  });
}

function attachMonacoStaticRoute(
  app: unknown,
  options: Partial<PackageStaticRouteOptions> = {},
) {
  return attachPackageStaticRoute(app, {
      cacheControl: "public, max-age=86400",
      packageName: "monaco-editor",
      packageSubpath: "min",
      route: "/monaco",
      ...options,
  });
}

export {
  attachMonacoStaticRoute,
  attachPackageStaticRoute,
  attachStaticDirectory,
  createStaticDirectoryMiddleware,
  resolvePackageDirectory,
  resolveStaticFile,
  sendStaticFile,
  staticCacheControl,
  staticContentType,
};
export type {
  PackageStaticRouteOptions,
  StaticDirectoryOptions,
  StaticRouteAttachment,
};
