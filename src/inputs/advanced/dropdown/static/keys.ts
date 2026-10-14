import { frontendDataAttr } from "#5vbaqj4pirp3";
import {
  activeDropdownOption,
  dropdownCombobox,
  dropdownOptionNodes,
  setDropdownActive,
} from "./aria.js";

type DropdownKeyHandlers = {
  close: (drop: Element) => void;
  open: (drop: Element) => void;
  select: (drop: Element, option: HTMLElement) => void;
};

const OPEN_ATTR = frontendDataAttr("dropdown-open");

const MOVE_KEYS = ["ArrowDown", "ArrowUp", "Home", "End"];

function isOpen(drop: Element): boolean {
  return drop.getAttribute(OPEN_ATTR) === "true";
}

function nextIndex(key: string, current: number, total: number): number {
  if (key === "Home") return 0;
  if (key === "End") return total - 1;
  if (key === "ArrowDown") return current < 0 ? 0 : Math.min(current + 1, total - 1);
  return current <= 0 ? 0 : current - 1;
}

function moveActive(drop: Element, options: Element | null, key: string): void {
  const nodes = dropdownOptionNodes(options);
  if (!nodes.length) return;
  const current = nodes.indexOf(activeDropdownOption(options) as HTMLElement);
  setDropdownActive(drop, options, nodes[nextIndex(key, current, nodes.length)]);
}

function handleMove(drop: Element, options: Element | null, event: KeyboardEvent, open: (d: Element) => void): void {
  event.preventDefault();
  if (!isOpen(drop)) {
    open(drop);
    window.requestAnimationFrame(() => moveActive(drop, options, event.key));
    return;
  }
  moveActive(drop, options, event.key);
}

function handleChoose(
  drop: Element,
  options: Element | null,
  event: KeyboardEvent,
  handlers: DropdownKeyHandlers,
): void {
  event.preventDefault();
  if (!isOpen(drop)) {
    handlers.open(drop);
    return;
  }
  const active = activeDropdownOption(options);
  if (active) handlers.select(drop, active);
  else handlers.close(drop);
}

function bindStaticDropdownKeys(
  drop: Element,
  options: Element | null,
  handlers: DropdownKeyHandlers,
): void {
  const combobox = dropdownCombobox(drop);
  if (!combobox) return;
  combobox.addEventListener("keydown", (event: KeyboardEvent) => {
      if (MOVE_KEYS.includes(event.key)) {
        handleMove(drop, options, event, handlers.open);
        return;
      }
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        handleChoose(drop, options, event, handlers);
        return;
      }
      if (event.key === "Escape" && isOpen(drop)) {
        event.preventDefault();
        handlers.close(drop);
        combobox.focus();
        return;
      }
      if (event.key === "Tab" && isOpen(drop)) handlers.close(drop);
  });
}

export { bindStaticDropdownKeys };
export type { DropdownKeyHandlers };
