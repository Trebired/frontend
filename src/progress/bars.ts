import { asElement } from "#er0dlx1gtbzh";

type ProgressSetOptions = {
  label?: string;
  meta?: string;
  showBytes?: boolean;
};

type ProgressBarState = {
  fill: HTMLElement;
  mount: HTMLElement;
  root: HTMLElement;
};

const instances = new WeakMap<Element, ProgressBarState>();

function clampPercent(percent: unknown) {
  const numeric = Number(percent);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
}

function formatPercent(percent: unknown) {
  return `${Math.round(clampPercent(percent))}%`;
}

function formatBytes(value: unknown) {
  const bytes = Math.max(0, Number(value) || 0);
  const units = ["B", "KB", "MB", "GB"];
  let next = bytes;
  let unit = 0;
  while (next >= 1024 && unit < units.length - 1) {
    next /= 1024;
    unit += 1;
  }
  const precision = unit === 0 ? 0 : next >= 10 ? 1 : 2;
  return `${next.toFixed(precision).replace(/\.0+$/u, "")} ${units[unit]}`;
}

function percentFromBytes(loaded: unknown, total: unknown) {
  const nextTotal = Number(total) || 0;
  const nextLoaded = Number(loaded) || 0;
  if (!(nextTotal > 0)) return 0;
  return clampPercent((Math.max(0, nextLoaded) / nextTotal) * 100);
}

function bytesLabel(loaded: unknown, total: unknown) {
  const nextTotal = Number(total) || 0;
  const nextLoaded = Math.max(0, Number(loaded) || 0);
  if (!(nextTotal > 0)) return "";
  return `${formatBytes(Math.min(nextLoaded, nextTotal))} / ${formatBytes(nextTotal)}`;
}

function findProgressRoot(root: unknown) {
  const el = asElement(root);
  if (!el) return null;
  if (el.matches("[data-progress]")) return el as HTMLElement;
  if (el.matches("[data-progress-mount]")) {
    return el.closest<HTMLElement>("[data-progress]") || el as HTMLElement;
  }
  return el.querySelector<HTMLElement>("[data-progress]");
}

function findMount(root: unknown) {
  const el = asElement(root);
  if (!el) return null;
  if (el.matches("[data-progress-mount]")) return el as HTMLElement;
  const progressRoot = findProgressRoot(el) || el;
  let mount = progressRoot.querySelector<HTMLElement>("[data-progress-mount]");
  if (!mount) {
    mount = document.createElement("div");
    mount.setAttribute("data-progress-mount", "");
    progressRoot.appendChild(mount);
  }
  return mount;
}

function findSlot(root: unknown, selector: string) {
  const el = asElement(root);
  if (!el) return null;
  const own = el.querySelector<HTMLElement>(selector);
  if (own) return own;
  const progressRoot = findProgressRoot(el);
  const progressSlot = progressRoot?.querySelector<HTMLElement>(selector);
  if (progressSlot) return progressSlot;
  return (progressRoot?.parentElement || el.parentElement)
    ?.querySelector<HTMLElement>(selector) || null;
}

function ensureFill(mountEl: HTMLElement) {
  let fill = mountEl.querySelector<HTMLElement>("[data-progress-fill]");
  if (!fill) {
    fill = document.createElement("span");
    fill.setAttribute("data-progress-fill", "");
    mountEl.replaceChildren(fill);
  }
  return fill;
}

function mount(root: unknown) {
  const progressRoot = findProgressRoot(root) || asElement(root);
  const mountEl = findMount(progressRoot || root);
  if (!(progressRoot instanceof HTMLElement) || !mountEl) return null;
  const existing = instances.get(progressRoot);
  if (existing && existing.fill.isConnected) return existing;
  const state = {
    fill: ensureFill(mountEl),
    mount: mountEl,
    root: progressRoot,
  };
  mountEl.setAttribute("role", "progressbar");
  mountEl.setAttribute("aria-valuemin", "0");
  mountEl.setAttribute("aria-valuemax", "100");
  state.root.style.setProperty("--progress-percent", "0%");
  instances.set(progressRoot, state);
  return state;
}

function stateFor(root: unknown) {
  const progressRoot = findProgressRoot(root) || asElement(root);
  return progressRoot ? instances.get(progressRoot) || mount(progressRoot) : null;
}

function setText(root: unknown, selector: string, value: unknown) {
  const slot = findSlot(root, selector);
  if (slot) slot.textContent = typeof value === "string" ? value : "";
}

function set(root: unknown, percent: unknown, options: ProgressSetOptions = {}) {
  const state = stateFor(root);
  if (!state) return 0;
  state.root.removeAttribute("data-progress-indeterminate");
  const nextPercent = clampPercent(percent);
  const nextWidth = `${nextPercent}%`;
  state.root.style.setProperty("--progress-percent", nextWidth);
  state.fill.style.width = nextWidth;
  state.mount.setAttribute("aria-valuenow", String(Math.round(nextPercent)));
  setText(
    root,
    "[data-progress-label]",
    typeof options.label === "string" ? options.label : formatPercent(nextPercent),
  );
  if (typeof options.meta === "string") setText(root, "[data-progress-meta]", options.meta);
  return nextPercent;
}

function setBytes(root: unknown, loaded: unknown, total: unknown, options: ProgressSetOptions = {}) {
  const percent = percentFromBytes(loaded, total);
  const label =
    typeof options.label === "string"
      ? options.label
      : options.showBytes === true
        ? bytesLabel(loaded, total)
        : formatPercent(percent);
  return set(root, percent, { ...options, label });
}

function indeterminate(root: unknown, options: ProgressSetOptions = {}) {
  const state = stateFor(root);
  if (!state) return 0;
  state.root.setAttribute("data-progress-indeterminate", "true");
  state.mount.removeAttribute("aria-valuenow");
  state.fill.style.width = "";
  setText(root, "[data-progress-label]", typeof options.label === "string" ? options.label : "");
  if (typeof options.meta === "string") setText(root, "[data-progress-meta]", options.meta);
  return 0;
}

function destroy(root: unknown) {
  const progressRoot = findProgressRoot(root) || asElement(root);
  if (!progressRoot) return false;
  const state = instances.get(progressRoot);
  if (!state) return false;
  state.root.removeAttribute("data-progress-indeterminate");
  state.root.style.removeProperty("--progress-percent");
  state.mount.removeAttribute("role");
  state.mount.removeAttribute("aria-valuemin");
  state.mount.removeAttribute("aria-valuemax");
  state.mount.removeAttribute("aria-valuenow");
  state.mount.replaceChildren();
  instances.delete(progressRoot);
  return true;
}

function progressPercentLabel(percentInput: unknown) {
  const percent = Number(percentInput);
  if (!Number.isFinite(percent)) return "";
  return `${Math.max(0, Math.min(100, Math.round(percent)))}%`;
}

const progressBars = Object.freeze({
  bytesLabel,
  clampPercent,
  destroy,
  formatBytes,
  formatPercent,
  indeterminate,
  mount,
  percentFromBytes,
  progressPercentLabel,
  set,
  setBytes,
});

export {
  bytesLabel,
  clampPercent,
  destroy,
  formatBytes,
  formatPercent,
  indeterminate,
  mount,
  percentFromBytes,
  progressBars,
  progressPercentLabel,
  set,
  setBytes,
};
export type { ProgressSetOptions };
export default progressBars;
