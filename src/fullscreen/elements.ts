import { frontendClassName, frontendDataAttr } from "#5vbaqj4pirp3";

const FULLSCREEN_RESTORE_MS = 320;

export function createPlaceholder(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const placeholder = document.createElement("div");
  placeholder.className = frontendClassName("fullscreen-placeholder");
  placeholder.setAttribute(frontendDataAttr("fullscreen-placeholder"), "");
  placeholder.style.width = `${Math.max(0, rect.width)}px`;
  placeholder.style.height = `${Math.max(0, rect.height)}px`;
  return placeholder;
}

export function createOverlay(id: string, group: string) {
  const overlay = document.createElement("div");
  overlay.className = frontendClassName("fullscreen-overlay");
  overlay.setAttribute(frontendDataAttr("fullscreen-overlay"), "");
  overlay.setAttribute(frontendDataAttr("fullscreen-id"), id);
  overlay.setAttribute(frontendDataAttr("fullscreen-group"), group);
  overlay.setAttribute("aria-hidden", "true");
  overlay.setAttribute("role", "presentation");
  return overlay;
}

export function animateRestoredTarget(target: HTMLElement) {
  const attribute = frontendDataAttr("fullscreen-restoring");
  target.setAttribute(attribute, "true");
  window.setTimeout(() => target.removeAttribute(attribute), FULLSCREEN_RESTORE_MS);
}
