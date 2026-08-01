const PROGRESS_ID = "tbf_progress";
const MAX_UPLOAD_PROGRESS = 0.95;

type ProgressHandle = {
  begin: () => number;
  boot: () => HTMLElement | null;
  end: (force?: boolean) => number;
  set: (value: number) => number;
  setFromProgressEvent: (event: ProgressEvent) => number;
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
  root.className = "tbf-progress";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = '<span class="tbf-progress__bar"></span>';
  document.body.appendChild(root);
  return root;
}

function progressBar() {
  return ensureProgressElement()?.querySelector<HTMLElement>(".tbf-progress__bar") || null;
}

function setProgress(value: number) {
  const numeric = Number(value);
  const next = Number.isFinite(numeric)
    ? Math.max(0, Math.min(MAX_UPLOAD_PROGRESS, numeric))
    : 0;
  const root = ensureProgressElement();
  const bar = progressBar();
  if (root) root.setAttribute("data-tbf-progress-active", "true");
  if (bar) bar.style.transform = `scaleX(${next})`;
  return next;
}

function beginProgress() {
  activeRequests += 1;
  if (activeRequests === 1) {
    setProgress(0.12);
    const root = ensureProgressElement();
    if (root) root.setAttribute("data-tbf-progress-active", "true");
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
        root.removeAttribute("data-tbf-progress-active");
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
  endProgress,
  progress,
  setProgress,
  setProgressFromEvent,
};
export type { ProgressHandle };
