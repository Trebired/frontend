import {
  redirectResponse,
  requestQuery,
  sendText,
  setResponseHeader,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./http.js";
import { effectiveThemeKey, themeIsAllowed, type ThemeServerOptions } from "./theme.js";

type ThemedFaviconOptions = {
  contentType?: string;
  legacyRoutes?: readonly string[];
  logger?: { error?: (scope: string, message: string, metadata?: Record<string, unknown>) => unknown };
  noCache?: boolean;
  redirectStatus?: number;
  render: (themeKey: string, req: ServerRequestLike) => string;
  route?: string;
  theme?: ThemeServerOptions;
  themeQueryName?: string;
};

function themedFaviconHref(themeKey: unknown, options: Pick<ThemedFaviconOptions, "route" | "themeQueryName"> = {}) {
  const route = String(options.route || "/favicon.svg").trim() || "/favicon.svg";
  const queryName = String(options.themeQueryName || "theme").trim() || "theme";
  const theme = encodeURIComponent(String(themeKey == null ? "" : themeKey).trim());
  return theme ? `${route}?${encodeURIComponent(queryName)}=${theme}` : route;
}

function applyFaviconNoCacheHeaders(res: ServerResponseLike | null | undefined) {
  setResponseHeader(res, "Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  setResponseHeader(res, "Pragma", "no-cache");
  setResponseHeader(res, "Expires", "0");
  setResponseHeader(res, "Surrogate-Control", "no-store");
}

function themedFaviconTheme(
  req: ServerRequestLike | null | undefined,
  options: ThemedFaviconOptions,
) {
  const themeOptions = options.theme || {};
  const queryName = String(options.themeQueryName || "theme").trim() || "theme";
  const queryTheme = requestQuery(req)[queryName];
  return themeIsAllowed(queryTheme, themeOptions)
  ? String(queryTheme).trim().toLowerCase()
  : effectiveThemeKey(req, themeOptions);
}

function sendThemedFavicon(
  req: ServerRequestLike,
  res: ServerResponseLike,
  options: ThemedFaviconOptions,
) {
  if (options.noCache !== false) applyFaviconNoCacheHeaders(res);
  const theme = themedFaviconTheme(req, options);
  return sendText(
    res,
    options.render(theme, req),
    options.contentType || "image/svg+xml; charset=utf-8",
  );
}

function handleFaviconError(
  error: unknown,
  res: ServerResponseLike,
  options: ThemedFaviconOptions,
) {
  if (options.logger && typeof options.logger.error === "function") {
    options.logger.error("frontend.favicon", "favicon request failed", {
        error: error && (error as { message?: unknown }).message
        ? String((error as { message?: unknown }).message)
        : String(error),
    });
  }
  if (res && typeof res.status === "function") res.status(500);
  if (res && typeof res.end === "function") return res.end();
  return undefined;
}

function createThemedFaviconHandler(options: ThemedFaviconOptions) {
  return async function themedFaviconHandler(req: ServerRequestLike, res: ServerResponseLike) {
    try {
      return sendThemedFavicon(req, res, options);
    } catch (error) {
      return handleFaviconError(error, res, options);
    }
  };
}

function createFaviconRedirectHandler(options: ThemedFaviconOptions) {
  return async function faviconRedirectHandler(_req: ServerRequestLike, res: ServerResponseLike) {
    try {
      if (options.noCache !== false) applyFaviconNoCacheHeaders(res);
      return redirectResponse(res, options.redirectStatus || 302, options.route || "/favicon.svg");
    } catch (error) {
      return handleFaviconError(error, res, options);
    }
  };
}

function attachThemedFaviconRoutes(app: unknown, options: ThemedFaviconOptions) {
  if (!(app && typeof (app as { get?: unknown }).get === "function")) return;
  const route = options.route || "/favicon.svg";
  const get = (app as { get: (path: string, handler: unknown) => unknown }).get.bind(app);
  get(route, createThemedFaviconHandler({ ...options, route }));
  for (const legacy of options.legacyRoutes || []) {
    get(String(legacy), createFaviconRedirectHandler({ ...options, route }));
  }
}

export {
  applyFaviconNoCacheHeaders,
  attachThemedFaviconRoutes,
  createFaviconRedirectHandler,
  createThemedFaviconHandler,
  sendThemedFavicon,
  themedFaviconHref,
  themedFaviconTheme,
};
export type { ThemedFaviconOptions };
