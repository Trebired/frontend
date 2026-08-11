import {
  serverString,
  setResponseHeader,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./http.js";

const ROBOTS_NOINDEX_CONTENT = "noindex, nofollow, noarchive";

type SeoConfig = {
  canonicalUrl?: string;
  contentLanguage?: string;
  googlebotContent?: string;
  htmlLang?: string;
  index?: boolean;
  metaDescription?: string;
  metaKeywords?: string;
  ogDescription?: string;
  ogImage?: string;
  ogLocale?: string;
  ogTitle?: string;
  ogType?: string;
  robotsContent?: string;
  title?: string;
  titleSuffix?: string;
  twitterCard?: string;
  twitterSite?: string;
};

type SeoMiddlewareOptions = {
  defaults?: SeoConfig;
  getSeo?: () => SeoConfig;
};

type SeoStoreOptions = {
  defaults?: SeoConfig;
  logger?: { info?: (scope: string, message: string, metadata?: Record<string, unknown>) => unknown };
};

const DEFAULT_SEO: SeoConfig = Object.freeze({
    titleSuffix: "",
    metaDescription: "",
    metaKeywords: "",
    htmlLang: "en",
    contentLanguage: "en",
    ogLocale: "en_US",
    ogTitle: "",
    ogDescription: "",
    ogType: "website",
    ogImage: "",
    twitterCard: "summary_large_image",
    twitterSite: "",
    index: false,
});

function robotsContent(config: SeoConfig = {}) {
  return serverString(config.robotsContent || ROBOTS_NOINDEX_CONTENT);
}

function pickSeo(body: SeoConfig = {}, defaults: SeoConfig = {}) {
  const base = { ...DEFAULT_SEO, ...defaults };
  return {
    titleSuffix: serverString(body.titleSuffix || base.titleSuffix),
    metaDescription: serverString(body.metaDescription || base.metaDescription),
    metaKeywords: serverString(body.metaKeywords || base.metaKeywords),
    htmlLang: serverString(body.htmlLang || base.htmlLang),
    contentLanguage: serverString(body.contentLanguage || base.contentLanguage),
    ogLocale: serverString(body.ogLocale || base.ogLocale),
    ogTitle: serverString(body.ogTitle || base.ogTitle),
    ogDescription: serverString(body.ogDescription || base.ogDescription),
    ogType: serverString(body.ogType || base.ogType),
    ogImage: serverString(body.ogImage || base.ogImage),
    twitterCard: serverString(body.twitterCard || base.twitterCard),
    twitterSite: serverString(body.twitterSite || base.twitterSite),
    index: false,
  };
}

function requestGetter(req: ServerRequestLike, name: string) {
  const getter = (req as ServerRequestLike& { get?: (header: string) => unknown }).get;
  return typeof getter === "function" ? serverString(getter.call(req, name)) : "";
}

function buildCanonical(req: ServerRequestLike) {
  const headers = req && req.headers && typeof req.headers === "object" ? req.headers : {};
  const xfProto = serverString(headers["x-forwarded-proto"]).split(",")[0].trim();
  const proto = xfProto || serverString((req as { protocol?: unknown }).protocol) || "https";
  const xfHost = serverString(headers["x-forwarded-host"]).split(",")[0].trim();
  let host = xfHost || requestGetter(req, "host") || serverString(headers.host);
  if ((proto === "https" && /:443$/.test(host)) || (proto === "http" && /:80$/.test(host))) {
    host = host.replace(/:(80|443)$/, "");
  }
  const path = serverString((req as { path?: unknown }).path || "/").replace(/\/+$/, "") || "/";
  return `${proto}://${host}${path}`;
}

function humanizeFromPath(path: unknown) {
  const segments = serverString(path || "/")
  .split("/")
  .filter(Boolean);
  const last = segments.pop() || "";
  if (!last) return "";
  return last
  .replace(/-/g, " ")
  .split(" ")
  .map((word) => (/^[a-z]/.test(word) ? word.charAt(0).toUpperCase() + word.slice(1) : word))
  .join(" ");
}

function getRobotsTagContent(config: SeoConfig = {}) {
  return robotsContent(config);
}

function buildSeoBase(req: ServerRequestLike, seo: SeoConfig) {
  return {
    title: humanizeFromPath((req as { path?: unknown }).path) || "",
    titleSuffix: seo.titleSuffix,
    canonicalUrl: buildCanonical(req),
    metaDescription: seo.metaDescription,
    metaKeywords: seo.metaKeywords,
    htmlLang: seo.htmlLang,
    contentLanguage: seo.contentLanguage,
    ogLocale: seo.ogLocale,
    ogTitle: seo.ogTitle,
    ogDescription: seo.ogDescription,
    ogType: seo.ogType,
    ogImage: seo.ogImage,
    twitterCard: seo.twitterCard,
    twitterSite: seo.twitterSite,
    index: false,
    robotsContent: getRobotsTagContent(seo),
    googlebotContent: getRobotsTagContent(seo),
  };
}

function applySeoHeaders(res: ServerResponseLike | null | undefined, seo: SeoConfig) {
  setResponseHeader(res, "X-Robots-Tag", getRobotsTagContent(seo));
  if (seo.contentLanguage) setResponseHeader(res, "Content-Language", serverString(seo.contentLanguage));
}

function applySeo(
  res: ServerResponseLike | null | undefined,
  overrides: SeoConfig = {},
  options: SeoMiddlewareOptions = {},
) {
  const locals = (res as { locals?: Record<string, unknown> } | null | undefined)?.locals;
  if (!locals) return;
  const current = (locals.seo && typeof locals.seo === "object" ? locals.seo : {}) as SeoConfig;
  const nextSeo = {
    ...current,
    ...overrides,
    index: false,
    robotsContent: getRobotsTagContent(options.defaults),
    googlebotContent: getRobotsTagContent(options.defaults),
  };
  locals.seo = nextSeo;
  applySeoHeaders(res, nextSeo);
}

function createSeoStore(options: SeoStoreOptions = {}) {
  let current = pickSeo({}, options.defaults || {});
  return {
    getSeo() {
      return {
        ...current,
        robotsContent: getRobotsTagContent(current),
        googlebotContent: getRobotsTagContent(current),
      };
    },
    updateSeo(body: SeoConfig = {}) {
      current = pickSeo(body, options.defaults || {});
      options.logger?.info?.("seo", "Updated global SEO settings");
      return current;
    },
  };
}

function createSeoMiddleware(options: SeoMiddlewareOptions = {}) {
  return function seoMiddleware(
    req: ServerRequestLike,
    res: ServerResponseLike,
    next: () => unknown,
  ) {
    const seo = options.getSeo ? options.getSeo() : pickSeo({}, options.defaults || {});
    const baseSeo = buildSeoBase(req, seo);
    const locals = (res as { locals?: Record<string, unknown> }).locals;
    if (locals) locals.seo = baseSeo;
    applySeoHeaders(res, baseSeo);
    return next();
  };
}

function attachSeoMiddleware(app: unknown, options: SeoMiddlewareOptions = {}) {
  if (app && typeof (app as { use?: unknown }).use === "function") {
    (app as { use: (handler: unknown) => unknown }).use(createSeoMiddleware(options));
  }
}

export {
  DEFAULT_SEO,
  ROBOTS_NOINDEX_CONTENT,
  applySeo,
  attachSeoMiddleware,
  buildCanonical,
  buildSeoBase,
  createSeoMiddleware,
  createSeoStore,
  getRobotsTagContent,
  humanizeFromPath,
  pickSeo,
};
export type { SeoConfig, SeoMiddlewareOptions, SeoStoreOptions };
