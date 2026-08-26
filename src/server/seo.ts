import {
  serverObject,
  serverString,
  setResponseHeader,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./http.js";
import {
  ROBOTS_NOINDEX_CONTENT,
  botRobotsContent,
  robotsContent,
} from "./seo/robots.js";
import { firstSeoText } from "./seo/text.js";
import type {
  SeoAlternateLink,
  SeoConfig,
  SeoMiddlewareOptions,
  SeoRobotsConfig,
  SeoSocialConfig,
  SeoStoreOptions,
  SeoStructuredData,
  SeoVerificationConfig,
} from "./seo/types.js";

const DEFAULT_SEO: SeoConfig = Object.freeze({
    contentLanguage: "en",
    htmlLang: "en",
    index: false,
    ogLocale: "en_US",
    ogType: "website",
    robots: { archive: false, follow: false, index: false },
    twitterCard: "summary_large_image",
});

function firstArray<T>(...values: unknown[]) {
  for (const value of values) {
    if (Array.isArray(value)) return value as T[];
    if (value != null) return [value as T];
  }
  return [] as T[];
}

function mergeRecord(...values: unknown[]) {
  return Object.assign({}, ...values.map(serverObject));
}

function booleanFallback(value: unknown, fallback: unknown) {
  return typeof value === "boolean" ? value : fallback === true;
}

function defaultRobotsForIndex(index: boolean) {
  return index
  ? { follow: true, index: true }
  : { archive: false, follow: false, index: false };
}

function resolvedSeoRobots(body: SeoConfig, base: SeoConfig, index: boolean) {
  return body.robots ??
  ("index"in body
    ? defaultRobotsForIndex(index)
    : base.robots ?? defaultRobotsForIndex(index));
}

function createBaseSeoFields(context: {
    base: SeoConfig;
    body: SeoConfig;
    description: string;
    index: boolean;
    openGraph: SeoSocialConfig;
    robots: SeoConfig["robots"];
    title: string;
    twitter: SeoSocialConfig;
}): SeoConfig {
  const { base, body, description, index, openGraph, robots, title, twitter } =
  context;
  return {
    alternates: firstArray<SeoAlternateLink>(body.alternates, base.alternates),
    applicationName: firstSeoText(body.applicationName, base.applicationName),
    bingbot: body.bingbot ?? base.bingbot,
    canonicalUrl: firstSeoText(body.canonicalUrl, base.canonicalUrl),
    colorScheme: firstSeoText(body.colorScheme, base.colorScheme),
    contentLanguage: firstSeoText(body.contentLanguage, base.contentLanguage),
    googlebot: body.googlebot ?? base.googlebot,
    htmlLang: firstSeoText(body.htmlLang, base.htmlLang),
    index,
    manifestHref: firstSeoText(body.manifestHref, base.manifestHref),
    metaDescription: description,
    metaKeywords: firstSeoText(body.metaKeywords, base.metaKeywords),
    openGraph,
    referrer: firstSeoText(body.referrer, base.referrer),
    robots,
    siteName: firstSeoText(body.siteName, base.siteName, openGraph.siteName),
    structuredData: firstArray<SeoStructuredData>(
      body.structuredData,
      body.jsonLd,
      base.structuredData,
      base.jsonLd,
    ),
    themeColor: firstSeoText(body.themeColor, base.themeColor),
    title,
    titleSuffix: firstSeoText(body.titleSuffix, base.titleSuffix),
    twitter,
    verification: mergeRecord(base.verification, body.verification) as SeoVerificationConfig,
  };
}

function applyOpenGraphSeo(
  next: SeoConfig,
  body: SeoConfig,
  base: SeoConfig,
  openGraph: SeoSocialConfig,
) {
  next.ogTitle = firstSeoText(body.ogTitle, openGraph.title, base.ogTitle, next.title);
  next.ogDescription = firstSeoText(
    body.ogDescription,
    openGraph.description,
    next.metaDescription,
    base.ogDescription,
  );
  next.ogType = firstSeoText(body.ogType, openGraph.type, base.ogType, "website");
  next.ogImage = firstSeoText(body.ogImage, openGraphImage(openGraph.image), base.ogImage);
  next.ogUrl = firstSeoText(body.ogUrl, openGraph.url, base.ogUrl, next.canonicalUrl);
  next.ogLocale = firstSeoText(body.ogLocale, openGraph.locale, base.ogLocale);
  next.ogSiteName = firstSeoText(
    body.ogSiteName,
    openGraph.siteName,
    base.ogSiteName,
    next.siteName,
  );
}

function applyTwitterSeo(
  next: SeoConfig,
  body: SeoConfig,
  base: SeoConfig,
  twitter: SeoSocialConfig,
) {
  next.twitterCard = firstSeoText(body.twitterCard, twitter.card, base.twitterCard);
  next.twitterTitle = firstSeoText(
    body.twitterTitle,
    twitter.title,
    base.twitterTitle,
    next.ogTitle,
  );
  next.twitterDescription = firstSeoText(
    body.twitterDescription,
    twitter.description,
    base.twitterDescription,
    next.ogDescription,
  );
  next.twitterImage = firstSeoText(
    body.twitterImage,
    openGraphImage(twitter.image),
    base.twitterImage,
    next.ogImage,
  );
  next.twitterSite = firstSeoText(body.twitterSite, twitter.site, base.twitterSite);
  next.twitterCreator = firstSeoText(
    body.twitterCreator,
    twitter.creator,
    base.twitterCreator,
  );
}

function applyBotSeo(next: SeoConfig) {
  next.robotsContent = robotsContent(next);
  next.googlebotContent = botRobotsContent(next, "googlebot");
  next.bingbotContent = botRobotsContent(next, "bingbot");
}

function pickSeo(body: SeoConfig = {}, defaults: SeoConfig = {}) {
  const base = { ...DEFAULT_SEO, ...defaults };
  const index = booleanFallback(body.index, base.index);
  const openGraph = mergeRecord(base.openGraph, body.openGraph) as SeoSocialConfig;
  const twitter = mergeRecord(base.twitter, body.twitter) as SeoSocialConfig;
  const next = createBaseSeoFields({
      base,
      body,
      description: firstSeoText(body.metaDescription, base.metaDescription),
      index,
      openGraph,
      robots: resolvedSeoRobots(body, base, index),
      title: firstSeoText(body.title, base.title),
      twitter,
  });
  applyOpenGraphSeo(next, body, base, openGraph);
  applyTwitterSeo(next, body, base, twitter);
  applyBotSeo(next);
  return next;
}

function openGraphImage(input: unknown) {
  const first = Array.isArray(input) ? input[0] : input;
  return typeof first === "string" ? first : firstSeoText((serverObject(first) as any).url);
}

function requestGetter(req: ServerRequestLike, name: string) {
  const getter = (req as ServerRequestLike& { get?: (header: string) => unknown }).get;
  return typeof getter === "function" ? serverString(getter.call(req, name)) : "";
}

function buildCanonical(req: ServerRequestLike) {
  const headers = serverObject(req && req.headers);
  const proto = firstSeoText(serverString(headers["x-forwarded-proto"]).split(",")[0], (req as any)?.protocol, "https");
  let host = firstSeoText(
    serverString(headers["x-forwarded-host"]).split(",")[0],
    requestGetter(req, "host"),
    headers.host,
  );
  if (
    (proto === "https" && /:443$/u.test(host)) ||
      (proto === "http" && /:80$/u.test(host))
  ) {
    host = host.replace(/:(80|443)$/u, "");
  }
  const path = firstSeoText((req as any)?.path, "/").replace(/\/+$/u, "") || "/";
  return host ? `${proto}://${host}${path}` : path;
}

function humanizeFromPath(
  path: unknown,
  options: { capitalize?: boolean } = {},
) {
  const last = firstSeoText(path, "/").split("/").filter(Boolean).pop() || "";
  const spaced = last.replace(/[-_]+/gu, " ");
  if (options.capitalize === false) return spaced;
  return spaced.replace(
    /(^|\s)([a-z])/gu,
    (_match, prefix: string, char: string) => `${prefix}${char.toUpperCase()}`,
  );
}

function getRobotsTagContent(config: SeoConfig = {}) {
  return robotsContent(pickSeo(config));
}

function buildSeoBase(req: ServerRequestLike, seo: SeoConfig) {
  const title = firstSeoText(seo.title, humanizeFromPath((req as any)?.path));
  return pickSeo({ ...seo, canonicalUrl: firstSeoText(seo.canonicalUrl, buildCanonical(req)), title }, seo);
}

function applySeoHeaders(res: ServerResponseLike | null | undefined, seo: SeoConfig) {
  const normalized = pickSeo(seo);
  if (normalized.robotsContent) setResponseHeader(res, "X-Robots-Tag", normalized.robotsContent);
  if (normalized.contentLanguage) setResponseHeader(res, "Content-Language", normalized.contentLanguage);
}

function applySeo(
  res: ServerResponseLike | null | undefined,
  overrides: SeoConfig = {},
  options: SeoMiddlewareOptions = {},
) {
  const locals = (res as { locals?: Record<string, unknown> } | null | undefined)?.locals;
  if (!locals) return;
  const current = serverObject(locals.seo) as SeoConfig;
  const nextSeo = pickSeo(overrides, pickSeo(current, options.defaults || {}));
  locals.seo = nextSeo;
  applySeoHeaders(res, nextSeo);
}

function createSeoStore(options: SeoStoreOptions = {}) {
  let current = pickSeo({}, options.defaults || {});
  return {
    getSeo() {
      return pickSeo(current);
    },
    updateSeo(body: SeoConfig = {}) {
      current = pickSeo(body, options.defaults || {});
      options.logger?.info?.("seo", "Updated global SEO settings");
      return current;
    },
  };
}

function createSeoMiddleware(options: SeoMiddlewareOptions = {}) {
  return function seoMiddleware(req: ServerRequestLike, res: ServerResponseLike, next: () => unknown) {
    const seo = options.getSeo ? options.getSeo() : pickSeo({}, options.defaults || {});
    const baseSeo = buildSeoBase(req, seo);
    const locals = (res as { locals?: Record<string, unknown> }).locals;
    if (locals) locals.seo = baseSeo;
    applySeoHeaders(res, baseSeo);
    return next();
  };
}

function attachSeoMiddleware(app: unknown, options: SeoMiddlewareOptions = {}) {
  if (app && typeof(app as { use?: unknown }).use === "function") {
    (app as { use: (handler: unknown) => unknown }).use(createSeoMiddleware(options));
  }
}

function createProductSeoDefaults(product: Record<string, unknown> = {}, options: SeoConfig = {}) {
  const name = firstSeoText(product.name, options.siteName, "Product");
  return pickSeo({
      ...options,
      applicationName: firstSeoText(options.applicationName, name),
      ogSiteName: firstSeoText(options.ogSiteName, options.siteName, name),
      siteName: firstSeoText(options.siteName, name),
      titleSuffix: options.titleSuffix === "" ? "" : firstSeoText(options.titleSuffix, ` | ${name}`),
  });
}

export {
  DEFAULT_SEO,
  ROBOTS_NOINDEX_CONTENT,
  applySeo,
  applySeoHeaders,
  attachSeoMiddleware,
  buildCanonical,
  buildSeoBase,
  createProductSeoDefaults,
  createSeoMiddleware,
  createSeoStore,
  getRobotsTagContent,
  humanizeFromPath,
  pickSeo,
  robotsContent,
};
export type {
  SeoAlternateLink,
  SeoConfig,
  SeoMiddlewareOptions,
  SeoRobotsConfig,
  SeoSocialConfig,
  SeoStoreOptions,
  SeoStructuredData,
  SeoVerificationConfig,
};
