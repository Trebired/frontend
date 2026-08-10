import {
  dispatchInputChange,
  isInteractiveTarget,
  noop as defineRadioGroupElement,
  resolveDocumentTarget,
} from "#dqy2d22qyujv";

const RADIO_GROUP_SELECTOR = "[data-tbf-radio-group]";
const boundRadioGroups = new WeakSet<Element>();

function getGroupRoot(input) {
  if (!input) return null;
  if (typeof input === "string") return resolveDocumentTarget(input);

  if (input instanceof Element) {
    if (input.matches(RADIO_GROUP_SELECTOR)) return input;
    const root = input.closest(RADIO_GROUP_SELECTOR);
    return root instanceof HTMLElement ? root : null;
  }

  return null;
}

function getRadioOptions(root): HTMLElement[] {
  return root
  ? (Array.from(root.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    ) as HTMLElement[])
  : [];
}

function getRadioInput(option) {
  const input = option
  ? Array.from(option.children).find(
    (child) => child instanceof HTMLInputElement && child.type === "radio",
  )
  : null;
  return input instanceof HTMLInputElement ? input : null;
}

function isDisabled(option) {
  const input = getRadioInput(option);
  return Boolean(input && input.disabled);
}

function syncGroup(scope) {
  const root = getGroupRoot(scope);
  if (!root) return false;

  const options = getRadioOptions(root);
  const enabledOptions = options.filter((option) => !isDisabled(option));
  const checkedOption =
  options.find((option) => {
      const input = getRadioInput(option);
      return Boolean(input && input.checked);
  }) ||
    enabledOptions[0] ||
    null;

  options.forEach((option) => {
      const input = getRadioInput(option);
      if (!input) return;

      const checked = Boolean(input.checked);
      const disabled = Boolean(input.disabled);

      option.setAttribute("data-radio-checked", checked ? "true" : "false");
      option.setAttribute("data-radio-disabled", disabled ? "true" : "false");
      option.setAttribute("role", "radio");
      option.setAttribute("aria-checked", checked ? "true" : "false");
      option.setAttribute("aria-disabled", disabled ? "true" : "false");
      option.tabIndex = disabled ? -1 : checkedOption === option ? 0 : -1;
  });

  return true;
}

function selectOption(option, options: any = {}) {
  const input = getRadioInput(option);
  if (!input || input.disabled || input.checked) return false;

  input.checked = true;
  dispatchInputChange(input);
  syncGroup(option);

  if (
    options.focus === true &&
      option instanceof HTMLElement &&
      typeof option.focus === "function"
  ) {
    option.focus();
  }

  return true;
}

function moveSelection(root, direction) {
  const options = getRadioOptions(root).filter((option) => !isDisabled(option));
  if (!options.length) return false;

  const currentIndex = options.findIndex(
    (option) =>
    option.tabIndex === 0 || getRadioInput(option)?.checked === true,
  );
  const startIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (startIndex + direction + options.length) % options.length;
  return selectOption(options[nextIndex], { focus: true });
}

function bindGroup(root) {
  if (!(root instanceof Element)) return;
  if (boundRadioGroups.has(root)) return;

  const options = getRadioOptions(root);
  if (options.length < 2) return;

  boundRadioGroups.add(root);
  root.setAttribute("role", "radiogroup");

  options.forEach((option) => {
      const input = getRadioInput(option);
      if (!input) return;

      input.addEventListener("change", function () {
          syncGroup(root);
      });

      option.addEventListener("click", function (event) {
          if (input.disabled) return;
          if (option.tagName === "LABEL") return;
          if (isInteractiveTarget(event.target)) return;
          event.preventDefault();
          selectOption(option);
      });

      option.addEventListener("keydown", function (event) {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            selectOption(option, { focus: true });
            return;
          }

          if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            event.preventDefault();
            moveSelection(root, 1);
            return;
          }

          if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            event.preventDefault();
            moveSelection(root, -1);
          }
      });
  });

  syncGroup(root);
}

function bindStaticGroups(scope?) {
  const root = scope instanceof Element ? getGroupRoot(scope) : null;
  if (root) bindGroup(root);
  const queryRoot = scope && "querySelectorAll" in scope ? scope : document;
  queryRoot.querySelectorAll(RADIO_GROUP_SELECTOR).forEach(bindGroup);
}

let booted = false;

function bootRadioManager() {
  if (booted) return radioManager;
  booted = true;

  return radioManager;
}

const radioManager = Object.freeze({
    boot: bootRadioManager,
    bind(scope) {
      bindStaticGroups(scope);
    },
    refresh: bindStaticGroups,
    sync(scope) {
      return syncGroup(scope);
    },
});

bootRadioManager();

export {
  bindGroup,
  bindStaticGroups,
  bootRadioManager,
  defineRadioGroupElement,
};
export default radioManager;
