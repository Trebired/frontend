import { resolveDocumentTarget } from "#er0dlx1gtbzh";

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

export {
  enterFullscreen,
  exitFullscreen,
  fullscreenElement,
  fullscreenSupported,
  toggleFullscreen,
};
