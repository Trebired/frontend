import {
  requestBody,
  requestCookies,
  requestHeader,
  requestQuery,
  responseSecure,
  sendJson,
  type CookieOptions,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./http.js";

const DEFAULT_THEME_COOKIE_NAME = "theme";
const DEFAULT_EFFECTIVE_THEME_COOKIE_NAME = "theme_effective";
const DEFAULT_THEME_KEYS = Object.freeze(["dark", "light"]);
const DEFAULT_THEME_CLASSES = Object.freeze({ dark: "", light: "light" });

type ThemeServerOptions = {
  allowedThemes?: readonly string[] | Record<string, unknown>;
  classNames?: Record<string, string>;
  cookieName?: string;
  cookieOptions?: CookieOptions;
  defaultTheme?: string;
  effectiveCookieName?: string;
  headerName?: string;
  secure?: boolean;
};

type ThemeToggleContext = {
  payload: Record<string, unknown>;
  req: ServerRequestLike;
  res: ServerResponseLike;
  theme: string;
};

type ThemeToggleHandlerOptions = {
  options?: ThemeServerOptions;
  path?: string;
  respond?: (context: ThemeToggleContext) => unknown;
};

function normalizeThemeToken(value: unknown) {
  const token = String(value == null ? "" : value)
  .trim()
  .toLowerCase();
  return /^[a-z0-9_-]{1,32}$/u.test(token) ? token : "";
}

function allowedThemeKeys(options: ThemeServerOptions = {}) {
  const source = options.allowedThemes || DEFAULT_THEME_KEYS;
  const keys = Array.isArray(source) ? source : Object.keys(source);
  return keys.map(normalizeThemeToken).filter(Boolean);
}

function themeIsAllowed(value: unknown, options: ThemeServerOptions = {}) {
  const token = normalizeThemeToken(value);
  return Boolean(token && allowedThemeKeys(options).includes(token));
}

function themeCookieName(options: ThemeServerOptions = {}) {
  return String(options.cookieName || DEFAULT_THEME_COOKIE_NAME).trim();
}

function themeEffectiveCookieName(options: ThemeServerOptions = {}) {
  return String(options.effectiveCookieName || DEFAULT_EFFECTIVE_THEME_COOKIE_NAME).trim();
}

function currentTheme(req: ServerRequestLike | null | undefined, options: ThemeServerOptions = {}) {
  const token = normalizeThemeToken(requestCookies(req)[themeCookieName(options)]);
  return themeIsAllowed(token, options) ? token : "";
}

function browserPreferredTheme(
  req: ServerRequestLike | null | undefined,
  options: ThemeServerOptions = {},
) {
  const token = normalizeThemeToken(requestHeader(req, "sec-ch-prefers-color-scheme"));
  return themeIsAllowed(token, options) ? token : "";
}

function effectiveThemeCookie(
  req: ServerRequestLike | null | undefined,
  options: ThemeServerOptions = {},
) {
  const token = normalizeThemeToken(requestCookies(req)[themeEffectiveCookieName(options)]);
  return themeIsAllowed(token, options) ? token : "";
}

function defaultThemeKey(options: ThemeServerOptions = {}) {
  return themeIsAllowed(options.defaultTheme, options)
  ? normalizeThemeToken(options.defaultTheme)
  : allowedThemeKeys(options)[0] || "";
}

function effectiveThemeKey(
  req: ServerRequestLike | null | undefined,
  options: ThemeServerOptions = {},
) {
  const headerTheme = options.headerName
  ? normalizeThemeToken(requestHeader(req, options.headerName))
  : "";
  if (themeIsAllowed(headerTheme, options)) return headerTheme;
  return (
    currentTheme(req, options) ||
      effectiveThemeCookie(req, options) ||
      browserPreferredTheme(req, options) ||
      defaultThemeKey(options)
  );
}

function themeClass(theme: unknown, options: ThemeServerOptions = {}) {
  const token = normalizeThemeToken(theme);
  if (!themeIsAllowed(token, options)) return "";
  return String((options.classNames || DEFAULT_THEME_CLASSES)[token] || "");
}

function applyThemeToLocals(
  req: ServerRequestLike | null | undefined,
  res: ServerResponseLike | null | undefined,
  options: ThemeServerOptions = {},
) {
  const locals = (res as { locals?: Record<string, unknown> } | null | undefined)?.locals;
  if (locals) locals.theme = currentTheme(req, options);
}

function setThemeCookie(
  req: ServerRequestLike | null | undefined,
  res: ServerResponseLike | null | undefined,
  theme: unknown,
  options: ThemeServerOptions = {},
) {
  if (!res || typeof res.cookie !== "function") return false;
  const token = normalizeThemeToken(theme);
  const cookieName = themeCookieName(options);
  const secure = responseSecure(req, options.secure);
  const base = {
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
    ...(options.cookieOptions || {}),
  };
  if (!cookieName || !themeIsAllowed(token, options)) {
    res.cookie(cookieName, "", { ...base, maxAge: 0 });
    return false;
  }
  res.cookie(cookieName, token, base);
  return true;
}

function setServerTheme(
  req: ServerRequestLike | null | undefined,
  res: ServerResponseLike | null | undefined,
  theme: unknown,
  options: ThemeServerOptions = {},
) {
  const token = normalizeThemeToken(theme);
  const next = themeIsAllowed(token, options) ? token : "";
  setThemeCookie(req, res, next, options);
  const cookies = requestCookies(req);
  const cookieName = themeCookieName(options);
  if (cookieName) {
    if (next) cookies[cookieName] = next;
    else delete cookies[cookieName];
  }
  applyThemeToLocals(req, res, options);
  return next;
}

function themeTogglePayload(theme: string) {
  return {
    ok: true,
    status_code: "theme-set",
    message: "theme-set",
    data: { theme },
    theme,
  };
}

function createThemeToggleHandler(config: ThemeToggleHandlerOptions = {}) {
  return async function themeToggleHandler(
    req: ServerRequestLike,
    res: ServerResponseLike,
    next?: (error: unknown) => unknown,
  ) {
    try {
      const body = requestBody(req);
      const query = requestQuery(req);
      const value = query.theme != null ? query.theme : body.theme;
      const theme = setServerTheme(req, res, value, config.options || {});
      const payload = themeTogglePayload(theme);
      if (config.respond) return config.respond({ payload, req, res, theme });
      return sendJson(res, payload);
    } catch (error) {
      if (typeof next === "function") return next(error);
      throw error;
    }
  };
}

function createThemeMiddleware(options: ThemeServerOptions = {}) {
  return function themeMiddleware(
    req: ServerRequestLike,
    res: ServerResponseLike,
    next: () => unknown,
  ) {
    applyThemeToLocals(req, res, options);
    return next();
  };
}

function attachThemeMiddleware(app: unknown, options: ThemeServerOptions = {}) {
  if (app && typeof (app as { use?: unknown }).use === "function") {
    (app as { use: (handler: unknown) => unknown }).use(createThemeMiddleware(options));
  }
}

function attachThemeRoutes(app: unknown, config: ThemeToggleHandlerOptions = {}) {
  if (app && typeof (app as { post?: unknown }).post === "function") {
    (app as { post: (path: string, handler: unknown) => unknown }).post(
      config.path || "/ui/theme/toggle",
      createThemeToggleHandler(config),
    );
  }
}

export {
  DEFAULT_EFFECTIVE_THEME_COOKIE_NAME,
  DEFAULT_THEME_CLASSES,
  DEFAULT_THEME_COOKIE_NAME,
  DEFAULT_THEME_KEYS,
  allowedThemeKeys,
  applyThemeToLocals,
  attachThemeMiddleware,
  attachThemeRoutes,
  browserPreferredTheme,
  createThemeMiddleware,
  createThemeToggleHandler,
  currentTheme,
  defaultThemeKey,
  effectiveThemeCookie,
  effectiveThemeKey,
  normalizeThemeToken,
  setServerTheme,
  setServerTheme as setTheme,
  setThemeCookie,
  themeClass,
  themeCookieName,
  themeEffectiveCookieName,
  themeIsAllowed,
  themeTogglePayload,
};
export type { ThemeServerOptions, ThemeToggleContext, ThemeToggleHandlerOptions };
