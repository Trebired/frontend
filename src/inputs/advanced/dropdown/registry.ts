import { toString } from "#dqy2d22qyujv";
import { readHostJsonConfig } from "#dqy2d22qyujv";

type DropdownRootConfig = {
  defaultPlaceholder?: string;
  emptyLabel?: string;
  emptyOptionLabel?: string;
  hasLabel?: boolean;
  hideChecks?: boolean;
  max?: number;
  multiple?: boolean;
  optionsId?: string;
  placeholder?: string;
  selectionLabel?: string;
};

type DropdownOptionConfig = {
  label?: string;
  section?: string;
  selected?: boolean;
  unselect?: boolean;
  value?: string;
};

const rootConfigs = new WeakMap<HTMLElement, DropdownRootConfig>();
const optionConfigs = new WeakMap<HTMLElement, DropdownOptionConfig>();

function normalizeDropdownRootConfig(config: DropdownRootConfig = {}) {
  return {
    defaultPlaceholder: toString(config.defaultPlaceholder),
    emptyLabel: toString(config.emptyLabel),
    emptyOptionLabel: toString(config.emptyOptionLabel),
    hasLabel: config.hasLabel === true,
    hideChecks: config.hideChecks === true,
    max: Number.isFinite(Number(config.max)) ? Number(config.max) : 0,
    multiple: config.multiple === true,
    optionsId: toString(config.optionsId),
    placeholder: toString(config.placeholder),
    selectionLabel: toString(config.selectionLabel, "selected"),
  };
}

function normalizeOptionConfig(config: DropdownOptionConfig = {}) {
  return {
    label: toString(config.label),
    section: toString(config.section),
    selected: config.selected === true,
    unselect: config.unselect === true,
    value: toString(config.value),
  };
}

function setDropdownRootConfig(
  root: HTMLElement | null,
  config: DropdownRootConfig = {},
) {
  if (!(root instanceof HTMLElement)) return false;
  rootConfigs.set(root, normalizeDropdownRootConfig(config));
  return true;
}

function dropdownRootConfig(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement)) return normalizeDropdownRootConfig();
  return rootConfigs.get(root) || normalizeDropdownRootConfig();
}

function updateDropdownRootConfig(
  root: HTMLElement | null,
  patch: DropdownRootConfig,
) {
  if (!(root instanceof HTMLElement)) return false;
  rootConfigs.set(
    root,
    normalizeDropdownRootConfig({
        ...dropdownRootConfig(root),
        ...patch,
    }),
  );
  return true;
}

function readDropdownRootConfigScript(host: HTMLElement) {
  return normalizeDropdownRootConfig(
    readHostJsonConfig<DropdownRootConfig>(
      host,
      'script[type="application/json"][data-dropdown-root-config]',
      {},
    ),
  );
}

function readDropdownOptionConfigScript(host: ParentNode) {
  return normalizeOptionConfig(
    readHostJsonConfig<DropdownOptionConfig>(
      host,
      'script[type="application/json"][data-dropdown-option-config]',
      {},
    ),
  );
}

function setDropdownOptionConfig(
  option: HTMLElement | null,
  config: DropdownOptionConfig = {},
) {
  if (!(option instanceof HTMLElement)) return false;
  const normalized = normalizeOptionConfig(config);
  optionConfigs.set(option, normalized);
  option.setAttribute("data-dropdown-option", "");
  option.setAttribute(
    "data-dropdown-selected",
    normalized.selected ? "true" : "false",
  );
  if (normalized.section) {
    option.setAttribute("data-dropdown-section", normalized.section);
  } else {
    option.removeAttribute("data-dropdown-section");
  }
  if (normalized.unselect) {
    option.setAttribute("data-dropdown-unselect", "true");
  } else {
    option.removeAttribute("data-dropdown-unselect");
  }
  option.setAttribute("aria-selected", normalized.selected ? "true" : "false");
  return true;
}

function dropdownOptionConfig(option: HTMLElement | null) {
  if (!(option instanceof HTMLElement)) return normalizeOptionConfig();
  return optionConfigs.get(option) || normalizeOptionConfig();
}

function registerDropdownOption(option: HTMLElement | null) {
  if (!(option instanceof HTMLElement)) return false;
  return setDropdownOptionConfig(
    option,
    readDropdownOptionConfigScript(option),
  );
}

function registerDropdownOptions(root: ParentNode | null) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  root.querySelectorAll("[data-dropdown-option]").forEach((node) => {
      if (node instanceof HTMLElement) registerDropdownOption(node);
  });
}

function dropdownOptionValue(option: HTMLElement | null) {
  return dropdownOptionConfig(option).value || "";
}

function dropdownOptionLabel(option: HTMLElement | null) {
  const config = dropdownOptionConfig(option);
  return toString(config.label, option?.innerText || "");
}

function dropdownOptionSelected(option: HTMLElement | null) {
  return dropdownOptionConfig(option).selected === true;
}

function dropdownOptionUnselect(option: HTMLElement | null) {
  return dropdownOptionConfig(option).unselect === true;
}

function setDropdownOptionSelected(
  option: HTMLElement | null,
  selected: boolean,
) {
  if (!(option instanceof HTMLElement)) return;
  setDropdownOptionConfig(option, {
      ...dropdownOptionConfig(option),
      selected: selected === true,
  });
}

export {
  dropdownOptionConfig,
  dropdownOptionLabel,
  dropdownOptionSelected,
  dropdownOptionUnselect,
  dropdownOptionValue,
  dropdownRootConfig,
  readDropdownRootConfigScript,
  registerDropdownOption,
  registerDropdownOptions,
  setDropdownOptionConfig,
  setDropdownOptionSelected,
  setDropdownRootConfig,
  updateDropdownRootConfig,
};
export type { DropdownOptionConfig, DropdownRootConfig };
