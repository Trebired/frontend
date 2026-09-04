import { frontendEventName } from "#5vbaqj4pirp3";

type SpaHistoryMode = "none" | "push" | "replace";

type SpaPage = {
  navigationId: number;
  pageId: string;
  url: string;
};

type SpaNavigation = SpaPage& {
  from: SpaPage;
  historyMode: SpaHistoryMode;
};

const PAGE_CHANGE_EVENT = frontendEventName("page-change");

let activePage = initialPage();

function resolveUrl(url: string): string {
  const base = typeof window === "undefined" ? "about:blank" : window.location.href;
  try {
    return new URL(url || base, base).href;
  } catch {
    return String(url || base);
  }
}

function pageIdFromUrl(url: string): string {
  try {
    const parsed = new URL(url, typeof window === "undefined" ? "about:blank" : window.location.href);
    return `${parsed.pathname}${parsed.search}` || "/";
  } catch {
    return String(url || "/");
  }
}

function pageFromUrl(url: string, navigationId: number): SpaPage {
  const href = resolveUrl(url);
  return { navigationId, pageId: pageIdFromUrl(href), url: href };
}

function initialPage(): SpaPage {
  return pageFromUrl(
    typeof window === "undefined" ? "about:blank" : window.location.href,
    0,
  );
}

function currentPage(): SpaPage {
  return { ...activePage };
}

function beginNavigation(url: string, historyMode: SpaHistoryMode): SpaNavigation {
  const from = currentPage();
  const next = pageFromUrl(url, from.navigationId + 1);
  activePage = next;
  return { ...next, from, historyMode };
}

function retargetNavigation(navigation: SpaNavigation, url: string): SpaNavigation {
  const next = pageFromUrl(url, navigation.navigationId);
  activePage = next;
  return { ...next, from: navigation.from, historyMode: navigation.historyMode };
}

function isCurrentPage(navigationId: number): boolean {
  return activePage.navigationId === navigationId;
}

function emitPageChange(navigation: SpaNavigation) {
  activePage = {
    navigationId: navigation.navigationId,
    pageId: navigation.pageId,
    url: navigation.url,
  };
  if (typeof document === "undefined") return;
  document.dispatchEvent(
    new CustomEvent(PAGE_CHANGE_EVENT, { detail: currentPage() }),
  );
}

function onPageChange(handler: (page: SpaPage) => void): () => void {
  if (typeof document === "undefined") return () => {};
  const listener = (event: Event) => {
    handler((event as CustomEvent<SpaPage>).detail);
  };
  document.addEventListener(PAGE_CHANGE_EVENT, listener);
  return () => document.removeEventListener(PAGE_CHANGE_EVENT, listener);
}

export {
  PAGE_CHANGE_EVENT,
  beginNavigation,
  currentPage,
  emitPageChange,
  isCurrentPage,
  onPageChange,
  pageIdFromUrl,
  retargetNavigation,
};
export type { SpaHistoryMode, SpaNavigation, SpaPage };
