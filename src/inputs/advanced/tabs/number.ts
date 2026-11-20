import { frontendClassName, frontendDataSelector } from "#5vbaqj4pirp3";
import { toString } from "#dqy2d22qyujv";
import { createNumberElement, formatNumberValue } from "#hzrmwbvgt2ax";
import { familyKeyForRoot, tabToken } from "./manager/route.js";

function tabButtonsFor(family: string, route: string): HTMLElement[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll<HTMLElement>(frontendDataSelector("tabs-root")))
  .filter((root) => familyKeyForRoot(root) === family)
  .flatMap((root) => Array.from(root.querySelectorAll<HTMLElement>(frontendDataSelector("tab-button"))))
  .filter((button) => tabToken(button) === route);
}

function writeTabNumber(button: HTMLElement, value: unknown) {
  const slot = button.querySelector(`:scope > .${frontendClassName("right")}`);
  const text = value == null ? "" : formatNumberValue(value);
  if (!text) {
    slot?.remove();
    return;
  }
  if (slot) {
    slot.replaceChildren(createNumberElement(document, value));
    return;
  }
  const next = document.createElement("span");
  next.className = frontendClassName("right");
  next.appendChild(createNumberElement(document, value));
  button.appendChild(next);
}

function setTabNumber(family: unknown, route: unknown, value: unknown): number {
  const buttons = tabButtonsFor(toString(family), toString(route));
  buttons.forEach((button) => writeTabNumber(button, value));
  return buttons.length;
}

export { setTabNumber };
