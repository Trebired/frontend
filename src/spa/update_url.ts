import { frontendEventName } from "#5vbaqj4pirp3";
import { notePathChange } from "./navigate.js";

type UrlQueryPatch = { query: Record<string, string|null|undefined> };
type UpdateUrlOptions = { replace?: boolean };

const IN_PAGE_KEY = "tbfInPage";
let pageKey = "";

function currentPageKey() {
  pageKey ||= `${Date.now()}-${Math.random()}`;
  return pageKey;
}

function targetUrl(next: string | UrlQueryPatch) {
  if (typeof next === "string") return new URL(next, window.location.href);
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(next.query)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  return url;
}

function updateUrl(next: string | UrlQueryPatch, options: UpdateUrlOptions = {}) {
  if (typeof window === "undefined") return;
  const url = targetUrl(next);
  if (url.href === window.location.href) return;
  const state = { ...(history.state ?? {}), [IN_PAGE_KEY]: currentPageKey() };
  history.replaceState(state, "", window.location.href);
  if (options.replace) history.replaceState(state, "", url.href);
  else history.pushState(state, "", url.href);
  notePathChange(`${url.pathname}${url.search}`);
  document.dispatchEvent(new CustomEvent(frontendEventName("url-change")));
}

function isInPageEntry() {
  return Boolean(pageKey) && history.state?.[IN_PAGE_KEY] === pageKey;
}

if (typeof document !== "undefined") {
  document.addEventListener(frontendEventName("page-change"), () => {
      pageKey = "";
  });
}

export { isInPageEntry, updateUrl };
export type { UpdateUrlOptions, UrlQueryPatch };
