import {
  FLASH_CONFIRM_TIMEOUT_MS,
  FLASH_PROMPT_TIMEOUT_MS,
  normalizeFlashType,
} from "./duration.js";
import { createDialogFlash, makeButton } from "./elements.js";
import { ensureFlashStack, hideFlashElement, layoutFlashStack } from "./stack.js";
import type {
  ConfirmationAttrsInput,
  ConfirmModel,
  ConfirmOptions,
  ConfirmVariant,
  FlashType,
  PromptOptions,
} from "./types.js";

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
    let timeoutId: number | undefined;
    const finish = (value: boolean) => finishDialog(stack, controls.element, resolve, value, timeoutId);
    bindConfirmControls(controls.element, finish, cancel, ok);
    timeoutId = window.setTimeout(() => finish(false), FLASH_CONFIRM_TIMEOUT_MS);
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
  return new Promise<string | null>((resolve) => {
    const controls = createDialogFlash("info", message, description, {
      progressTone: options.progressTone || options.progressType || "info",
    });
    const form = createPromptForm(options);
    controls.element.querySelector(".tbf-flash__body")?.appendChild(form);
    stack.appendChild(controls.element);
    let timeoutId: number | undefined;
    const finish = (value: string | null) => finishDialog(stack, controls.element, resolve, value, timeoutId);
    bindPromptControls(form, finish);
    timeoutId = window.setTimeout(() => finish(null), FLASH_PROMPT_TIMEOUT_MS);
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

function confirmElement(source: Element | null, fallbackSource: Element | null = null) {
  const target = hasElementConfirmRequest(source) ? source : fallbackSource;
  if (!hasElementConfirmRequest(target)) return Promise.resolve(true);
  const request = readElementConfirmRequest(target);
  return confirm(request.title, request.description, request.options);
}

function buildConfirmModel(
  message: unknown,
  description: unknown = "",
  options: ConfirmOptions = {},
): ConfirmModel {
  const opts = options && typeof options === "object" ? options : {};
  const variantModel = buildVariantConfirmModel(opts);
  if (variantModel) return variantModel;
  const confirmMode = normalizeConfirmMode(opts.confirmType || opts.confirmMode || opts.mode || "classic");
  const confirmationText = text(opts.confirmationText);
  return {
    cancelText: text(opts.cancelText, "Cancel"),
    confirmButtonText: text(opts.confirmButtonText || opts.confirmText, "OK"),
    confirmMode,
    confirmationText,
    description: text(description),
    isTextConfirm: confirmMode === "text" && Boolean(confirmationText),
    placeholder: text(opts.placeholder, confirmationText),
    progressTone: text(opts.progressTone || opts.progressType),
    title: text(message),
    type: normalizeFlashType(opts.type || "info"),
  };
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
    attr(node, "data-tbf-confirm-variant") ||
    attr(node, "data-tbf-confirm-title") ||
    attr(node, "data-tbf-confirm-description") ||
    attr(node, "data-tbf-confirm-text") ||
    attr(node, "data-confirmation-variant") ||
    attr(node, "data-confirmation-title") ||
    attr(node, "data-confirmation-description") ||
    attr(node, "data-confirmation-text"),
  );
}

function readElementConfirmRequest(source: Element | null | undefined) {
  const node = elementNode(source);
  if (!node) {
    return { description: "", options: {}, title: "" };
  }
  const variant = attr(node, "data-tbf-confirm-variant") || attr(node, "data-confirmation-variant");
  if (variant) return variantElementConfirmRequest(node, variant);
  return {
    description: attr(node, "data-tbf-confirm-description") || attr(node, "data-confirmation-description"),
    options: standardElementConfirmOptions(node),
    title: attr(node, "data-tbf-confirm-title") || attr(node, "data-confirmation-title"),
  };
}

function buildVariantConfirmModel(options: ConfirmOptions): ConfirmModel | null {
  const variant = normalizeConfirmVariant(options.variant);
  if (!variant) return null;
  const subject = text(options.subject, "item");
  const target = text(options.target, subject);
  const confirmMode = normalizeConfirmMode(options.mode || options.confirmType || options.confirmMode || (
    variant === "delete" ? "text" : "classic"
  ));
  const confirmationText = confirmMode === "text"
    ? text(options.confirmationText, target)
    : "";
  const copy = variantCopy(variant, subject, target);
  return {
    cancelText: text(options.cancelText, "Cancel"),
    confirmButtonText: text(options.confirmButtonText || options.confirmText, copy.button),
    confirmMode,
    confirmationText,
    description: copy.description,
    isTextConfirm: confirmMode === "text" && Boolean(confirmationText),
    placeholder: text(options.placeholder, confirmationText),
    progressTone: text(options.progressTone || options.progressType),
    title: copy.title,
    type: copy.type,
  };
}

function variantElementConfirmRequest(node: Element, variant: string) {
  const mode = attr(node, "data-tbf-confirm-mode") || attr(node, "data-confirmation-mode");
  return {
    description: "",
    options: {
      confirmationText: attr(node, "data-tbf-confirm-text") || attr(node, "data-confirmation-text") || undefined,
      mode: mode ? normalizeConfirmMode(mode) : undefined,
      subject: attr(node, "data-tbf-confirm-subject") || attr(node, "data-confirmation-subject") || undefined,
      target: attr(node, "data-tbf-confirm-target") || attr(node, "data-confirmation-target") || undefined,
      variant,
    },
    title: "",
  };
}

function standardElementConfirmOptions(node: Element): ConfirmOptions {
  const mode = attr(node, "data-tbf-confirm-mode") || attr(node, "data-confirmation-mode");
  return {
    cancelText: attr(node, "data-tbf-confirm-cancel-text") || attr(node, "data-confirmation-cancel-text") || undefined,
    confirmButtonText: attr(node, "data-tbf-confirm-confirm-text") ||
      attr(node, "data-confirmation-confirm-text") ||
      undefined,
    confirmationText: attr(node, "data-tbf-confirm-text") || attr(node, "data-confirmation-text") || undefined,
    mode: mode ? normalizeConfirmMode(mode) : undefined,
    placeholder: attr(node, "data-tbf-confirm-placeholder") ||
      attr(node, "data-confirmation-placeholder") ||
      undefined,
    progressTone: attr(node, "data-tbf-confirm-progress-tone") ||
      attr(node, "data-confirmation-progress-tone") ||
      undefined,
    type: normalizeFlashType(attr(node, "data-tbf-confirm-type") || "warn"),
  };
}

function variantCopy(variant: ConfirmVariant, subject: string, target: string) {
  if (variant === "delete") {
    return {
      button: "Delete",
      description: `This will permanently delete ${subject}.`,
      title: `Delete ${target}?`,
      type: "error" as FlashType,
    };
  }
  if (variant === "drop") {
    return {
      button: "Drop",
      description: `This will permanently drop ${subject}.`,
      title: `Drop ${target}?`,
      type: "error" as FlashType,
    };
  }
  return {
    button: "Archive",
    description: `This will archive ${subject}.`,
    title: `Archive ${target}?`,
    type: "warn" as FlashType,
  };
}

function normalizeConfirmVariant(value: unknown): ConfirmVariant | null {
  const variant = text(value).toLowerCase();
  return variant === "archive" || variant === "delete" || variant === "drop"
    ? variant
    : null;
}

function normalizeConfirmMode(value: unknown): "classic" | "text" {
  return text(value).toLowerCase() === "text" ? "text" : "classic";
}

function elementNode(source: Element | null | undefined) {
  return source && typeof source.getAttribute === "function" ? source : null;
}

function attr(node: Element, name: string) {
  return text(node.getAttribute(name));
}

function text(value: unknown, fallback = "") {
  const out = String(value ?? "").trim();
  return out || fallback;
}

export {
  buildConfirmModel,
  confirm,
  confirmationVariantAttrs,
  confirmElement,
  hasElementConfirmRequest,
  prompt,
  readElementConfirmRequest,
};
