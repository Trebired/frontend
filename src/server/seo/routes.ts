import {
  sendText,
  type ServerRequestLike,
  type ServerResponseLike,
} from "#hf241ii8z71i";
import { firstSeoText } from "./text.js";
import type { SeoAlternateLink } from "./types.js";

type SeoRobotsTxtOptions = {
  allow?: readonly string[];
  disallow?: readonly string[];
  extraLines?: readonly string[];
  path?: string;
  sitemapUrl?: string | readonly string[];
  userAgent?: string;
};

type SeoSitemapUrl = {
  alternates?: readonly SeoAlternateLink[];
  changefreq?: string;
  lastmod?: string;
  loc: string;
  priority?: number;
};

type SeoSitemapUrlSource =
readonly SeoSitemapUrl[] |
((req: ServerRequestLike) =>
  readonly SeoSitemapUrl[] | Promise<readonly SeoSitemapUrl[]>);

type SeoSitemapOptions = {
  path?: string;
  urls?: SeoSitemapUrlSource;
};

type SeoRouteOptions = {
  robots?: false | SeoRobotsTxtOptions;
  sitemap?: false | SeoSitemapOptions;
};

function textArray(value: unknown) {
  if (Array.isArray(value)) return value.map(firstSeoText).filter(Boolean);
  const text = firstSeoText(value);
  return text ? [text] : [];
}

function xmlEscape(value: unknown) {
  return firstSeoText(value).replace(/[<>&'"]/gu, (char) => ({
        "\"": "&quot;",
        "&": "&amp;",
        "'": "&apos;",
        "<": "&lt;",
        ">": "&gt;",
      }[char] || char));
}

function robotsTxtContent(options: SeoRobotsTxtOptions = {}) {
  const lines = [`User-agent: ${firstSeoText(options.userAgent, "*")}`];
  for (const item of options.allow || []) lines.push(`Allow: ${item}`);
  for (const item of options.disallow || []) lines.push(`Disallow: ${item}`);
  for (const item of textArray(options.sitemapUrl)) lines.push(`Sitemap: ${item}`);
  for (const item of options.extraLines || []) lines.push(item);
  return `${lines.join("\n")}\n`;
}

function sitemapAlternateXml(item: SeoAlternateLink) {
  if (!item.href || !item.hreflang) return "";
  return [
    "<xhtml:link rel=\"alternate\"",
    ` hreflang="${xmlEscape(item.hreflang)}"`,
    ` href="${xmlEscape(item.href)}"/>`,
  ].join("");
}

function sitemapUrlXml(entry: SeoSitemapUrl) {
  const alternates = (entry.alternates || []).map(sitemapAlternateXml).join("");
  const fields = [
    `<loc>${xmlEscape(entry.loc)}</loc>`,
    entry.lastmod ? `<lastmod>${xmlEscape(entry.lastmod)}</lastmod>` : "",
    entry.changefreq ? `<changefreq>${xmlEscape(entry.changefreq)}</changefreq>` : "",
    entry.priority != null
    ? `<priority>${Number(entry.priority).toFixed(1)}</priority>`
    : "",
    alternates,
  ].filter(Boolean).join("");
  return `<url>${fields}</url>`;
}

async function sitemapXmlContent(
  req: ServerRequestLike,
  options: SeoSitemapOptions = {},
) {
  const source =
  typeof options.urls === "function" ? await options.urls(req) : options.urls || [];
  const urls = Array.from(source).map(sitemapUrlXml).join("");
  return [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"",
    " xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">",
    urls,
    "</urlset>",
  ].join("");
}

function createRobotsTxtHandler(options: SeoRobotsTxtOptions = {}) {
  return function robotsTxtHandler(
    _req: ServerRequestLike,
    res: ServerResponseLike,
  ) {
    return sendText(res, robotsTxtContent(options), "text/plain; charset=utf-8");
  };
}

function createSitemapXmlHandler(options: SeoSitemapOptions = {}) {
  return async function sitemapXmlHandler(
    req: ServerRequestLike,
    res: ServerResponseLike,
  ) {
    return sendText(
      res,
      await sitemapXmlContent(req, options),
      "application/xml; charset=utf-8",
    );
  };
}

function attachSeoRoutes(app: unknown, options: SeoRouteOptions = {}) {
  if (!(app && typeof(app as { get?: unknown }).get === "function")) return;
  const get = (app as { get: (path: string, handler: unknown) => unknown }).get
  .bind(app);
  if (options.robots !== false && options.robots) {
    get(options.robots.path || "/robots.txt", createRobotsTxtHandler(options.robots));
  }
  if (options.sitemap !== false && options.sitemap) {
    get(
      options.sitemap.path || "/sitemap.xml",
      createSitemapXmlHandler(options.sitemap),
    );
  }
}

export {
  attachSeoRoutes,
  createRobotsTxtHandler,
  createSitemapXmlHandler,
  robotsTxtContent,
  sitemapXmlContent,
};
export type {
  SeoRobotsTxtOptions,
  SeoRouteOptions,
  SeoSitemapOptions,
  SeoSitemapUrl,
};
