type InfiniteObserverConfig = {
  recheckAfterLoad?: boolean;
  recheckOnInit?: boolean;
  rootMargin?: string;
};

type InfiniteObserverState = {
  busy: boolean;
  config: Required<InfiniteObserverConfig>;
  destroyed: boolean;
  handleVisibilityChange?: () => void;
  mutationObserver: MutationObserver | null;
  observer: IntersectionObserver | null;
  onReachEnd: () => Promise<unknown>|unknown;
  resizeObserver: ResizeObserver | null;
  root: Element | null;
  scrollTarget: EventTarget | null;
  sentinel: HTMLElement;
};

function normalizeInfiniteObserverConfig(
  options: InfiniteObserverConfig | null | undefined,
): Required<InfiniteObserverConfig> {
  const config = options && typeof options === "object" ? options : {};
  return {
    recheckAfterLoad: config.recheckAfterLoad !== false,
    recheckOnInit: config.recheckOnInit !== false,
    rootMargin:
    typeof config.rootMargin === "string" && config.rootMargin.trim()
    ? config.rootMargin.trim()
    : "160px 0px",
  };
}

function infiniteRootMarginPixels(state: InfiniteObserverState) {
  const first = state.config.rootMargin.trim().split(/\s+/u)[0] || "0px";
  const parsed = Number.parseFloat(first);
  return Number.isFinite(parsed) ? parsed : 0;
}

function infiniteRootRect(state: InfiniteObserverState) {
  if (state.root && typeof state.root.getBoundingClientRect === "function") {
    return state.root.getBoundingClientRect();
  }
  return {
    bottom: window.innerHeight || document.documentElement.clientHeight || 0,
    top: 0,
  };
}

function isInfiniteSentinelVisible(state: InfiniteObserverState) {
  if (state.sentinel.hidden === true) return false;
  const sentinelRect = state.sentinel.getBoundingClientRect();
  const margin = infiniteRootMarginPixels(state);
  const rootRect = infiniteRootRect(state);
  return (
    sentinelRect.bottom >= rootRect.top - margin &&
      sentinelRect.top <= rootRect.bottom + margin
  );
}

function scheduleInfiniteVisibilityCheck(state: InfiniteObserverState) {
  window.requestAnimationFrame(() => {
      if (state.destroyed || state.busy) return;
      if (isInfiniteSentinelVisible(state)) void triggerInfiniteLoad(state);
  });
}

async function triggerInfiniteLoad(state: InfiniteObserverState) {
  if (state.destroyed || state.busy) return;
  state.busy = true;
  try {
    await state.onReachEnd();
  } finally {
    state.busy = false;
    if (state.config.recheckAfterLoad) scheduleInfiniteVisibilityCheck(state);
  }
}

function bindInfiniteScrollEvents(state: InfiniteObserverState) {
  const handler = () => scheduleInfiniteVisibilityCheck(state);
  state.handleVisibilityChange = handler;
  state.scrollTarget?.addEventListener("scroll", handler, { passive: true });
  window.addEventListener("resize", handler);
  window.addEventListener("orientationchange", handler);
}

function bindInfiniteMutationObserver(state: InfiniteObserverState) {
  if (typeof MutationObserver !== "function") return;
  state.mutationObserver = new MutationObserver(() => {
      scheduleInfiniteVisibilityCheck(state);
  });
  state.mutationObserver.observe(state.sentinel, {
      attributeFilter: ["hidden", "style"],
      attributes: true,
  });
  if (state.root && state.root !== state.sentinel) {
    state.mutationObserver.observe(state.root, {
        attributeFilter: ["hidden", "style"],
        attributes: true,
    });
  }
}

function bindInfiniteResizeObserver(state: InfiniteObserverState) {
  if (typeof ResizeObserver !== "function") return;
  state.resizeObserver = new ResizeObserver(() => {
      scheduleInfiniteVisibilityCheck(state);
  });
  if (state.root) state.resizeObserver.observe(state.root);
  state.resizeObserver.observe(state.sentinel);
}

function disconnectInfiniteObserver(state: InfiniteObserverState) {
  state.destroyed = true;
  if (state.handleVisibilityChange) {
    state.scrollTarget?.removeEventListener("scroll", state.handleVisibilityChange);
    window.removeEventListener("resize", state.handleVisibilityChange);
    window.removeEventListener("orientationchange", state.handleVisibilityChange);
  }
  state.mutationObserver?.disconnect();
  state.resizeObserver?.disconnect();
  state.observer?.disconnect();
}

function createInfiniteObserver(
  root: Element | null,
  sentinel: HTMLElement | null,
  onReachEnd: (() => Promise<unknown>|unknown) | null,
  options: InfiniteObserverConfig | null = null,
) {
  if (!sentinel || typeof IntersectionObserver !== "function" || !onReachEnd) {
    return null;
  }
  const state: InfiniteObserverState = {
    busy: false,
    config: normalizeInfiniteObserverConfig(options),
    destroyed: false,
    mutationObserver: null,
    observer: null,
    onReachEnd,
    resizeObserver: null,
    root,
    scrollTarget: root || window,
    sentinel,
  };
  state.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
          if (entry.isIntersecting) void triggerInfiniteLoad(state);
      });
    }, { root, rootMargin: state.config.rootMargin });
  bindInfiniteScrollEvents(state);
  bindInfiniteMutationObserver(state);
  bindInfiniteResizeObserver(state);
  state.observer.observe(sentinel);
  if (state.config.recheckOnInit) scheduleInfiniteVisibilityCheck(state);
  return {
    disconnect() {
      disconnectInfiniteObserver(state);
    },
    observer: state.observer,
    recheck() {
      scheduleInfiniteVisibilityCheck(state);
    },
  };
}

export { createInfiniteObserver };
export type { InfiniteObserverConfig };
