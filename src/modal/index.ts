import {
  cssEscape,
  queryAll,
  resolveDocumentTarget,
  type BindRoot,
} from "#er0dlx1gtbzh";
import {
  moveLayerElementToTop,
  portalElement,
  stackZIndex,
  applyZIndex,
} from "#ccvonx3uhbte";

const MODAL_BASE_Z_INDEX = 1060;
const MODAL_SELECTOR = "[data-tbf-modal]";
const MODAL_CONTENT_SELECTOR = "[data-tbf-modal-content]";
const MODAL_CLOSE_SELECTOR = "[data-tbf-modal-close]";
const MODAL_TRIGGER_SELECTOR = "[data-tbf-modal-open][aria-controls]";
const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type ModalEntry = {
  modal: HTMLElement;
  restoreFocus: HTMLElement | null;
  trigger: HTMLElement | null;
};

const modalStack: ModalEntry[] = [];
const triggerBindings = new WeakMap<HTMLElement, () => void>();
let listenersInstalled = false;
let originalBodyOverflow = "";
let originalBodyPaddingRight = "";

function requestFrame(callback: () => void): void {
  const frame = typeof window !== "undefined" ? window.requestAnimationFrame : null;
  if (typeof frame === "function") frame(callback);
  else setTimeout(callback, 0);
}

function dispatchModalEvent(modal: HTMLElement, name: string, detail: Record<string, unknown> = {}): void {
  modal.dispatchEvent(new CustomEvent(name, {
    bubbles: true,
    detail: { modal, ...detail },
  }));
}

function findModalTarget(root: BindRoot, trigger: HTMLElement) {
  const id = String(trigger.getAttribute("aria-controls") || "").trim();
  if (!id) return null;
  const scoped = root.querySelector(`#${cssEscape(id)}`);
  if (scoped instanceof HTMLElement) return scoped;
  return resolveDocumentTarget(`#${id}`);
}

function prepareModal(modal: HTMLElement) {
  modal.setAttribute("data-tbf-modal", "");
  if (!modal.hasAttribute("role")) modal.setAttribute("role", "dialog");
  if (!modal.hasAttribute("aria-hidden")) modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("data-tbf-open");
  modal.removeAttribute("data-tbf-opening");
  modal.removeAttribute("data-tbf-closing");
}

function focusModal(modal: HTMLElement) {
  const target =
    modal.querySelector<HTMLElement>("[autofocus]") ||
    modal.querySelector<HTMLElement>(MODAL_CONTENT_SELECTOR) ||
    modal.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ||
    modal;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

function focusableModalElements(modal: HTMLElement): HTMLElement[] {
  return Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => !element.hasAttribute("disabled") && !element.hasAttribute("inert"));
}

function trapModalFocus(event: KeyboardEvent): void {
  if (event.key !== "Tab") return;
  const entry = modalStack[modalStack.length - 1];
  if (!entry) return;
  const focusable = focusableModalElements(entry.modal);
  if (!focusable.length) {
    event.preventDefault();
    entry.modal.focus({ preventScroll: true });
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (event.shiftKey && (!active || active === first || !entry.modal.contains(active))) {
    event.preventDefault();
    last.focus({ preventScroll: true });
    return;
  }
  if (!event.shiftKey && (!active || active === last || !entry.modal.contains(active))) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

function lockBodyScroll(lock: boolean) {
  if (!document.body) return;
  if (lock && modalStack.length === 1) {
    originalBodyOverflow = document.body.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    if (scrollbarGap > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight || "0") || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarGap}px`;
    }
    document.body.style.overflow = "hidden";
  }
  if (!lock && modalStack.length === 0) {
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
  }
}

function setTopStates() {
  modalStack.forEach((entry, index) => {
    const top = index === modalStack.length - 1;
    entry.modal.toggleAttribute("inert", !top);
    entry.modal.setAttribute("aria-hidden", top ? "false" : "true");
    entry.modal.setAttribute("data-tbf-top", top ? "true" : "false");
  });
}

function openModal(modalOrSelector: HTMLElement | string, trigger: HTMLElement | null = null) {
  const modal = resolveDocumentTarget(modalOrSelector);
  if (!(modal instanceof HTMLElement)) return null;
  prepareModal(modal);
  portalElement(modal);
  moveLayerElementToTop(modal);
  const existingIndex = modalStack.findIndex((entry) => entry.modal === modal);
  if (existingIndex >= 0) modalStack.splice(existingIndex, 1);
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  modalStack.push({ modal, restoreFocus: active, trigger });
  applyZIndex(modal, {
    fallback: stackZIndex(MODAL_BASE_Z_INDEX, modalStack.length - 1),
  });
  modal.setAttribute("data-tbf-opening", "true");
  modal.setAttribute("aria-hidden", "false");
  setTopStates();
  lockBodyScroll(true);
  dispatchModalEvent(modal, "tbf:modal-open", { trigger });
  requestFrame(() => {
    modal.removeAttribute("data-tbf-opening");
    modal.setAttribute("data-tbf-open", "true");
    focusModal(modal);
    dispatchModalEvent(modal, "tbf:modal-ready", { trigger });
  });
  return modal;
}

function closeModal(modalOrSelector?: HTMLElement | string | null) {
  const modal = modalOrSelector
    ? resolveDocumentTarget(modalOrSelector)
    : modalStack[modalStack.length - 1]?.modal;
  if (!(modal instanceof HTMLElement)) return false;
  const index = modalStack.findIndex((entry) => entry.modal === modal);
  if (index < 0) return false;
  const [entry] = modalStack.splice(index, 1);
  modal.removeAttribute("data-tbf-open");
  modal.setAttribute("data-tbf-closing", "true");
  modal.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    modal.removeAttribute("data-tbf-closing");
    modal.removeAttribute("data-tbf-top");
    modal.toggleAttribute("inert", true);
  }, 220);
  setTopStates();
  lockBodyScroll(false);
  const restoreTarget = entry.trigger || entry.restoreFocus;
  if (restoreTarget?.isConnected) restoreTarget.focus({ preventScroll: true });
  dispatchModalEvent(modal, "tbf:modal-close", { trigger: entry.trigger });
  return true;
}

function closeAllModals() {
  Array.from(modalStack)
    .reverse()
    .forEach((entry) => closeModal(entry.modal));
}

function bindModalTrigger(trigger: HTMLElement | null, root: BindRoot = document) {
  if (!(trigger instanceof HTMLElement)) return null;
  const modal = findModalTarget(root, trigger);
  if (!(modal instanceof HTMLElement)) return null;
  prepareModal(modal);
  trigger.setAttribute("aria-haspopup", "dialog");
  const existing = triggerBindings.get(trigger);
  if (existing) return modal;
  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    openModal(modal, trigger);
  };
  trigger.addEventListener("click", onClick);
  triggerBindings.set(trigger, () => trigger.removeEventListener("click", onClick));
  installModalListeners();
  return modal;
}

function bindModals(root: BindRoot = document) {
  queryAll<HTMLElement>(root, MODAL_SELECTOR).forEach(prepareModal);
  queryAll<HTMLElement>(root, MODAL_TRIGGER_SELECTOR).forEach((trigger) => {
    bindModalTrigger(trigger, root);
  });
}

function installModalListeners() {
  if (listenersInstalled) return;
  listenersInstalled = true;
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const closer = target?.closest(MODAL_CLOSE_SELECTOR);
    if (closer) {
      closeModal(closer.closest(MODAL_SELECTOR) as HTMLElement | null);
      return;
    }
    const top = modalStack[modalStack.length - 1]?.modal;
    if (target === top && top.getAttribute("data-tbf-modal-backdrop-close") !== "false") closeModal(top);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const top = modalStack[modalStack.length - 1]?.modal;
      if (top?.getAttribute("data-tbf-modal-escape-close") !== "false") closeModal();
      return;
    }
    trapModalFocus(event);
  });
}

function createModal(options: {
  content?: Node | string;
  id: string;
  title?: string;
}) {
  const modal = document.createElement("div");
  modal.id = options.id;
  modal.className = "tbf-modal";
  modal.setAttribute("data-tbf-modal", "");
  const content = document.createElement("div");
  content.className = "tbf-modal__content";
  content.setAttribute("data-tbf-modal-content", "");
  if (options.title) {
    const title = document.createElement("h2");
    title.textContent = options.title;
    content.appendChild(title);
  }
  if (typeof options.content === "string") content.insertAdjacentHTML("beforeend", options.content);
  else if (options.content) content.appendChild(options.content);
  modal.appendChild(content);
  prepareModal(modal);
  return modal;
}

export {
  FOCUSABLE_SELECTOR,
  MODAL_CLOSE_SELECTOR,
  MODAL_CONTENT_SELECTOR,
  MODAL_SELECTOR,
  MODAL_TRIGGER_SELECTOR,
  bindModalTrigger,
  bindModals,
  closeAllModals,
  closeModal,
  createModal,
  openModal,
  prepareModal,
};
export type { ModalEntry };
