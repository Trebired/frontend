import {
  FLASH_CONFIRM_TIMEOUT_MS,
  FLASH_PROMPT_TIMEOUT_MS,
  normalizeFlashType,
} from "./duration.js";
import { createDialogFlash, makeButton } from "./elements.js";
import { ensureFlashStack, hideFlashElement, layoutFlashStack } from "./stack.js";
import {
  buildConfirmModel,
  normalizeConfirmMode,
} from "./confirm-model.js";
import type {
  ConfirmationAttrsInput,
  ConfirmModel,
  ConfirmOptions,
  PromptOptions,
} from "./types.js";
import { toText as text } from "#ndsvdqv80epr";

function finishDialog<T>(
  stack: HTMLElement,
  element: HTMLElement,
  resolve: (value: T) => void,
  value: T,
  timeoutId?: number,
) {
  if (element.hasAttribute("data-tbf-dialog-resolved")) return;
  element.setAttribute("data-tbf-dialog-resolved", "true");
  if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  hideFlashElement(stack, element);
  resolve(value);
}

function createDialogFinisher<T>(
  stack: HTMLElement,
  element: HTMLElement,
  resolve: (value: T) => void,
  timeoutRef: { id?: number },
) {
  return (value: T) => finishDialog(stack, element, resolve, value, timeoutRef.id);
}

function confirm(message: unknown, description = "", options: ConfirmOptions = {}) {
  const stack = ensureFlashStack();
  if (!stack) return Promise.resolve(false);
  return new Promise<boolean>((resolve) => {
      const model = buildConfirmModel(message, description, options);
      const controls = createDialogFlash(model.type, model.title, model.description, {
          progressTone: model.progressTone,
      });
      const body = controls.element.querySelector(".tbf-flash__body");
      const actions = document.createElement("div");
      actions.className = "tbf-flash__actions";
      const cancel = makeButton(model.cancelText, "tbf-button");
      const ok = makeButton(model.confirmButtonText, "tbf-button tbf-button--strong");
      const input = createConfirmInput(model, ok);
      if (input) body?.appendChild(input);
      actions.append(cancel, ok);
      body?.appendChild(actions);
      stack.appendChild(controls.element);
      const timeoutRef: { id?: number } = {};
      const finishConfirmDialog = createDialogFinisher(stack, controls.element, resolve, timeoutRef);
      bindConfirmControls(controls.element, finishConfirmDialog, cancel, ok);
      timeoutRef.id = window.setTimeout(() => finishConfirmDialog(false), FLASH_CONFIRM_TIMEOUT_MS);
      controls.progress.style.animationDuration = `${FLASH_CONFIRM_TIMEOUT_MS}ms`;
      revealDialog(stack, controls.element, input);
  });
}

function bindConfirmControls(
  element: HTMLElement,
  finish: (value: boolean) => void,
  cancel: HTMLButtonElement,
  ok: HTMLButtonElement,
) {
  cancel.addEventListener("click", () => finish(false));
  ok.addEventListener("click", () => finish(true));
  element.addEventListener("keydown", (event) => {
      if (event.key === "Escape") finish(false);
  });
}

function createConfirmInput(options: ConfirmModel, ok: HTMLButtonElement) {
  const confirmationText = String(options.confirmationText || "").trim();
  if (options.confirmMode !== "text" || !confirmationText) return null;
  ok.disabled = true;
  const input = document.createElement("input");
  input.className = "tbf-input";
  input.type = "text";
  input.autocomplete = "off";
  input.placeholder = options.placeholder || confirmationText;
  input.addEventListener("input", () => {
      ok.disabled = input.value.trim().toLowerCase() !== confirmationText.toLowerCase();
  });
  return input;
}

function prompt(message: unknown, description = "", options: PromptOptions = {}) {
  const stack = ensureFlashStack();
  if (!stack) return Promise.resolve(null);
  return new Promise<string|null>((resolve) => {
      const controls = createDialogFlash("info", message, description, {
          progressTone: options.progressTone || options.progressType || "info",
      });
      const form = createPromptForm(options);
      controls.element.querySelector(".tbf-flash__body")?.appendChild(form);
      stack.appendChild(controls.element);
      const timeoutRef: { id?: number } = {};
      const finishPromptDialog = createDialogFinisher(stack, controls.element, resolve, timeoutRef);
      bindPromptControls(form, finishPromptDialog);
      timeoutRef.id = window.setTimeout(() => finishPromptDialog(null), FLASH_PROMPT_TIMEOUT_MS);
      controls.progress.style.animationDuration = `${FLASH_PROMPT_TIMEOUT_MS}ms`;
      revealDialog(stack, controls.element, form.querySelector("input"));
  });
}

function createPromptForm(options: PromptOptions) {
  const form = document.createElement("form");
  form.className = "tbf-flash__form";
  const input = document.createElement("input");
  input.className = "tbf-input";
  input.name = "value";
  input.placeholder = options.placeholder || "";
  input.value = options.value || "";
  const actions = document.createElement("div");
  actions.className = "tbf-flash__actions";
  actions.append(
    makeButton(options.cancelText || "Cancel", "tbf-button"),
    submitButton(options.submitText || "OK"),
  );
  form.append(input, actions);
  return form;
}

function submitButton(label: string) {
  const button = makeButton(label, "tbf-button tbf-button--strong");
  button.type = "submit";
  return button;
}

function bindPromptControls(
  form: HTMLFormElement,
  finish: (value: string | null) => void,
) {
  const input = form.querySelector<HTMLInputElement>("input");
  const cancel = form.querySelector<HTMLButtonElement>(".tbf-button:not(.tbf-button--strong)");
  form.addEventListener("submit", (event) => {
      event.preventDefault();
      finish(input?.value.trim() || null);
  });
  cancel?.addEventListener("click", () => finish(null));
}

function revealDialog(stack: HTMLElement, element: HTMLElement, focusTarget: HTMLElement | null) {
  window.requestAnimationFrame(() => {
      element.setAttribute("data-tbf-visible", "true");
      focusTarget?.focus();
      if (focusTarget instanceof HTMLInputElement) focusTarget.select();
      layoutFlashStack(stack);
  });
}

function confirmFlashElement(source: Element | null, fallbackSource: Element | null = null) {
  const target = hasElementConfirmRequest(source) ? source : fallbackSource;
  if (!hasElementConfirmRequest(target)) return Promise.resolve(true);
  const request = readElementConfirmRequest(target);
  return confirm(request.title, request.description, request.options);
}

function confirmationVariantAttrs(input: ConfirmationAttrsInput) {
  const item = input && typeof input === "object" ? input : {};
  const variant = text(item.variant).toLowerCase();
  const attrs: Record<string, string> = {};
  if (!variant) return attrs;
  attrs["data-tbf-confirm-variant"] = variant;
  const mode = text(item.mode).toLowerCase();
  const target = text(item.target);
  const subject = text(item.subject);
  const confirmationText = text(item.confirmationText);
  if (mode) attrs["data-tbf-confirm-mode"] = mode;
  if (target) attrs["data-tbf-confirm-target"] = target;
  if (subject) attrs["data-tbf-confirm-subject"] = subject;
  if (confirmationText) attrs["data-tbf-confirm-text"] = confirmationText;
  return attrs;
}

function hasElementConfirmRequest(source: Element | null | undefined) {
  const node = elementNode(source);
  if (!node) return false;
  return Boolean(
    dialogAttr(node, "data-tbf-confirm-variant") ||
      dialogAttr(node, "data-tbf-confirm-title") ||
      dialogAttr(node, "data-tbf-confirm-description") ||
      dialogAttr(node, "data-tbf-confirm-text") ||
      dialogAttr(node, "data-confirmation-variant") ||
      dialogAttr(node, "data-confirmation-title") ||
      dialogAttr(node, "data-confirmation-description") ||
      dialogAttr(node, "data-confirmation-text"),
  );
}

function readElementConfirmRequest(source: Element | null | undefined) {
  const node = elementNode(source);
  if (!node) {
    return { description: "", options: {}, title: "" };
  }
  const variant = dialogAttr(node, "data-tbf-confirm-variant") || dialogAttr(node, "data-confirmation-variant");
  if (variant) return variantElementConfirmRequest(node, variant);
  return {
    description: dialogAttr(node, "data-tbf-confirm-description") || dialogAttr(node, "data-confirmation-description"),
    options: standardElementConfirmOptions(node),
    title: dialogAttr(node, "data-tbf-confirm-title") || dialogAttr(node, "data-confirmation-title"),
  };
}

function variantElementConfirmRequest(node: Element, variant: string) {
  const mode = dialogAttr(node, "data-tbf-confirm-mode") || dialogAttr(node, "data-confirmation-mode");
  return {
    description: "",
    options: {
      confirmationText: dialogAttr(node, "data-tbf-confirm-text") || dialogAttr(node, "data-confirmation-text") || undefined,
      mode: mode ? normalizeConfirmMode(mode) : undefined,
      subject: dialogAttr(node, "data-tbf-confirm-subject") || dialogAttr(node, "data-confirmation-subject") || undefined,
      target: dialogAttr(node, "data-tbf-confirm-target") || dialogAttr(node, "data-confirmation-target") || undefined,
      variant,
    },
    title: "",
  };
}

function standardElementConfirmOptions(node: Element): ConfirmOptions {
  const mode = dialogAttr(node, "data-tbf-confirm-mode") || dialogAttr(node, "data-confirmation-mode");
  return {
    cancelText: dialogAttr(node, "data-tbf-confirm-cancel-text") || dialogAttr(node, "data-confirmation-cancel-text") || undefined,
    confirmButtonText: dialogAttr(node, "data-tbf-confirm-confirm-text") ||
      dialogAttr(node, "data-confirmation-confirm-text") ||
      undefined,
    confirmationText: dialogAttr(node, "data-tbf-confirm-text") || dialogAttr(node, "data-confirmation-text") || undefined,
    mode: mode ? normalizeConfirmMode(mode) : undefined,
    placeholder: dialogAttr(node, "data-tbf-confirm-placeholder") ||
      dialogAttr(node, "data-confirmation-placeholder") ||
      undefined,
    progressTone: dialogAttr(node, "data-tbf-confirm-progress-tone") ||
      dialogAttr(node, "data-confirmation-progress-tone") ||
      undefined,
    type: normalizeFlashType(dialogAttr(node, "data-tbf-confirm-type") || "warn"),
  };
}

function elementNode(source: Element | null | undefined) {
  return source && typeof source.getAttribute === "function" ? source : null;
}

function dialogAttr(node: Element, name: string) {
  return text(node.getAttribute(name));
}

export {
  buildConfirmModel,
  confirm,
  confirmationVariantAttrs,
  confirmFlashElement as confirmElement,
  hasElementConfirmRequest,
  prompt,
  readElementConfirmRequest,
};
