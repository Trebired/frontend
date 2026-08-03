import { queryAll, resolveDocumentTarget, type BindRoot } from "#er0dlx1gtbzh";

const FULLSCREEN_TRIGGER_SELECTOR = "[data-tbf-fullscreen-toggle],[data-tbf-fullscreen-enter],[data-tbf-fullscreen-exit]";

type FullscreenRuntimeOptions = {
  target?: Element | string | null;
};

function fullscreenElement(): Element | null {
  return typeof document === "undefined" ? null : document.fullscreenElement;
}

function fullscreenSupported(): boolean {
  return typeof document !== "undefined" && Boolean(document.fullscreenEnabled);
}

function resolveFullscreenTarget(target?: Element | string | null): Element | null {
  if (target instanceof Element) return target;
  if (target) return resolveDocumentTarget(target);
  return typeof document !== "undefined" ? document.documentElement : null;
}

async function enterFullscreen(target?: Element | string | null): Promise<boolean> {
  const element = resolveFullscreenTarget(target);
  if (!element || typeof element.requestFullscreen !== "function") return false;
  await element.requestFullscreen();
  document.dispatchEvent(new CustomEvent("tbf:fullscreen-enter", { bubbles: true, detail: { target: element } }));
  return true;
}

async function exitFullscreen(): Promise<boolean> {
  if (!fullscreenElement() || typeof document.exitFullscreen !== "function") return false;
  await document.exitFullscreen();
  document.dispatchEvent(new CustomEvent("tbf:fullscreen-exit", { bubbles: true }));
  return true;
}

async function toggleFullscreen(target?: Element | string | null): Promise<boolean> {
  return fullscreenElement() ? exitFullscreen() : enterFullscreen(target);
}

function readTriggerTarget(trigger: HTMLElement, fallback?: Element | string | null): Element | string | null {
  const value = trigger.getAttribute("data-tbf-fullscreen-target");
  return value || fallback || null;
}

function bindFullscreenTrigger(trigger: HTMLElement | null, options: FullscreenRuntimeOptions = {}): boolean {
  if (!(trigger instanceof HTMLElement) || trigger.hasAttribute("data-tbf-fullscreen-bound")) return false;
  trigger.setAttribute("data-tbf-fullscreen-bound", "true");
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    if (trigger.hasAttribute("data-tbf-fullscreen-exit")) {
      void exitFullscreen();
      return;
    }
    const target = readTriggerTarget(trigger, options.target);
    if (trigger.hasAttribute("data-tbf-fullscreen-enter")) void enterFullscreen(target);
    else void toggleFullscreen(target);
  });
  return true;
}

function bindFullscreen(root: BindRoot = document, options: FullscreenRuntimeOptions = {}): void {
  queryAll<HTMLElement>(root, FULLSCREEN_TRIGGER_SELECTOR).forEach((trigger) => {
    bindFullscreenTrigger(trigger, options);
  });
}

export {
  FULLSCREEN_TRIGGER_SELECTOR,
  bindFullscreen,
  bindFullscreenTrigger,
  enterFullscreen,
  exitFullscreen,
  fullscreenElement,
  fullscreenSupported,
  toggleFullscreen,
};
export type { FullscreenRuntimeOptions };
