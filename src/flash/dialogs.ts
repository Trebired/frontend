import {
  FLASH_CONFIRM_TIMEOUT_MS,
  FLASH_PROMPT_TIMEOUT_MS,
  normalizeFlashType,
} from "./duration.js";
import { createDialogFlash, makeButton } from "./elements.js";
import { ensureFlashStack, hideFlashElement, layoutFlashStack } from "./stack.js";
import type { ConfirmOptions, PromptOptions } from "./types.js";

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
    const controls = createDialogFlash(normalizeFlashType(options.type || "warn"), message, description);
    const body = controls.element.querySelector(".tbf-flash__body");
    const actions = document.createElement("div");
    actions.className = "tbf-flash__actions";
    const cancel = makeButton(options.cancelText || "Cancel", "tbf-button");
    const ok = makeButton(options.confirmText || "OK", "tbf-button tbf-button--strong");
    const input = createConfirmInput(options, ok);
    if (input) body?.appendChild(input);
    actions.append(cancel, ok);
    body?.appendChild(actions);
    stack.appendChild(controls.element);
    let timeoutId: number | undefined;
    const finish = (value: boolean) => finishDialog(stack, controls.element, resolve, value, timeoutId);
    bindConfirmControls(controls.element, finish, cancel, ok, controls.close);
    timeoutId = window.setTimeout(() => finish(false), FLASH_CONFIRM_TIMEOUT_MS);
    revealDialog(stack, controls.element, input);
  });
}

function bindConfirmControls(
  element: HTMLElement,
  finish: (value: boolean) => void,
  cancel: HTMLButtonElement,
  ok: HTMLButtonElement,
  close: HTMLButtonElement,
) {
  close.addEventListener("click", () => finish(false));
  cancel.addEventListener("click", () => finish(false));
  ok.addEventListener("click", () => finish(true));
  element.addEventListener("keydown", (event) => {
    if (event.key === "Escape") finish(false);
  });
}

function createConfirmInput(options: ConfirmOptions, ok: HTMLButtonElement) {
  const confirmationText = String(options.confirmationText || "").trim();
  if (options.mode !== "text" || !confirmationText) return null;
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
    const controls = createDialogFlash("info", message, description);
    const form = createPromptForm(options);
    controls.element.querySelector(".tbf-flash__body")?.appendChild(form);
    stack.appendChild(controls.element);
    let timeoutId: number | undefined;
    const finish = (value: string | null) => finishDialog(stack, controls.element, resolve, value, timeoutId);
    bindPromptControls(form, controls.close, finish);
    timeoutId = window.setTimeout(() => finish(null), FLASH_PROMPT_TIMEOUT_MS);
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
  close: HTMLButtonElement,
  finish: (value: string | null) => void,
) {
  const input = form.querySelector<HTMLInputElement>("input");
  const cancel = form.querySelector<HTMLButtonElement>(".tbf-button:not(.tbf-button--strong)");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    finish(input?.value.trim() || null);
  });
  cancel?.addEventListener("click", () => finish(null));
  close.addEventListener("click", () => finish(null));
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
  const target = source?.hasAttribute("data-tbf-confirm-title")
    ? source
    : fallbackSource || source;
  const title = target?.getAttribute("data-tbf-confirm-title") || "";
  if (!title) return Promise.resolve(true);
  return confirm(title, target?.getAttribute("data-tbf-confirm-description") || "", {
    confirmationText: target?.getAttribute("data-tbf-confirm-text") || "",
    mode: target?.getAttribute("data-tbf-confirm-mode") === "text" ? "text" : "classic",
    type: normalizeFlashType(target?.getAttribute("data-tbf-confirm-type") || "warn"),
  });
}

export { confirm, confirmElement, prompt };
