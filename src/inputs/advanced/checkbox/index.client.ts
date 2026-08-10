import { isInUnhydratedIsland, noop as defineCheckboxOptionElement } from "#dqy2d22qyujv";
import {
  dispatchInputChange,
  isInteractiveTarget,
  resolveDocumentTarget,
} from "#dqy2d22qyujv";
import {
  readHostJsonConfig,
} from "#dqy2d22qyujv";

type CheckboxOptionRoot = Element & {
  blur?: () => void;
};

const CHECKBOX_CONFIG_SELECTOR =
'script[type="application/json"][data-checkbox-option-config]';
const CHECKBOX_OPTION_SELECTOR = "[data-tbf-checkbox-option]";
const boundCheckboxOptions = new WeakSet<Element>();
const allCheckboxInputs = new WeakSet<HTMLInputElement>();
const checkboxOptionsByInput = new WeakMap<HTMLInputElement, Element>();

function getOptionRoot(input: unknown) {
  if (!input) return null;
  if (typeof input === "string") return resolveDocumentTarget(input);

  if (input instanceof HTMLInputElement) {
    const option = checkboxOptionsByInput.get(input);
    if (option) return option;
  }

  if (input instanceof Element) {
    if (input.matches(CHECKBOX_OPTION_SELECTOR)) return input;
    const option = input.closest(CHECKBOX_OPTION_SELECTOR);
    return option instanceof Element ? option : null;
  }

  return null;
}

function getCheckboxInput(option: Element | null) {
  const input = option
  ? Array.from(option.children).find(
    (child) =>
    child instanceof HTMLInputElement && child.type === "checkbox",
  )
  : null;
  return input instanceof HTMLInputElement ? input : null;
}

function getCheckboxScope(input: HTMLInputElement | null) {
  const option = getOptionRoot(input);
  const scope =
  option instanceof Element && option.closest ? option.closest("form") : null;
  if (scope instanceof Element) return scope;
  return option instanceof Element && option.parentElement
  ? option.parentElement
  : document;
}

function getCheckboxGroup(input: HTMLInputElement | null) {
  if (!input) return "";
  return String(input.name || "").trim();
}

function isAllCheckboxInput(input: HTMLInputElement | null) {
  return Boolean(input && allCheckboxInputs.has(input));
}

function getGroupInputs(input: HTMLInputElement | null) {
  const group = getCheckboxGroup(input);
  if (!group) return [];

  const scope = getCheckboxScope(input);
  const root =
  scope instanceof Element || scope instanceof Document ? scope : document;
  const inputs = Array.from(root.querySelectorAll('input[type="checkbox"]'));
  return inputs.filter(
    (node): node is HTMLInputElement =>
    node instanceof HTMLInputElement && getCheckboxGroup(node) === group,
  );
}

function applyAllCheckbox(input: HTMLInputElement | null) {
  if (!input) return;

  const nextChecked = Boolean(input.checked);
  const itemInputs = getGroupInputs(input).filter(
    (node) => !isAllCheckboxInput(node) && !node.disabled,
  );

  input.indeterminate = false;
  syncCheckboxOption(input);

  itemInputs.forEach((itemInput) => {
      itemInput.indeterminate = false;
      if (itemInput.checked !== nextChecked) {
        itemInput.click();
      } else {
        syncCheckboxOption(itemInput);
      }
  });
}

function syncCheckboxOption(scope: unknown) {
  const option = getOptionRoot(scope);
  const input = getCheckboxInput(option);
  if (!option || !input) return false;

  const checked = Boolean(input.checked);
  const indeterminate = Boolean(input.indeterminate);
  const disabled = Boolean(input.disabled);

  option.setAttribute("data-checkbox-checked", checked ? "true" : "false");
  option.setAttribute(
    "data-checkbox-indeterminate",
    indeterminate ? "true" : "false",
  );
  option.setAttribute("data-checkbox-disabled", disabled ? "true" : "false");
  option.setAttribute("role", "checkbox");
  option.setAttribute(
    "aria-checked",
    indeterminate ? "mixed" : checked ? "true" : "false",
  );
  option.setAttribute("aria-disabled", disabled ? "true" : "false");
  (option as HTMLElement).tabIndex = disabled ? -1 : 0;

  return true;
}

function toggleOption(
  option: Element | null,
  options: { focus?: boolean } = {},
) {
  const input = getCheckboxInput(option);
  if (!input || input.disabled) return false;

  input.checked = !input.checked;
  dispatchInputChange(input);
  syncCheckboxOption(option);

  if (
    options.focus === true &&
      option instanceof HTMLElement &&
      typeof option.focus === "function"
  ) {
    option.focus();
  }

  return true;
}

function bindCheckboxOption(option: Element | null) {
  if (!(option instanceof Element)) return;
  if (isInUnhydratedIsland(option)) return;
  if (boundCheckboxOptions.has(option)) return;

  boundCheckboxOptions.add(option);

  const input = getCheckboxInput(option);
  if (!input) return;
  const config = readHostJsonConfig<{ all?: boolean }>(
    option,
    CHECKBOX_CONFIG_SELECTOR,
    {},
  );
  if (config.all === true) allCheckboxInputs.add(input);
  checkboxOptionsByInput.set(input, option);

  input.addEventListener("change", () => {
      syncCheckboxOption(option);
      if (isAllCheckboxInput(input)) {
        applyAllCheckbox(input);
      }
  });

  option.addEventListener("click", (event) => {
      if (input.disabled) return;
      if (option.tagName === "LABEL") return;
      if (isInteractiveTarget(event.target)) return;
      event.preventDefault();
      toggleOption(option);
  });

  option.addEventListener("contextmenu", (event) => {
      if (input.disabled) return;
      event.preventDefault();
      toggleOption(option, { focus: true });
  });

  option.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      toggleOption(option, { focus: true });
  });

  syncCheckboxOption(option);
}

function bindCheckboxOptions(scope?: Element | Document | null) {
  const option = scope instanceof Element ? getOptionRoot(scope) : null;
  if (option) bindCheckboxOption(option);
  const root = scope && "querySelectorAll" in scope ? scope : document;
  root.querySelectorAll(CHECKBOX_OPTION_SELECTOR).forEach(bindCheckboxOption);
}

let booted = false;

function bootCheckboxClient() {
  if (booted) return checkboxClient;
  booted = true;

  return checkboxClient;
}

const checkboxClient = Object.freeze({
    bind: bindCheckboxOptions,
    boot: bootCheckboxClient,
    refresh(scope?: Element | Document | null) {
      if (scope) bindCheckboxOptions(scope);
    },
    sync: syncCheckboxOption,
});

export {
  bindCheckboxOption,
  bindCheckboxOptions,
  bootCheckboxClient,
  checkboxClient,
  defineCheckboxOptionElement,
  syncCheckboxOption,
};

export default checkboxClient;
