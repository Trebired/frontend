import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import checkboxClient, {
  bindCheckboxOption,
  bindCheckboxOptions,
  bootCheckboxClient,
  defineCheckboxOptionElement,
  syncCheckboxOption,
} from "./checkbox/index.client.js";
import {
  bindDisclosureHost,
  createDisclosure,
  defineDisclosureRootElement,
  disclosureSwitchEntries,
  switchDisclosureEntry,
} from "./disclosure/index.client.js";
import {
  bindDropdownElement,
  defineDropdownElement,
} from "./dropdown/index.client.js";
import dropdownManager from "./dropdown/manager.js";
import {
  dropdownOptionSelected,
  dropdownOptionValue,
  dropdownRootConfig,
  setDropdownOptionConfig,
  updateDropdownRootConfig,
} from "./dropdown/registry.js";
import {
  getDropdownOptions,
  getHidden,
  resolveNamedDropdownInput,
  syncDropdownHiddenInput,
  syncDropdownHiddenInputs,
  updateEmptyState,
} from "./dropdown/shared.js";
import { bindStaticDropdown } from "./dropdown/static/bind.js";
import {
  setDropdownLabel,
  syncFromHidden,
} from "./dropdown/static/value.js";
import radioManager, {
  bindGroup as bindRadioGroup,
  bindStaticGroups as bindRadioGroups,
  bootRadioManager,
  defineRadioGroupElement,
} from "./radio/index.client.js";
import searchManager from "./search.js";
import {
  bindBackendStatusInput,
  bindStatusFieldHost,
  bindStatusFields,
  bootStatusFields,
  checkBackendStatusInput,
  getInputStatusWrap,
  setInputStatusIcon,
} from "./status/index.client.js";
import { bindOwnedTabs, bindTabs, bindTabsHost, createTabs } from "./tabs/manager.js";
import { bootTabsClient } from "./tabs/client.js";

const CHECKBOX_HOST_SELECTOR = "[data-tbf-checkbox-option]";
const DISCLOSURE_SELECTOR = "[data-tbf-disclosure]";
const DROPDOWN_SELECTOR = "[data-dropdown-root]";
const RADIO_HOST_SELECTOR = "[data-tbf-radio-group]";
const TABS_ROOT_SELECTOR = "[data-tabs-root]";

function scopeFor(root?: BindRoot | null) {
  if (root && "querySelectorAll"in root) return root;
  return typeof document === "undefined" ? null : document;
}

function bindAdvancedCheckboxes(root?: BindRoot | null) {
  const scope = scopeFor(root);
  if (!scope) return [];
  defineCheckboxOptionElement();
  const hosts = queryAll<HTMLElement>(scope, CHECKBOX_HOST_SELECTOR);
  hosts.forEach((host) => checkboxClient.bind(host));
  return hosts;
}

function bindAdvancedDisclosures(root?: BindRoot | null) {
  const scope = scopeFor(root);
  if (!scope) return [];
  const disclosures = queryAll<HTMLElement>(scope, DISCLOSURE_SELECTOR);
  disclosures.forEach((disclosure) => bindDisclosureHost(disclosure));
  return disclosures;
}

function bindAdvancedDropdowns(root?: BindRoot | null) {
  const scope = scopeFor(root);
  if (!scope) return [];
  defineDropdownElement();
  const nodes = queryAll<HTMLElement>(scope, DROPDOWN_SELECTOR);
  nodes.forEach((node) => bindDropdownElement(node));
  return nodes;
}

function bindAdvancedRadios(root?: BindRoot | null) {
  const scope = scopeFor(root);
  if (!scope) return [];
  defineRadioGroupElement();
  const hosts = queryAll<HTMLElement>(scope, RADIO_HOST_SELECTOR);
  hosts.forEach((host) => radioManager.bind(host));
  return hosts;
}

function bindAdvancedSearch(root?: BindRoot | null) {
  const scope = scopeFor(root);
  if (!scope) return [];
  return searchManager.bind(scope as Document | Element);
}

function bindAdvancedTabRoots(root?: BindRoot | null) {
  const scope = scopeFor(root);
  if (!scope) return [];
  bootTabsClient();
  const roots = queryAll<HTMLElement>(scope, TABS_ROOT_SELECTOR);
  roots.forEach((tabsRoot) => bindTabs(tabsRoot));
  return roots;
}

function bindAdvancedInputControllers(root?: BindRoot | null) {
  const scope = scopeFor(root);
  if (!scope) return;
  bindAdvancedCheckboxes(scope);
  bindAdvancedDisclosures(scope);
  bindAdvancedDropdowns(scope);
  bindAdvancedRadios(scope);
  bindAdvancedSearch(scope);
  bindAdvancedTabRoots(scope);
  bindStatusFields(scope);
}

export {
  bindAdvancedCheckboxes,
  bindAdvancedDisclosures,
  bindAdvancedDropdowns,
  bindAdvancedInputControllers,
  bindAdvancedRadios,
  bindAdvancedSearch,
  bindAdvancedTabRoots as bindAdvancedTabs,
  bindBackendStatusInput,
  bindCheckboxOption,
  bindCheckboxOptions,
  bindDisclosureHost,
  bindDropdownElement,
  bindOwnedTabs,
  bindRadioGroup,
  bindRadioGroups,
  bindStaticDropdown,
  bindStatusFieldHost,
  bindStatusFields,
  bindTabs,
  bindTabsHost,
  bootCheckboxClient,
  bootRadioManager,
  bootStatusFields,
  bootTabsClient,
  checkBackendStatusInput,
  checkboxClient,
  createDisclosure,
  createTabs,
  defineCheckboxOptionElement,
  defineDisclosureRootElement,
  defineDropdownElement,
  defineRadioGroupElement,
  disclosureSwitchEntries,
  dropdownManager,
  dropdownOptionSelected,
  dropdownOptionValue,
  dropdownRootConfig,
  getDropdownOptions,
  getHidden,
  getInputStatusWrap,
  radioManager,
  resolveNamedDropdownInput,
  searchManager,
  setDropdownLabel,
  setDropdownOptionConfig,
  setInputStatusIcon,
  switchDisclosureEntry,
  syncCheckboxOption,
  syncDropdownHiddenInput,
  syncDropdownHiddenInputs,
  syncFromHidden,
  updateDropdownRootConfig,
  updateEmptyState,
};
