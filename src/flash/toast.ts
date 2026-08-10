import { computeFlashDurationMs, flashId, normalizeFlashType } from "./duration.js";
import { createFlashElement } from "./elements.js";
import { ensureFlashStack, hideFlashElement, layoutFlashStack } from "./stack.js";
import type { FlashHandle, FlashOptions, FlashType } from "./types.js";

function dismissFlash(id: string) {
  const stack = ensureFlashStack();
  if (!stack) return false;
  const safeId = String(id || "").trim();
  if (!safeId) return false;
  const target = stack.querySelector<HTMLElement>(attrSelector("data-tbf-flash-id", safeId));
  if (!target) return false;
  hideFlashElement(stack, target);
  return true;
}

function showFlashImpl(
  type: FlashType,
  message: unknown,
  description: unknown = "",
  options: FlashOptions = {},
) {
  const stack = ensureFlashStack();
  if (!stack) return null;
  const id = String(options.id || "").trim() || flashId();
  const existing = stack.querySelector<HTMLElement>(attrSelector("data-tbf-flash-id", id));
  if (existing && options.update === true) existing.remove();
  const controls = createFlashElement(type, message, description, id, options);
  stack.appendChild(controls.element);
  startFlashLifetime(stack, controls, message, description, options);
  const dismiss = () => dismissFlash(id);
  return {
    dismiss,
    el: controls.element,
    element: controls.element,
    hide: dismiss,
    id,
  } satisfies FlashHandle;
}

function startFlashLifetime(
  stack: HTMLElement,
  controls: ReturnType<typeof createFlashElement>,
  message: unknown,
  description: unknown,
  options: FlashOptions,
) {
  const sticky = options.sticky === true;
  const duration = computeFlashDurationMs(message, description);
  if (!sticky) {
    controls.progress.style.animationDuration = `${duration}ms`;
    window.setTimeout(() => hideFlashElement(stack, controls.element), duration);
  } else {
    controls.progress.hidden = true;
  }
  window.requestAnimationFrame(() => {
      controls.element.setAttribute("data-tbf-visible", "true");
      layoutFlashStack(stack);
  });
}

function showFlash(message: unknown, type: FlashType = "info", description = "", options = {}) {
  return showFlashImpl(normalizeFlashType(type), message, description, options as FlashOptions);
}

function stickyFlash(type: FlashType, message: unknown, description = "", options = {}) {
  return showFlashImpl(normalizeFlashType(type), message, description, {
      ...(options as object),
      sticky: true,
  });
}

function liveFlash(type: FlashType, message: unknown, description = "", options = {}) {
  return showFlashImpl(normalizeFlashType(type), message, description, {
      ...(options as object),
      sticky: true,
      update: true,
  });
}

function showFlashMessage(
  flashApi: Record<string, any> | null | undefined,
  kind: unknown,
  message: unknown,
  description = "",
) {
  const type = normalizeFlashType(kind);
  if (flashApi && typeof flashApi[type] === "function") {
    return flashApi[type](message, description);
  }
  if (flashApi && typeof flashApi === "function") {
    return flashApi(message, type, description);
  }
  return showFlashImpl(type, message, description);
}

function attrSelector(name: string, value: string) {
  const escaped = typeof CSS !== "undefined" && typeof CSS.escape === "function"
  ? CSS.escape(value)
  : value.replace(/\\/gu, "\\\\").replace(/"/gu, "\\\"");
  return `[${name}="${escaped}"]`;
}

export {
  dismissFlash,
  liveFlash,
  showFlash,
  showFlashImpl,
  showFlashMessage,
  stickyFlash,
};
