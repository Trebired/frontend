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

const DEFAULT_LANGUAGE_COOKIE_NAME = "ui_lang";
const DEFAULT_LANGUAGE_KEYS = Object.freeze(["en"]);

type LanguageServerOptions = {
  allowedLanguages?: readonly string[] | Record<string, unknown>;
  cookieName?: string;
  cookieOptions?: CookieOptions;
  defaultLanguage?: string;
  headerName?: string;
  localsKey?: string;
  secure?: boolean;
};

type LanguageSetContext = {
  lang: string;
  payload: Record<string, unknown>;
  req: ServerRequestLike;
  res: ServerResponseLike;
};

type LanguageSetHandlerOptions = {
  options?: LanguageServerOptions;
  path?: string;
  respond?: (context: LanguageSetContext) => unknown;
};

function normalizeLanguageToken(value: unknown) {
  const token = String(value == null ? "" : value)
  .trim()
  .replace(/_/g, "-")
  .toLowerCase();
  return /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/u.test(token) ? token : "";
}

function allowedLanguageKeys(options: LanguageServerOptions = {}) {
  const source = options.allowedLanguages || DEFAULT_LANGUAGE_KEYS;
  const keys = Array.isArray(source) ? source : Object.keys(source);
  return keys.map(normalizeLanguageToken).filter(Boolean);
}

function matchAllowedLanguage(value: unknown, options: LanguageServerOptions = {}) {
  const token = normalizeLanguageToken(value);
  if (!token) return "";
  const allowed = allowedLanguageKeys(options);
  if (allowed.includes(token)) return token;
  const base = token.split("-")[0];
  return allowed.includes(base) ? base : "";
}

function languageIsAllowed(value: unknown, options: LanguageServerOptions = {}) {
  return Boolean(matchAllowedLanguage(value, options));
}

function languageCookieName(options: LanguageServerOptions = {}) {
  return String(options.cookieName || DEFAULT_LANGUAGE_COOKIE_NAME).trim();
}

function currentLanguage(req: ServerRequestLike | null | undefined, options: LanguageServerOptions = {}) {
  return matchAllowedLanguage(requestCookies(req)[languageCookieName(options)], options);
}

function acceptLanguageWeight(entry: string) {
  const qualityMatch = /(?:^|;)\s*q=([0-9.]+)/i.exec(entry);
  const weight = qualityMatch ? Number(qualityMatch[1]) : 1;
  return Number.isFinite(weight) ? weight : 0;
}

function browserPreferredLanguage(
  req: ServerRequestLike | null | undefined,
  options: LanguageServerOptions = {},
) {
  const header = requestHeader(req, options.headerName || "accept-language");
  const entries = header
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean)
  .sort((left, right) => acceptLanguageWeight(right) - acceptLanguageWeight(left));

  for (const entry of entries) {
    const lang = matchAllowedLanguage(entry.split(";")[0], options);
    if (lang) return lang;
  }

  return "";
}

function defaultLanguage(options: LanguageServerOptions = {}) {
  return (
    matchAllowedLanguage(options.defaultLanguage, options) ||
      allowedLanguageKeys(options)[0] ||
      ""
  );
}

function effectiveLanguage(req: ServerRequestLike | null | undefined, options: LanguageServerOptions = {}) {
  return (
    currentLanguage(req, options) ||
      browserPreferredLanguage(req, options) ||
      defaultLanguage(options)
  );
}

function applyLanguageToLocals(
  req: ServerRequestLike | null | undefined,
  res: ServerResponseLike | null | undefined,
  options: LanguageServerOptions = {},
) {
  const locals = (res as { locals?: Record<string, unknown> } | null | undefined)?.locals;
  if (locals) locals[options.localsKey || "lang"] = effectiveLanguage(req, options);
}

function setLanguageCookie(
  req: ServerRequestLike | null | undefined,
  res: ServerResponseLike | null | undefined,
  lang: unknown,
  options: LanguageServerOptions = {},
) {
  if (!res || typeof res.cookie !== "function") return false;
  const cookieName = languageCookieName(options);
  const next = matchAllowedLanguage(lang, options);
  const base = {
    httpOnly: false,
    sameSite: "lax",
    secure: responseSecure(req, options.secure),
    path: "/",
    ...(options.cookieOptions || {}),
  };
  if (!cookieName || !next) {
    res.cookie(cookieName, "", { ...base, maxAge: 0 });
    return false;
  }
  res.cookie(cookieName, next, base);
  return true;
}

function setServerLanguage(
  req: ServerRequestLike | null | undefined,
  res: ServerResponseLike | null | undefined,
  lang: unknown,
  options: LanguageServerOptions = {},
) {
  const next = matchAllowedLanguage(lang, options);
  setLanguageCookie(req, res, next, options);
  const cookieName = languageCookieName(options);
  const cookies = requestCookies(req);
  if (cookieName) {
    if (next) cookies[cookieName] = next;
    else delete cookies[cookieName];
  }
  applyLanguageToLocals(req, res, options);
  return effectiveLanguage(req, options);
}

function languageSetPayload(lang: string) {
  return {
    ok: true,
    status_code: "language-set",
    message: "language-set",
    data: { lang },
    lang,
  };
}

function createLanguageSetHandler(config: LanguageSetHandlerOptions = {}) {
  return async function languageSetHandler(
    req: ServerRequestLike,
    res: ServerResponseLike,
    next?: (error: unknown) => unknown,
  ) {
    try {
      const body = requestBody(req);
      const query = requestQuery(req);
      const value = query.lang != null ? query.lang : body.lang;
      const lang = setServerLanguage(req, res, value, config.options || {});
      const payload = languageSetPayload(lang);
      if (config.respond) return config.respond({ lang, payload, req, res });
      return sendJson(res, payload);
    } catch (error) {
      if (typeof next === "function") return next(error);
      throw error;
    }
  };
}

function createLanguageMiddleware(options: LanguageServerOptions = {}) {
  return function languageMiddleware(
    req: ServerRequestLike,
    res: ServerResponseLike,
    next: () => unknown,
  ) {
    applyLanguageToLocals(req, res, options);
    return next();
  };
}

function attachLanguageMiddleware(app: unknown, options: LanguageServerOptions = {}) {
  if (app && typeof (app as { use?: unknown }).use === "function") {
    (app as { use: (handler: unknown) => unknown }).use(createLanguageMiddleware(options));
  }
}

function attachLanguageRoutes(app: unknown, config: LanguageSetHandlerOptions = {}) {
  if (app && typeof (app as { post?: unknown }).post === "function") {
    (app as { post: (path: string, handler: unknown) => unknown }).post(
      config.path || "/ui/lang/set",
      createLanguageSetHandler(config),
    );
  }
}

export {
  DEFAULT_LANGUAGE_COOKIE_NAME,
  DEFAULT_LANGUAGE_KEYS,
  allowedLanguageKeys,
  applyLanguageToLocals,
  attachLanguageMiddleware,
  attachLanguageRoutes,
  browserPreferredLanguage,
  createLanguageMiddleware,
  createLanguageSetHandler,
  currentLanguage,
  defaultLanguage,
  effectiveLanguage,
  languageCookieName,
  languageIsAllowed,
  languageSetPayload,
  matchAllowedLanguage,
  normalizeLanguageToken,
  setLanguageCookie,
  setServerLanguage,
  setServerLanguage as setLanguage,
};
export type { LanguageServerOptions, LanguageSetContext, LanguageSetHandlerOptions };
