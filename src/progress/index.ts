import { FRONTEND_PREFIX, frontendClassName, frontendDataAttr, frontendElementClass } from "#5vbaqj4pirp3";

const PROGRESS_ID = `${FRONTEND_PREFIX}_progress`;
const MAX_UPLOAD_PROGRESS = 0.95;
const FETCH_PROGRESS_WRAPPED = "__tbfProgressWrapped";

type ProgressHandle = {
  begin: () => number;
  boot: () => HTMLElement | null;
  end: (force?: boolean) => number;
  set: (value: number) => number;
  setFromProgressEvent: (event: ProgressEvent) => number;
};
type PageLoadProgressOptions = {
  minVisibleMs?: number;
};
type ProgressFetchInit = RequestInit& {
  progress?: boolean;
  tbfProgress?: boolean;
};
type WrappedFetch = typeof fetch& {
  [FETCH_PROGRESS_WRAPPED]?: true;
};

let activeRequests = 0;
let pageLoadProgressBooted = false;
let installedFetch: WrappedFetch | null = null;

function canRenderProgress() {
  return typeof document !== "undefined" && Boolean(document.body);
}

function ensureProgressElement() {
  if (!canRenderProgress()) return null;
  const existing = document.getElementById(PROGRESS_ID);
  if (existing instanceof HTMLElement) return existing;
  const root = document.createElement("div");
  root.id = PROGRESS_ID;
  root.className = frontendClassName("progress");
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `<span class="${frontendElementClass("progress", "bar")}"></span>`;
  document.body.appendChild(root);
  return root;
}

function progressBar() {
  return ensureProgressElement()?.querySelector<HTMLElement>(`.${frontendElementClass("progress", "bar")}`) || null;
}

function setProgress(value: number) {
  const numeric = Number(value);
  const next = Number.isFinite(numeric)
  ? Math.max(0, Math.min(MAX_UPLOAD_PROGRESS, numeric))
  : 0;
  const root = ensureProgressElement();
  const bar = progressBar();
  if (root) root.setAttribute(frontendDataAttr("progress-active"), "true");
  if (bar) bar.style.transform = `scaleX(${next})`;
  return next;
}

function beginProgress() {
  activeRequests += 1;
  if (activeRequests === 1) {
    setProgress(0.12);
    const root = ensureProgressElement();
    if (root) root.setAttribute(frontendDataAttr("progress-active"), "true");
  }
  return activeRequests;
}

function endProgress(force = false) {
  if (force) activeRequests = 0;
  else activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    const bar = progressBar();
    if (bar) bar.style.transform = "scaleX(1)";
    const schedule =
    typeof window !== "undefined" && typeof window.setTimeout === "function"
    ? window.setTimeout.bind(window)
    : typeof setTimeout === "function"
    ? setTimeout
    : null;
    const finish = () => {
      const root = ensureProgressElement();
      if (root && activeRequests === 0) {
        root.removeAttribute(frontendDataAttr("progress-active"));
        const nextBar = progressBar();
        if (nextBar) nextBar.style.transform = "scaleX(0)";
      }
    };
    if (schedule) schedule(finish, 160);
    else finish();
  }
  return activeRequests;
}

function setProgressFromEvent(event: ProgressEvent) {
  if (!event || event.lengthComputable !== true) return 0;
  const total = Number(event.total);
  const loaded = Number(event.loaded);
  if (!(total > 0) || loaded < 0) return 0;
  return setProgress(loaded / total);
}

function bootPageLoadProgress(options: PageLoadProgressOptions = {}) {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return false;
  }
  if (pageLoadProgressBooted) return false;
  pageLoadProgressBooted = true;
  const minVisibleMs = Math.max(0, Number(options.minVisibleMs) || 0);
  let startedAtMs = 0;
  let started = false;
  let settled = false;

  function finishPageLoadProgress() {
    if (!started || settled) return;
    settled = true;
    const elapsedMs = Math.max(0, Date.now() - startedAtMs);
    const delayMs = Math.max(0, minVisibleMs - elapsedMs);
    window.setTimeout(() => {
        progress.end();
      }, delayMs);
  }

  function startPageLoadProgress() {
    if (started) return;
    if (!document.body || !document.documentElement) {
      window.addEventListener("load", startPageLoadProgress, { once: true });
      return;
    }
    started = true;
    startedAtMs = Date.now();
    progress.begin();
    if (document.readyState === "complete") {
      window.setTimeout(finishPageLoadProgress, 0);
      return;
    }
    window.addEventListener("load", finishPageLoadProgress, { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startPageLoadProgress, {
        once: true,
    });
  } else {
    startPageLoadProgress();
  }
  return true;
}

function progressFetchOption(init: RequestInit | undefined) {
  if (!init || typeof init !== "object") return true;
  const options = init as ProgressFetchInit;
  return options.progress !== false && options.tbfProgress !== false;
}

function stripProgressFetchOptions(init: RequestInit | undefined) {
  if (!init || typeof init !== "object") return init;
  const options = init as ProgressFetchInit;
  if (!("progress"in options) && !("tbfProgress"in options)) return init;
  const { progress: _progress, tbfProgress: _tbfProgress, ...nativeInit } = options;
  return nativeInit;
}

function bindFetchProgress() {
  if (typeof globalThis.fetch !== "function") return false;
  const currentFetch = globalThis.fetch as WrappedFetch;
  if (currentFetch[FETCH_PROGRESS_WRAPPED]) {
    installedFetch = currentFetch;
    return false;
  }
  if (installedFetch && globalThis.fetch === installedFetch) return false;
  const originalFetch = currentFetch.bind(globalThis);
  const wrappedFetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const nativeInit = stripProgressFetchOptions(init);
      if (!progressFetchOption(init)) return originalFetch(input, nativeInit);
      progress.begin();
      try {
        return Promise.resolve(originalFetch(input, nativeInit)).finally(() => {
            progress.end();
        });
      } catch (error) {
        progress.end();
        throw error;
      }
  }) as WrappedFetch;
  Object.defineProperty(wrappedFetch, FETCH_PROGRESS_WRAPPED, {
      value: true,
  });
  globalThis.fetch = wrappedFetch;
  if (typeof window !== "undefined") window.fetch = wrappedFetch;
  installedFetch = wrappedFetch;
  return true;
}

function bindProgress() {
  ensureProgressElement();
  bindFetchProgress();
  bootPageLoadProgress();
  return progress;
}

const progress: ProgressHandle = Object.freeze({
    begin: beginProgress,
    boot: ensureProgressElement,
    end: endProgress,
    set: setProgress,
    setFromProgressEvent: setProgressFromEvent,
});

export {
  MAX_UPLOAD_PROGRESS,
  PROGRESS_ID,
  beginProgress,
  bindFetchProgress,
  bindProgress,
  bootPageLoadProgress,
  endProgress,
  progress,
  setProgress,
  setProgressFromEvent,
  stripProgressFetchOptions,
};
export type { PageLoadProgressOptions, ProgressFetchInit, ProgressHandle };
export *from "./bars.js";
