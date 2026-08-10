import { applyZIndex } from "#ccvonx3uhbte";

const FLASH_STACK_ID = "tbf_flash_stack";
const FLASH_BASE_Z_INDEX = 1020;
const FLASH_PRIORITY_WEIGHT = new Map([
    ["low", 0],
    ["normal", 1],
    ["high", 2],
]);
let resizeBound = false;

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
  bindFlashStackResize(stack);
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
  return Array.from(stack.querySelectorAll<HTMLElement>("[data-tbf-flash]"))
  .map((item, index) => ({ index, item }))
  .sort((a, b) => {
      const diff = priorityWeight(a.item) - priorityWeight(b.item);
      return diff === 0 ? a.index - b.index : diff;
  })
  .map(({ item }) => item);
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

function priorityWeight(item: HTMLElement) {
  const priority = String(
    item.getAttribute("data-tbf-flash-stack-priority") ||
      item.getAttribute("data-flash-stack-priority") ||
      "normal",
  ).toLowerCase();
  return FLASH_PRIORITY_WEIGHT.get(priority) ?? FLASH_PRIORITY_WEIGHT.get("normal")!;
}

function bindFlashStackResize(stack: HTMLElement) {
  if (resizeBound || typeof window === "undefined") return;
  resizeBound = true;
  window.addEventListener("resize", () => layoutFlashStack(stack));
}

export {
  FLASH_STACK_ID,
  ensureFlashStack,
  hideFlashElement,
  layoutFlashStack,
};
