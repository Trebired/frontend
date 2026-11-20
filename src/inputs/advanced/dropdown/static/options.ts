import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";
import { getDropdownOptions, getHidden, updateEmptyState } from "#c0ew0jlb0c87";
import { registerDropdownOptions, setDropdownOptionConfig, updateDropdownRootConfig } from "#ysjai7soiapa";
import { syncFromHidden } from "./value.js";
import { closeStatic } from "./position.js";

type DropdownOptionInput = {
  label: string;
  value: string;
};

type DropdownOptionsSettings = {
  disabled?: boolean;
  placeholder?: string;
};

function optionElement(panelId: string, option: DropdownOptionInput, index: number) {
  const item = document.createElement("li");
  item.id = `${panelId}_opt_${index}`;
  item.setAttribute("role", "option");
  item.setAttribute("aria-selected", "false");
  const config = { label: option.label, selected: false, value: option.value };
  const script = document.createElement("script");
  script.hidden = true;
  script.type = "application/json";
  script.setAttribute(frontendDataAttr("dropdown-option-config"), "");
  script.textContent = JSON.stringify(config);
  item.append(script);
  setDropdownOptionConfig(item, config);
  const label = document.createElement("span");
  label.textContent = option.label;
  item.append(label);
  return item;
}

function replaceOptionItems(list: HTMLElement, panelId: string, options: DropdownOptionInput[], placeholder?: string) {
  list.querySelectorAll(`${frontendDataSelector("dropdown-option")}, ${frontendDataSelector("dropdown-section-heading")}`)
  .forEach((node) => node.remove());
  const empty = list.querySelector<HTMLElement>(frontendDataSelector("dropdown-placeholder-option"));
  if (empty) {
    empty.hidden = options.length > 0;
    if (placeholder) empty.textContent = placeholder;
  }
  options
  .filter((option) => option && option.value && option.label)
  .forEach((option, index) => list.append(optionElement(panelId, option, index)));
}

function setDropdownDisabled(drop: HTMLElement, hidden: HTMLInputElement | null, disabled: boolean) {
  if (hidden) hidden.disabled = disabled;
  if (disabled) {
    drop.setAttribute("aria-disabled", "true");
    if (drop.getAttribute(frontendDataAttr("dropdown-open")) === "true") closeStatic(drop);
  } else {
    drop.removeAttribute("aria-disabled");
  }
}

function setDropdownOptions(drop: HTMLElement | null, options: DropdownOptionInput[], settings: DropdownOptionsSettings = {}) {
  if (!(drop instanceof HTMLElement)) return false;
  const panel = getDropdownOptions(drop) as HTMLElement | null;
  const list = panel?.querySelector<HTMLElement>(frontendDataSelector("dropdown-list"));
  if (!panel || !list) return false;
  const hidden = getHidden(drop) as HTMLInputElement | null;
  replaceOptionItems(list, panel.id, Array.isArray(options) ? options : [], settings.placeholder);
  if (settings.placeholder) {
    updateDropdownRootConfig(drop, {
        defaultPlaceholder: settings.placeholder,
        emptyLabel: settings.placeholder,
        placeholder: settings.placeholder,
    });
  }
  if (hidden && !options.some((option) => option.value === hidden.value)) hidden.value = "";
  setDropdownDisabled(drop, hidden, settings.disabled === true);
  registerDropdownOptions(panel);
  syncFromHidden(drop);
  updateEmptyState(drop);
  return true;
}

export { setDropdownOptions };
export type { DropdownOptionInput, DropdownOptionsSettings };
