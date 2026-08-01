import { applyZIndex } from "#ccvonx3uhbte";

const FLASH_STACK_ID = "tbf_flash_stack";
const FLASH_BASE_Z_INDEX = 1020;

function ensureFlashStack() {
  if (typeof document === "undefined" || !document.body) return null;
  const existing = document.getElementById(FLASH_STACK_ID);
  if (existing instanceof HTMLElement) return existing;
  const stack = document.createElement("div");
  stack.id = FLASH_STACK_ID;
  stack.className = "tbf-flash-stack";
  stack.setAttribute("data-tbf-flash-stack", "");
  stack.setAttribute("data-tbf-expanded", "false");
  applyZIndex(stack, { fallback: FLASH_BASE_Z_INDEX });
  document.body.appendChild(stack);
  stack.addEventListener("mouseenter", () => {
    stack.setAttribute("data-tbf-expanded", "true");
    layoutFlashStack(stack);
  });
  stack.addEventListener("mouseleave", () => {
    stack.setAttribute("data-tbf-expanded", "false");
    layoutFlashStack(stack);
  });
  return stack;
}

function orderedFlashItems(stack: HTMLElement) {
  return Array.from(stack.querySelectorAll<HTMLElement>("[data-tbf-flash]"));
}

function layoutFlashStack(stack: HTMLElement) {
  const items = orderedFlashItems(stack);
  const expanded = stack.getAttribute("data-tbf-expanded") === "true";
  let offset = 0;
  items.forEach((item, index) => {
    item.style.zIndex = String(1000 + index + 1);
    item.style.setProperty("--tbf-flash-y", `${expanded ? -offset : -index * 9}px`);
    offset += item.getBoundingClientRect().height + 10;
  });
  stack.style.height = flashStackHeight(items, expanded, offset);
}

function flashStackHeight(items: HTMLElement[], expanded: boolean, offset: number) {
  if (!items.length) return "0px";
  if (expanded) return `${offset}px`;
  return `${items[0].getBoundingClientRect().height + (items.length - 1) * 9}px`;
}

function hideFlashElement(stack: HTMLElement, element: HTMLElement) {
  element.setAttribute("data-tbf-hiding", "true");
  window.setTimeout(() => {
    element.remove();
    layoutFlashStack(stack);
  }, 220);
}

export {
  FLASH_STACK_ID,
  ensureFlashStack,
  hideFlashElement,
  layoutFlashStack,
};
