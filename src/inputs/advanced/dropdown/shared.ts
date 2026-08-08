import { flash } from "#33o6e7mug9pg";
import { MODAL_CONTENT_SELECTOR } from "#8rm3pzkj3gge";
import { closestElement } from "#dqy2d22qyujv";
import { dropdownRootConfig } from "./registry.js";

const CLOSE_ANIMATION_MS = 240;

function getDropdownOptions(drop) {
  if (!drop) return null;
  if (drop._dropdownOptions instanceof HTMLElement)
  return drop._dropdownOptions;

  const linkedId = String(dropdownRootConfig(drop).optionsId || "").trim();
  if (linkedId) {
    const linked = document.getElementById(linkedId);
    if (linked instanceof HTMLElement) {
      drop._dropdownOptions = linked;
      return linked;
    }
  }

  const options = drop.querySelector("[data-dropdown-options]");
  if (options instanceof HTMLElement) {
    drop._dropdownOptions = options;
    return options;
  }

  return null;
}

function getHidden(drop) {
  const byType = drop.querySelector("input[type='hidden']");
  if (byType) return byType;
  return drop.querySelector("input[name]");
}

function isDropdownInput(value) {
  return (
    value instanceof HTMLInputElement || value instanceof HTMLSelectElement
  );
}

function queryDropdownById(root, id) {
  const safeId = String(id || "").trim();
  if (!safeId) return null;
  const local =
  root && root.querySelector ? root.querySelector("#" + safeId) : null;
  if (local instanceof HTMLElement) return local;
  const global = document.getElementById(safeId);
  return global instanceof HTMLElement ? global : null;
}

function resolveNamedDropdownInput(options) {
  const root =
  options && options.root instanceof HTMLElement ? options.root : null;
  const inputEl =
  options && isDropdownInput(options.inputEl) ? options.inputEl : null;
  if (inputEl) return inputEl;

  const inputId = String((options && options.inputId) || "").trim();
  const rootId = String((options && options.rootId) || "").trim();
  const marker = String((options && options.marker) || "").trim();
  const name = String((options && options.name) || "").trim();
  const dropdownAttr = String(
    (options && options.dropdownAttr) || "data-log-filter-dropdown",
  ).trim();
  const inputAttr = String(
    (options && options.inputAttr) || "data-log-filter-input",
  ).trim();

  const byId = queryDropdownById(root, inputId);
  if (isDropdownInput(byId)) return byId;

  const rootEl =
  options && options.rootEl instanceof HTMLElement
  ? options.rootEl
  : queryDropdownById(root, rootId) ||
    (root && marker
    ? root.querySelector(`[${dropdownAttr}="${marker}"]`)
    : null);
  const inRoot =
  rootEl && name
  ? rootEl.querySelector(
    `input[name="${name}"], select[name="${name}"], input[type="hidden"]`,
  )
  : null;
  if (isDropdownInput(inRoot)) return inRoot;

  const byMarker =
  root && marker ? root.querySelector(`[${inputAttr}="${marker}"]`) : null;
  if (isDropdownInput(byMarker)) return byMarker;

  const byName =
  root && name
  ? root.querySelector(`input[name="${name}"], select[name="${name}"]`)
  : null;
  return isDropdownInput(byName) ? byName : null;
}

function getList(drop) {
  const options = getDropdownOptions(drop);
  if (!options) return null;
  const list = options.querySelector("[data-dropdown-list]");
  return list instanceof HTMLElement ? list : null;
}

function updateEmptyState(drop) {
  const list = getList(drop);
  if (!list) return;

  const placeholder = list.querySelector("[data-dropdown-placeholder-option]");
  if (!(placeholder instanceof HTMLElement)) return;

  const items = Array.from(list.querySelectorAll("[data-dropdown-option]"));
  const hasVisibleValues = items.some((item) =>
    !(item instanceof HTMLElement) ? false : !item.hidden,
  );
  placeholder.hidden = hasVisibleValues;
}

function dispatchChange(drop) {
  const hidden = getHidden(drop);
  if (!hidden) return;
  hidden.dispatchEvent(new Event("change", { bubbles: true }));
}

function repaintNearestModal(drop) {
  const modalContent =
  drop && drop.closest ? drop.closest(MODAL_CONTENT_SELECTOR) : null;
  if (!modalContent) return;

  requestAnimationFrame(function () {
      modalContent.style.outline = "var(--border-width) solid transparent";
      void modalContent.offsetHeight;
      modalContent.style.outline = "";
  });
}

function showWarning(message) {
  if (!flash || typeof flash.warn !== "function") return;
  flash.warn(message, "");
}

export {
  CLOSE_ANIMATION_MS,
  closestElement as closest,
  dispatchChange,
  getHidden,
  getList,
  getDropdownOptions,
  isDropdownInput,
  queryDropdownById,
  repaintNearestModal,
  resolveNamedDropdownInput,
  showWarning,
  updateEmptyState,
};
