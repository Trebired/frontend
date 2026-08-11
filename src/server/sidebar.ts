import {
  requestBody,
  requestCookies,
  responseSecure,
  sendJson,
  type CookieOptions,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./http.js";

const DEFAULT_SIDEBAR_COOKIE_PREFIX = "sidebar_";
const DEFAULT_SIDEBAR_COOKIE_SUFFIX = "_minimized";
const DEFAULT_SIDEBAR_SIDES = Object.freeze(["left", "right"]);

type SidebarServerOptions = {
  allowedSides?: readonly string[];
  cookieOptions?: CookieOptions;
  cookiePrefix?: string;
  cookieSuffix?: string;
  secure?: boolean;
};

type SidebarToggleContext = {
  messageKey: string;
  payload: Record<string, unknown>;
  req: ServerRequestLike;
  res: ServerResponseLike;
  state: { minimized: boolean; side: string };
};

type SidebarToggleHandlerOptions = {
  options?: SidebarServerOptions;
  path?: string;
  respond?: (context: SidebarToggleContext) => unknown;
};

function normalizeSidebarSide(value: unknown, options: SidebarServerOptions = {}) {
  const side = String(value == null ? "" : value)
  .trim()
  .toLowerCase();
  const allowed = options.allowedSides || DEFAULT_SIDEBAR_SIDES;
  return allowed.includes(side) ? side : "";
}

function sidebarCookieName(side: unknown, options: SidebarServerOptions = {}) {
  const normalizedSide = normalizeSidebarSide(side, options);
  if (!normalizedSide) return "";
  return `${options.cookiePrefix || DEFAULT_SIDEBAR_COOKIE_PREFIX}${normalizedSide}${options.cookieSuffix || DEFAULT_SIDEBAR_COOKIE_SUFFIX}`;
}

function normalizeMinimized(value: unknown) {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  const text = String(value == null ? "" : value)
  .trim()
  .toLowerCase();
  if (text === "true" || text === "yes" || text === "on") return true;
  return false;
}

function currentSidebarMinimized(
  req: ServerRequestLike | null | undefined,
  side: unknown,
  options: SidebarServerOptions = {},
) {
  const cookieName = sidebarCookieName(side, options);
  if (!cookieName) return false;
  return normalizeMinimized(requestCookies(req)[cookieName]);
}

function setSidebarMinimizedCookie(
  req: ServerRequestLike | null | undefined,
  res: ServerResponseLike | null | undefined,
  side: unknown,
  minimized: unknown,
  options: SidebarServerOptions = {},
) {
  if (!res || typeof res.cookie !== "function") return false;
  const normalizedSide = normalizeSidebarSide(side, options);
  const cookieName = sidebarCookieName(normalizedSide, options);
  if (!normalizedSide || !cookieName) return false;
  const next = normalizeMinimized(minimized);
  const base = {
    httpOnly: false,
    sameSite: "lax",
    secure: responseSecure(req, options.secure),
    path: "/",
    ...(options.cookieOptions || {}),
  };
  if (!next) {
    res.cookie(cookieName, "", { ...base, maxAge: 0 });
    return false;
  }
  res.cookie(cookieName, "1", base);
  return true;
}

function setServerSidebarMinimized(
  req: ServerRequestLike | null | undefined,
  res: ServerResponseLike | null | undefined,
  side: unknown,
  minimized: unknown,
  options: SidebarServerOptions = {},
) {
  const normalizedSide = normalizeSidebarSide(side, options);
  if (!normalizedSide) return { side: "", minimized: false };
  const next = setSidebarMinimizedCookie(req, res, normalizedSide, minimized, options);
  const cookieName = sidebarCookieName(normalizedSide, options);
  const cookies = requestCookies(req);
  if (cookieName) {
    if (next) cookies[cookieName] = "1";
    else delete cookies[cookieName];
  }
  return { side: normalizedSide, minimized: next };
}

function sidebarTogglePayload(state: { minimized: boolean; side: string }) {
  const messageKey = state.minimized ? "minimized" : "expanded";
  return {
    messageKey,
    payload: {
      ok: true,
      status_code: messageKey,
      message: messageKey,
      data: state,
    },
  };
}

function createSidebarToggleHandler(config: SidebarToggleHandlerOptions = {}) {
  return async function sidebarToggleHandler(
    req: ServerRequestLike,
    res: ServerResponseLike,
    next?: (error: unknown) => unknown,
  ) {
    try {
      const body = requestBody(req);
      const state = setServerSidebarMinimized(
        req,
        res,
        body.side,
        body.minimized,
        config.options || {},
      );
      const { messageKey, payload } = sidebarTogglePayload(state);
      if (config.respond) return config.respond({ messageKey, payload, req, res, state });
      return sendJson(res, payload);
    } catch (error) {
      if (typeof next === "function") return next(error);
      throw error;
    }
  };
}

function attachSidebarRoutes(app: unknown, config: SidebarToggleHandlerOptions = {}) {
  if (app && typeof (app as { post?: unknown }).post === "function") {
    (app as { post: (path: string, handler: unknown) => unknown }).post(
      config.path || "/ui/sidebar/toggle",
      createSidebarToggleHandler(config),
    );
  }
}

export {
  DEFAULT_SIDEBAR_COOKIE_PREFIX,
  DEFAULT_SIDEBAR_COOKIE_SUFFIX,
  DEFAULT_SIDEBAR_SIDES,
  attachSidebarRoutes,
  createSidebarToggleHandler,
  currentSidebarMinimized,
  normalizeMinimized,
  normalizeSidebarSide,
  setServerSidebarMinimized,
  setServerSidebarMinimized as setSidebarMinimized,
  setSidebarMinimizedCookie,
  sidebarCookieName,
  sidebarTogglePayload,
};
export type { SidebarServerOptions, SidebarToggleContext, SidebarToggleHandlerOptions };
