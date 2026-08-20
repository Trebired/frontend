import { frontendEventName } from "#5vbaqj4pirp3";

type LiveHistoryMode = "none" | "push" | "replace";
type LivePageState = {
  navigationId: number;
  pageId: string;
  url: string;
};
type LiveNavigationDetail = LivePageState& {
  from: LivePageState;
  historyMode: LiveHistoryMode;
};
type LivePageDisposeDetail = LiveNavigationDetail& {
  nextPageId: string;
  nextUrl: string;
  preserveState: boolean;
  root: HTMLElement | null;
};
type LiveContentUpdatedDetail = LiveNavigationDetail& {
  root: HTMLElement | null;
};

let activeLivePage = initialLivePageState();

function currentLivePage(): LivePageState {
  return cloneLivePageState(activeLivePage);
}

function isCurrentLivePage(navigationId: number): boolean {
  return activeLivePage.navigationId === navigationId;
}

function onLivePageDispose(
  handler: (detail: LivePageDisposeDetail) => void,
): () => void {
  if (typeof document === "undefined") return () => {};
  const listener = (event: Event) => {
    handler((event as CustomEvent<LivePageDisposeDetail>).detail);
  };
  document.addEventListener(frontendEventName("live-page-dispose"), listener);
  return () =>
  document.removeEventListener(frontendEventName("live-page-dispose"), listener);
}

function beginLiveNavigation(
  url: string,
  historyMode: LiveHistoryMode,
): LiveNavigationDetail {
  const from = currentLivePage();
  const next = livePageStateFromUrl(url, from.navigationId + 1);
  activeLivePage = next;
  const detail = { ...next, from, historyMode };
  dispatchLiveEvent("live-navigation-start", detail);
  return detail;
}

function retargetLiveNavigation(
  detail: LiveNavigationDetail,
  url: string,
): LiveNavigationDetail {
  const next = livePageStateFromUrl(url, detail.navigationId);
  activeLivePage = next;
  return { ...next, from: detail.from, historyMode: detail.historyMode };
}

function dispatchLivePageDispose(
  detail: LiveNavigationDetail,
  root: HTMLElement | null,
  preserveState: boolean,
): void {
  dispatchLiveEvent("live-page-dispose", {
      ...detail,
      nextPageId: detail.pageId,
      nextUrl: detail.url,
      preserveState,
      root,
  });
}

function dispatchLiveContentUpdated(
  detail: LiveNavigationDetail,
  root: HTMLElement | null,
): void {
  dispatchLiveEvent("live-content-updated", { ...detail, root });
}

function dispatchLiveNavigation(detail: LiveNavigationDetail): void {
  activeLivePage = {
    navigationId: detail.navigationId,
    pageId: detail.pageId,
    url: detail.url,
  };
  dispatchLiveEvent("live-navigation", detail);
}

function livePageStateFromUrl(
  url: string,
  navigationId: number,
): LivePageState {
  const resolved = resolveLiveUrl(url);
  return {
    navigationId,
    pageId: livePageIdFromUrl(resolved),
    url: resolved,
  };
}

function initialLivePageState(): LivePageState {
  return livePageStateFromUrl(
    typeof window === "undefined" ? "about:blank" : window.location.href,
    0,
  );
}

function resolveLiveUrl(url: string): string {
  const base = typeof window === "undefined" ? "about:blank" : window.location.href;
  try {
    return new URL(url || base, base).href;
  } catch {
    return String(url || base);
  }
}

function livePageIdFromUrl(url: string): string {
  try {
    const parsed = new URL(url, typeof window === "undefined" ? "about:blank" : window.location.href);
    return `${parsed.pathname}${parsed.search}` || "/";
  } catch {
    return String(url || "/");
  }
}

function cloneLivePageState(state: LivePageState): LivePageState {
  return {
    navigationId: state.navigationId,
    pageId: state.pageId,
    url: state.url,
  };
}

function dispatchLiveEvent(type: string, detail: unknown): void {
  if (typeof document === "undefined") return;
  document.dispatchEvent(
    new CustomEvent(frontendEventName(type), { detail }),
  );
}

export {
  beginLiveNavigation,
  currentLivePage,
  dispatchLiveContentUpdated,
  dispatchLiveNavigation,
  dispatchLivePageDispose,
  isCurrentLivePage,
  livePageIdFromUrl,
  onLivePageDispose,
  retargetLiveNavigation,
};
export type {
  LiveContentUpdatedDetail,
  LiveHistoryMode,
  LiveNavigationDetail,
  LivePageDisposeDetail,
  LivePageState,
};
