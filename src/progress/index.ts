import { FRONTEND_PREFIX, frontendClassName, frontendDataAttr, frontendElementClass } from "#5vbaqj4pirp3";

const PROGRESS_ID = `${FRONTEND_PREFIX}_progress`;
const MAX_UPLOAD_PROGRESS = 0.95;

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

let activeRequests = 0;

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
    window.setTimeout(() => {
        const root = ensureProgressElement();
        if (root && activeRequests === 0) {
          root.removeAttribute(frontendDataAttr("progress-active"));
          const nextBar = progressBar();
          if (nextBar) nextBar.style.transform = "scaleX(0)";
        }
      }, 160);
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

function bindProgress() {
  ensureProgressElement();
  return progress;
}

function bootPageLoadProgress(options: PageLoadProgressOptions = {}) {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return false;
  }
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
    if (!document.body || !document.documentElement) return;
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
  bindProgress,
  bootPageLoadProgress,
  endProgress,
  progress,
  setProgress,
  setProgressFromEvent,
};
export type { PageLoadProgressOptions, ProgressHandle };
export *from "./bars.js";
