type RecentPage = {
  href: string;
  title: string;
  visitedAt: string;
};

const RECENT_PAGES_LIMIT = 6;
const MAX_HREF_LENGTH = 500;
const MAX_TITLE_LENGTH = 160;

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "").replace(/\s+/gu, " ").trim().slice(0, maxLength);
}

function recentPageHref(value: unknown) {
  const href = cleanText(value, MAX_HREF_LENGTH);
  if (!href.startsWith("/") || href.startsWith("//")) return "";
  try {
    const url = new URL(href, "http://localhost");
    return url.pathname.startsWith("/api/") ? "" : `${url.pathname}${url.search}`;
  } catch {
    return "";
  }
}

function normalizeRecentPage(value: unknown): RecentPage | null {
  const item = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const href = recentPageHref(item.href);
  const title = cleanText(item.title, MAX_TITLE_LENGTH);
  const visitedAt = cleanText(item.visitedAt, 40);
  if (!href || !title || !Number.isFinite(Date.parse(visitedAt))) return null;
  return { href, title, visitedAt };
}

function normalizeRecentPages(value: unknown, limit = RECENT_PAGES_LIMIT): RecentPage[] {
  const pages = (Array.isArray(value) ? value : []).map(normalizeRecentPage).filter((page): page is RecentPage => page !== null);
  return pages.sort((a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt)).slice(0, Math.max(1, limit));
}

function withRecentVisit(pages: RecentPage[], visit: RecentPage, limit = RECENT_PAGES_LIMIT): RecentPage[] {
  return [visit, ...pages.filter((page) => page.href !== visit.href)].slice(0, Math.max(1, limit));
}

export { RECENT_PAGES_LIMIT, normalizeRecentPage, normalizeRecentPages, recentPageHref, withRecentVisit };
export type { RecentPage };
