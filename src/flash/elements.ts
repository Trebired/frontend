import { flashId } from "./duration.js";
import type { FlashOptions, FlashType } from "./types.js";

function makeButton(label: string, className: string) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

function createFlashElement(
  type: FlashType,
  message: unknown,
  description: unknown,
  id: string,
  options: FlashOptions,
) {
  const element = document.createElement("section");
  element.className = "tbf-flash";
  element.setAttribute("data-tbf-flash", "");
  element.setAttribute("data-tbf-flash-type", type);
  element.setAttribute("data-tbf-flash-id", id);
  setOptionalAttr(element, "data-tbf-flash-stack-priority", normalizeAttrValue(options.stackPriority));
  setOptionalAttr(element, "data-tbf-progress-tone", normalizeAttrValue(options.progressTone || options.progressType || type));
  element.setAttribute("role", type === "error" ? "alert" : "status");
  element.append(
    flashIcon(type),
    flashBody(message, description, options),
    flashProgress(),
  );
  return {
    element,
    progress: element.querySelector<HTMLElement>(".tbf-flash__progress")!,
  };
}

function flashIcon(type: FlashType) {
  const icon = document.createElement("span");
  icon.className = "tbf-flash__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = type === "success" ? "OK" : type === "info" ? "i" : "!";
  return icon;
}

function flashBody(message: unknown, description: unknown, options: FlashOptions) {
  const body = document.createElement("div");
  body.className = "tbf-flash__body";
  const title = document.createElement("strong");
  title.className = "tbf-flash__title";
  title.textContent = String(message || "");
  body.appendChild(title);
  const detail = String(description || options.description || "").trim();
  if (detail) body.appendChild(flashDescription(detail));
  return body;
}

function flashDescription(text: string) {
  const desc = document.createElement("span");
  desc.className = "tbf-flash__description";
  desc.textContent = text;
  return desc;
}

function flashProgress() {
  const progress = document.createElement("span");
  progress.className = "tbf-flash__progress";
  progress.setAttribute("aria-hidden", "true");
  return progress;
}

function createDialogFlash(
  type: FlashType,
  titleText: unknown,
  descriptionText: unknown,
  options: FlashOptions = {},
) {
  const controls = createFlashElement(type, titleText, descriptionText, flashId("dialog"), {
    ...options,
    sticky: true,
  });
  controls.element.classList.add("tbf-flash--dialog");
  return controls;
}

function normalizeAttrValue(value: unknown) {
  const text = String(value || "").trim().toLowerCase();
  return text ? text.replace(/[^a-z0-9_-]/gu, "") : "";
}

function setOptionalAttr(element: Element, name: string, value: string) {
  if (value) element.setAttribute(name, value);
  else element.removeAttribute(name);
}

export { createDialogFlash, createFlashElement, makeButton };
