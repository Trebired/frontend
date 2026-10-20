import { preparePages, type PreparedPage } from "./query.js";
import { siteSearchPath, type SiteSearchIndex } from "./build.js";

const loaded = new Map<string, Promise<PreparedPage[]>>();

async function fetchIndex(locale: string): Promise<PreparedPage[]> {
  const response = await fetch(`/${siteSearchPath(locale)}`);
  if (!response.ok) throw new Error(`site search index ${locale} :: ${response.status}`);
  const index = (await response.json()) as SiteSearchIndex;
  if (!Array.isArray(index?.pages)) throw new Error(`site search index ${locale} :: no pages`);
  return preparePages(index.pages);
}

function loadSiteSearch(locale: string): Promise<PreparedPage[]> {
  const cached = loaded.get(locale);
  if (cached) return cached;
  const pending = fetchIndex(locale).catch ((error: unknown) => {
      loaded.delete(locale);
      throw error;
  });
  loaded.set(locale, pending);
  return pending;
}

export { loadSiteSearch };
