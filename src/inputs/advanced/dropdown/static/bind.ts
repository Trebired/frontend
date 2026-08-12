import {
  closest,
  dispatchChange,
  getHidden,
  getDropdownOptions,
  repaintNearestModal,
  updateEmptyState,
} from "#c0ew0jlb0c87";
import searchManager from "#f1earyowcgbb";
import { isInUnhydratedIsland } from "#dqy2d22qyujv";
import { closeAll, closeStatic, openStatic } from "./position.js";
import {
  applyMultiValue,
  applyValue,
  autoPickSingle,
  clearSingleValue,
  ensureDefaultPlaceholder,
  getMultiMax,
  isMulti,
  parseMultiHiddenValue,
  showMultiMaxWarning,
  syncFromHidden,
} from "./value.js";
import {
  dropdownOptionUnselect,
  dropdownOptionValue,
  registerDropdownOptions,
} from "#ysjai7soiapa";

let closeDynamicBeforeStaticToggle = null;
const boundStaticDropdowns = new WeakSet<Element>();

function setStaticDropdownDynamicClose(fn) {
  closeDynamicBeforeStaticToggle = typeof fn === "function" ? fn : null;
}

function bindHiddenSync(drop, hidden) {
  if (!hidden) return;

  hidden.addEventListener("change", function() {
      syncFromHidden(drop);
      updateEmptyState(drop);
  });
}

function toggleDropdown(drop, e) {
  const ignore = closest(e.target, "[data-dropdown-ignore]");
  if (ignore) return;

  const inOptions = closest(e.target, "[data-dropdown-options]");
  if (inOptions) return;

  e.preventDefault();
  e.stopPropagation();

  const willOpen = drop.getAttribute("data-dropdown-open") !== "true";
  if (closeDynamicBeforeStaticToggle) closeDynamicBeforeStaticToggle();
  closeAll(drop);
  if (willOpen) openStatic(drop);
  else closeStatic(drop);
}

function clearMultiDropdown(drop) {
  if (!isMulti(drop)) return;
  applyMultiValue(drop, []);
  dispatchChange(drop);
  updateEmptyState(drop);
  repaintNearestModal(drop);
}

function toggleMultiDropdownValue(drop, value) {
  const hidden = getHidden(drop);
  const currentValues = parseMultiHiddenValue(hidden);
  const set = new Set(currentValues);

  if (set.has(value)) {
    set.delete(value);
  } else {
    const max = getMultiMax(drop);
    if (max > 0 && set.size >= max) {
      showMultiMaxWarning(drop, max);
      return;
    }
    set.add(value);
  }

  applyMultiValue(drop, Array.from(set));
  dispatchChange(drop);
  updateEmptyState(drop);
  repaintNearestModal(drop);
}

function applySingleDropdownValue(drop, li, value) {
  if (dropdownOptionUnselect(li)) {
    clearSingleValue(drop);
    dispatchChange(drop);
    updateEmptyState(drop);
    closeStatic(drop);
    repaintNearestModal(drop);
    return;
  }

  applyValue(drop, value, li.innerText, li.innerHTML);
  dispatchChange(drop);
  updateEmptyState(drop);
  closeStatic(drop);
  repaintNearestModal(drop);
}

function handleOptionsClick(drop, options, e) {
  const clear = closest(e.target, "[data-dropdown-clear]");
  if (clear && options.contains(clear)) {
    e.preventDefault();
    e.stopPropagation();
    clearMultiDropdown(drop);
    return;
  }

  const li = closest(e.target, "[data-dropdown-option]");
  if (!(li instanceof HTMLElement) || !options.contains(li)) return;

  e.preventDefault();
  e.stopPropagation();

  const value = dropdownOptionValue(li);
  if (isMulti(drop)) {
    toggleMultiDropdownValue(drop, value);
    return;
  }

  applySingleDropdownValue(drop, li, value);
}

function bindSearchOptions(options) {
  if (
    options instanceof HTMLElement &&
      options.hasAttribute("data-search-panel-root")
  ) {
    searchManager.bindRoot(options);
  }
}

function bindStaticDropdown(drop) {
  if (!(drop instanceof Element)) return;
  if (boundStaticDropdowns.has(drop)) return;
  if (isInUnhydratedIsland(drop)) return;

  ensureDefaultPlaceholder(drop);
  updateEmptyState(drop);

  if (drop.getAttribute("aria-disabled") === "true") return;
  boundStaticDropdowns.add(drop);

  const hidden = getHidden(drop);
  const options = getDropdownOptions(drop);
  registerDropdownOptions(options);
  autoPickSingle(drop);
  if (options instanceof HTMLElement) bindSearchOptions(options);
  bindHiddenSync(drop, hidden);

  drop.addEventListener("click", function(e) {
      toggleDropdown(drop, e);
  });

  if (options) {
    options.addEventListener("click", function(e) {
        handleOptionsClick(drop, options, e);
    });
  }
}

export { bindStaticDropdown, setStaticDropdownDynamicClose };
