import { flashId } from "./duration.js";
import { renderIconElement } from "#e55z7pkijewq";
import { flashFallbackIconText, flashIconSpec } from "./icons.js";
import type { FlashOptions, FlashType } from "./types.js";
import { frontendClassName, frontendDataAttr, frontendElementClass, frontendModifierClass } from "#5vbaqj4pirp3";

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
  element.className = frontendClassName("flash");
  element.setAttribute(frontendDataAttr("flash"), "");
  element.setAttribute(frontendDataAttr("flash-type"), type);
  element.setAttribute(frontendDataAttr("flash-id"), id);
  setOptionalAttr(element, frontendDataAttr("flash-stack-priority"), normalizeAttrValue(options.stackPriority));
  setOptionalAttr(element, frontendDataAttr("progress-tone"), normalizeAttrValue(options.progressTone || options.progressType || type));
  element.setAttribute("role", type === "error" ? "alert" : "status");
  element.append(
    flashIcon(type),
    flashBody(message, description, options),
    flashProgress(),
  );
  return {
    element,
    progress: element.querySelector<HTMLElement>(`.${frontendElementClass("flash", "progress")}`)!,
  };
}

function flashIcon(type: FlashType) {
  const icon = document.createElement("span");
  icon.className = frontendElementClass("flash", "icon");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = flashFallbackIconText(type);
  void renderIconElement(icon, flashIconSpec(type), { className: frontendElementClass("flash", "icon") });
  return icon;
}

function flashBody(message: unknown, description: unknown, options: FlashOptions) {
  const body = document.createElement("div");
  body.className = frontendElementClass("flash", "body");
  const title = document.createElement("span");
  title.className = frontendElementClass("flash", "title");
  title.textContent = String(message || "");
  body.appendChild(title);
  const detail = String(description || options.description || "").trim();
  if (detail) body.appendChild(flashDescription(detail));
  return body;
}

function flashDescription(text: string) {
  const desc = document.createElement("span");
  desc.className = frontendElementClass("flash", "description");
  desc.textContent = text;
  return desc;
}

function flashProgress() {
  const progress = document.createElement("span");
  progress.className = frontendElementClass("flash", "progress");
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
  controls.element.classList.add(frontendModifierClass("flash", "dialog"));
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
