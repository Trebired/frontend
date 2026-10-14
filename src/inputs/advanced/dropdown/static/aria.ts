import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";

const ACTIVE_ATTR = frontendDataAttr("dropdown-active");
const LABEL_SELECTOR = frontendDataSelector("dropdown-label");
const OPTION_SELECTOR = frontendDataSelector("dropdown-option");

function dropdownCombobox(drop: Element): HTMLElement | null {
  const label = drop.querySelector(LABEL_SELECTOR);
  return label instanceof HTMLElement ? label : null;
}

function dropdownOptionNodes(options: Element | null): HTMLElement[] {
  if (!options) return [];
  return Array.from(options.querySelectorAll<HTMLElement>(OPTION_SELECTOR)).filter(
    (option) => !option.hidden && option.getAttribute("aria-disabled") !== "true",
  );
}

function setDropdownExpanded(drop: Element, open: boolean): void {
  const combobox = dropdownCombobox(drop);
  if (!combobox) return;
  combobox.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) return;
  combobox.removeAttribute("aria-activedescendant");
}

function clearDropdownActive(options: Element | null): void {
  for (const option of dropdownOptionNodes(options)) option.removeAttribute(ACTIVE_ATTR);
}

function setDropdownActive(drop: Element, options: Element | null, option: HTMLElement | null): void {
  clearDropdownActive(options);
  const combobox = dropdownCombobox(drop);
  if (!option) {
    combobox?.removeAttribute("aria-activedescendant");
    return;
  }
  option.setAttribute(ACTIVE_ATTR, "true");
  if (option.id && combobox) combobox.setAttribute("aria-activedescendant", option.id);
  if (typeof option.scrollIntoView === "function") option.scrollIntoView({ block: "nearest" });
}

function activeDropdownOption(options: Element | null): HTMLElement | null {
  if (!options) return null;
  const active = options.querySelector(`[${ACTIVE_ATTR}="true"]`);
  return active instanceof HTMLElement ? active : null;
}

export {
  ACTIVE_ATTR,
  activeDropdownOption,
  clearDropdownActive,
  dropdownCombobox,
  dropdownOptionNodes,
  setDropdownActive,
  setDropdownExpanded,
};
