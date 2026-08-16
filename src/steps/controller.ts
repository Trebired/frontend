import { resolveDocumentTarget } from "#er0dlx1gtbzh";
import { createDisclosure } from "#z2c0jqmjqds4";
import { renderSharedSteps } from "./dom.js";
import { frontendDataSelector } from "#5vbaqj4pirp3";

const lastSteps = new WeakMap();
const actionControls = new Set<HTMLElement>();

function resolveEl(target) {
  if (!target) return null;
  if (typeof target === "string") return resolveDocumentTarget(target);
  return target && target.nodeType === 1 ? target : null;
}

function resolvePanel(target) {
  const el = resolveEl(target);
  if (!el) return null;
  if (el.matches && el.matches("[data-steps-panel]")) return el;
  return el.querySelector ? el.querySelector("[data-steps-panel]") : null;
}

function paint(panel) {
  const list = panel.querySelector("[data-steps-list]");
  if (list) renderSharedSteps(document, list, lastSteps.get(panel) || []);
}

function renderStepsPanel(target, entries) {
  const panel = resolvePanel(target);
  if (!panel) return;
  if (Array.isArray(entries)) lastSteps.set(panel, entries.slice());
  paint(panel);
}

function push(target, entry) {
  const panel = resolvePanel(target);
  if (!panel || !entry) return;
  const entries = lastSteps.get(panel) || [];
  entries.push(entry);
  lastSteps.set(panel, entries);
  paint(panel);
}

function setCopyMessage(target, message) {
  const panel = resolvePanel(target);
  const el = panel && panel.querySelector("[data-steps-copy]");
  if (el && message) el.textContent = String(message);
}

function open(target) {
  const panel = resolvePanel(target);
  const disclosure = panel && panel.closest(frontendDataSelector("disclosure"));
  if (!disclosure) return;
  const controller = createDisclosure(disclosure);
  if (controller) controller.open(false);
}

function setStepsProgress(target, percentInput) {
  const panel = resolvePanel(target);
  const bar = panel && panel.querySelector("[data-progress]");
  if (!bar) return;

  const fill = bar.querySelector("[data-progress-fill]");
  const labelEl = panel.querySelector("[data-progress-label]");
  const percent = Number(percentInput);

  if (!Number.isFinite(percent)) {
    bar.setAttribute("data-progress-indeterminate", "true");
    bar.style.removeProperty("--progress-percent");
    if (fill) fill.style.width = "";
    if (labelEl) labelEl.textContent = "";
    return;
  }

  const clamped = Math.max(0, Math.min(100, percent));
  const label = Math.round(clamped) + "%";
  bar.removeAttribute("data-progress-indeterminate");
  bar.style.setProperty("--progress-percent", clamped + "%");
  if (fill) fill.style.width = clamped + "%";
  if (labelEl) labelEl.textContent = label;
}

function begin(target) {
  const panel = resolvePanel(target);
  if (!panel) return;

  lastSteps.set(panel, []);
  const list = panel.querySelector("[data-steps-list]");
  if (list) list.innerHTML = "";
  setStepsProgress(panel, 0);
  open(panel);

  if (list && typeof list.animate === "function") {
    list.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 180,
        easing: "ease",
    });
  }
}

function collectControls(scope): HTMLElement[] {
  if (!scope || scope === true || scope === document) {
    return Array.from(actionControls).filter((control) => control.isConnected);
  }
  if (Array.isArray(scope)) {
    return scope.filter((control) => control instanceof HTMLElement);
  }
  if (scope instanceof Set) {
    return Array.from(scope).filter(
      (control) => control instanceof HTMLElement,
    );
  }
  return scope instanceof HTMLElement ? [scope] : [];
}

function registerActionControls(controls) {
  for (const control of collectControls(controls)) {
    actionControls.add(control);
  }
  return function unregisterActionControls() {
    for (const control of collectControls(controls)) {
      actionControls.delete(control);
    }
  };
}

function setActionsBusy(scope, busy) {
  const controls = collectControls(scope);
  for (const control of controls) {
    if (busy) control.setAttribute("disabled", "true");
    else control.removeAttribute("disabled");
  }
}

const stepsController = {
  resolvePanel,
  renderStepsPanel,
  push,
  setCopyMessage,
  open,
  progress: setStepsProgress,
  begin,
  registerActionControls,
  setActionsBusy,
};

export {
  resolvePanel,
  renderStepsPanel,
  push,
  setCopyMessage,
  open,
  setStepsProgress as progress,
  begin,
  registerActionControls,
  setActionsBusy,
};
export default stepsController;
