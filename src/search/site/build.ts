import { frontendClassName } from "#5vbaqj4pirp3";
import { extractPage, type SiteSearchSection } from "./extract.js";

type SiteSearchPage = { description?: string; path: string; sections: SiteSearchSection[]; text: string; title: string };

type SiteSearchIndex = { pages: SiteSearchPage[]; version: 1 };

type SiteSearchMeta = { description?: string; title?: string };

type SiteSearchIndexOptions = {
  locales: readonly string[];
  meta: (path: string, locale: string) => SiteSearchMeta;
  paths: readonly string[];
  render: (path: string, locale: string) => string;
};

type SiteSearchFile = { contents: string; locale: string; path: string };

const SITE_SEARCH_DIR = frontendClassName("search");

function siteSearchPath(locale: string): string {
  return `${SITE_SEARCH_DIR}/${locale}.json`;
}

function pageOf(path: string, locale: string, options: SiteSearchIndexOptions): SiteSearchPage | null {
  const html = options.render(path, locale);
  if (!html) return null;
  const { sections, text } = extractPage(html);
  const meta = options.meta(path, locale);
  const title = String(meta.title || sections[0]?.title || path).trim();
  if (!text && !title) return null;
  const description = String(meta.description || "").trim();
  return { ...(description ? { description } : {}), path, sections, text, title };
}

function createSiteSearchIndex(options: SiteSearchIndexOptions): SiteSearchFile[] {
  return options.locales.map((locale) => {
      const pages = options.paths.map((path) => pageOf(path, locale, options)).filter((page): page is SiteSearchPage => page !== null);
      const index: SiteSearchIndex = { pages, version: 1 };
      return { contents: JSON.stringify(index), locale, path: siteSearchPath(locale) };
  });
}

export { createSiteSearchIndex, SITE_SEARCH_DIR, siteSearchPath };
export type { SiteSearchFile, SiteSearchIndex, SiteSearchIndexOptions, SiteSearchMeta, SiteSearchPage };
