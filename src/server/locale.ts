import {
  requestHeader,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./http.js";

type LocaleState = {
  effective: string;
  request: string;
  user: string;
};

type LocaleMiddlewareOptions = {
  defaultLocale?: string;
  localsKey?: string;
  normalize?: (value: unknown) => string;
  readUserLocale?: (req: ServerRequestLike, res: ServerResponseLike) => unknown;
};

function normalizeIntlLocale(input: unknown) {
  const raw = String(input == null ? "" : input).trim();
  if (!raw) return "";
  try {
    return Intl.DateTimeFormat.supportedLocalesOf([raw])[0] || "";
  } catch {
    return "";
  }
}

function localeWeight(entry: string) {
  const match = entry.match(/(?:^|;)\s*q=([0-9.]+)/i);
  if (!match) return 1;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readRequestLocale(
  req: ServerRequestLike | null | undefined,
  normalize: (value: unknown) => string = normalizeIntlLocale,
) {
  const raw = requestHeader(req, "accept-language");
  if (!raw) return "";
  const entries = raw
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean)
  .sort((left, right) => localeWeight(right) - localeWeight(left));
  for (const entry of entries) {
    const locale = normalize(entry.split(";")[0]);
    if (locale) return locale;
  }
  return "";
}

function defaultUserLocale(req: ServerRequestLike, res: ServerResponseLike) {
  const viewer =
  (req as any)?.viewer && typeof(req as any).viewer === "object"
  ? (req as any).viewer
  : res?.locals?.viewer && typeof res.locals.viewer === "object"
  ? res.locals.viewer
  : null;
  return viewer && typeof viewer === "object" ? (viewer as any).locale : "";
}

function createLocaleState(
  req: ServerRequestLike,
  res: ServerResponseLike,
  options: LocaleMiddlewareOptions = {},
): LocaleState {
  const normalize = options.normalize || normalizeIntlLocale;
  const user = normalize(
    options.readUserLocale ? options.readUserLocale(req, res) : defaultUserLocale(req, res),
  );
  const request = readRequestLocale(req, normalize);
  return {
    effective: user || request || normalize(options.defaultLocale),
    request,
    user,
  };
}

function applyLocaleToLocals(
  req: ServerRequestLike,
  res: ServerResponseLike,
  options: LocaleMiddlewareOptions = {},
) {
  if (!res.locals || typeof res.locals !== "object") res.locals = {};
  const state = createLocaleState(req, res, options);
  res.locals[options.localsKey || "locale"] = state;
  return state;
}

function createLocaleMiddleware(options: LocaleMiddlewareOptions = {}) {
  return function localeMiddleware(
    req: ServerRequestLike,
    res: ServerResponseLike,
    next: () => unknown,
  ) {
    applyLocaleToLocals(req, res, options);
    return next();
  };
}

function attachLocaleMiddleware(app: unknown, options: LocaleMiddlewareOptions = {}) {
  if (app && typeof(app as { use?: unknown }).use === "function") {
    (app as { use: (handler: unknown) => unknown }).use(createLocaleMiddleware(options));
  }
}

const normalizeLocale = normalizeIntlLocale;

export {
  applyLocaleToLocals,
  attachLocaleMiddleware,
  createLocaleMiddleware,
  createLocaleState,
  normalizeLocale,
  readRequestLocale,
};
export type { LocaleMiddlewareOptions, LocaleState };
