import { dispatchInputChange, queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";

const DROPDOWN_SELECTOR = frontendDataSelector("dropdown");
const DROPDOWN_TRIGGER_SELECTOR = frontendDataSelector("dropdown-trigger");
const DROPDOWN_MENU_SELECTOR = frontendDataSelector("dropdown-menu");
const DROPDOWN_OPTION_SELECTOR = frontendDataSelector("dropdown-option");
const DROPDOWN_VALUE_SELECTOR = frontendDataSelector("dropdown-value");
const DROPDOWN_EVENT = frontendEventName("dropdown");

type DropdownState = {
  open: boolean;
  root: HTMLElement;
  value: string;
};

function setDropdownOpen(root: HTMLElement, open: boolean) {
  root.setAttribute(frontendDataAttr("dropdown-open"), open ? "true" : "false");
  root.querySelector<HTMLElement>(DROPDOWN_MENU_SELECTOR)?.setAttribute("aria-hidden", open ? "false" : "true");
  root.querySelector<HTMLElement>(DROPDOWN_TRIGGER_SELECTOR)?.setAttribute("aria-expanded", open ? "true" : "false");
}

function staticDropdownValue(root: HTMLElement) {
  return root.getAttribute(frontendDataAttr("dropdown-current")) || "";
}

function commitDropdownValue(root: HTMLElement, value: string, label = value): DropdownState {
  root.setAttribute(frontendDataAttr("dropdown-current"), value);
  root.querySelectorAll<HTMLInputElement>(`input[type='hidden']${frontendDataSelector("dropdown-input")}`).forEach((input) => {
      input.value = value;
      dispatchInputChange(input);
  });
  root.querySelectorAll<HTMLElement>(DROPDOWN_VALUE_SELECTOR).forEach((slot) => {
      slot.textContent = label;
  });
  queryAll<HTMLElement>(root, DROPDOWN_OPTION_SELECTOR).forEach((option) => {
      option.setAttribute("aria-selected", option.getAttribute(frontendDataAttr("dropdown-option")) === value ? "true" : "false");
  });
  const state = { open: false, root, value };
  root.dispatchEvent(new CustomEvent(DROPDOWN_EVENT, { bubbles: true, detail: state }));
  return state;
}

function bindDropdownRuntimeRoot(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement) || root.hasAttribute(frontendDataAttr("dropdown-bound"))) return null;
  root.setAttribute(frontendDataAttr("dropdown-bound"), "true");
  const trigger = root.querySelector<HTMLElement>(DROPDOWN_TRIGGER_SELECTOR);
  trigger?.addEventListener("click", (event) => {
      event.preventDefault();
      setDropdownOpen(root, root.getAttribute(frontendDataAttr("dropdown-open")) !== "true");
  });
  queryAll<HTMLElement>(root, DROPDOWN_OPTION_SELECTOR).forEach((option) => {
      option.addEventListener("click", (event) => {
          event.preventDefault();
          commitDropdownValue(root, option.getAttribute(frontendDataAttr("dropdown-option")) || "", option.textContent?.trim());
          setDropdownOpen(root, false);
      });
  });
  const selected = root.querySelector<HTMLElement>(`${DROPDOWN_OPTION_SELECTOR}[aria-selected="true"]`);
  if (selected) commitDropdownValue(root, selected.getAttribute(frontendDataAttr("dropdown-option")) || "", selected.textContent?.trim());
  return { open: false, root, value: staticDropdownValue(root) };
}

function bindStaticDropdowns(root: BindRoot = document) {
  queryAll<HTMLElement>(root, DROPDOWN_SELECTOR).forEach(bindDropdownRuntimeRoot);
}

export {
  DROPDOWN_EVENT,
  DROPDOWN_MENU_SELECTOR,
  DROPDOWN_OPTION_SELECTOR,
  DROPDOWN_SELECTOR,
  DROPDOWN_TRIGGER_SELECTOR,
  DROPDOWN_VALUE_SELECTOR,
  bindDropdownRuntimeRoot as bindDropdown,
  bindStaticDropdowns as bindDropdowns,
  commitDropdownValue,
  setDropdownOpen,
};
export type { DropdownState };
