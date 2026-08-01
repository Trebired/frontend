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
  element.setAttribute("role", type === "error" ? "alert" : "status");
  element.append(
    flashIcon(type),
    flashBody(message, description, options),
    flashCloseButton(),
    flashProgress(),
  );
  return {
    close: element.querySelector<HTMLButtonElement>(".tbf-flash__close")!,
    element,
    progress: element.querySelector<HTMLElement>(".tbf-flash__progress")!,
  };
}

function flashIcon(type: FlashType) {
  const icon = document.createElement("span");
  icon.className = "tbf-flash__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = type === "success" ? "OK" : type === "error" ? "!" : "i";
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

function flashCloseButton() {
  const close = makeButton("Dismiss", "tbf-flash__close");
  close.setAttribute("aria-label", "Dismiss");
  return close;
}

function flashProgress() {
  const progress = document.createElement("span");
  progress.className = "tbf-flash__progress";
  progress.setAttribute("aria-hidden", "true");
  return progress;
}

function createDialogFlash(type: FlashType, titleText: unknown, descriptionText: unknown) {
  const controls = createFlashElement(type, titleText, descriptionText, "dialog", {
    sticky: true,
  });
  controls.element.classList.add("tbf-flash--dialog");
  controls.progress.hidden = true;
  return controls;
}

export { createDialogFlash, createFlashElement, makeButton };
