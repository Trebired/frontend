import { closeDynamic, getActiveDynamicWrap, openDynamic } from "./dynamic.js";
import {
  bindStaticDropdown,
  setStaticDropdownDynamicClose,
} from "./static/bind.js";
import {
  closeAll,
  openedStaticDropdowns,
  positionStaticOptions,
} from "./static/position.js";
import { closest } from "./shared.js";

let booted = false;

function initDropdownManager() {
  setStaticDropdownDynamicClose(closeDynamic);

  function refreshOpenStaticPositions(event) {
    const target = event && event.target;
    if (target && closest(target, "[data-dropdown-options]")) return;

    openedStaticDropdowns().forEach(function (drop) {
        positionStaticOptions(drop);
    });
  }

  document.addEventListener(
    "pointerdown",
    function (e) {
      const activeDynamicWrap = getActiveDynamicWrap();
      if (activeDynamicWrap) {
        const inside = closest(e.target, "[data-dropdown-root]");
        if (!inside || inside !== activeDynamicWrap) {
          closeDynamic();
        }
      }

      const insideStatic = closest(e.target, "[data-dropdown-root]");
      const insideStaticOptions = closest(e.target, "[data-dropdown-options]");
      if (!insideStatic && !insideStaticOptions) closeAll(null);
    },
    true,
  );

  document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && getActiveDynamicWrap()) {
        closeDynamic();
      }
      if (e.key === "Escape") {
        closeAll(null);
      }
  });

  window.addEventListener("resize", refreshOpenStaticPositions, {
      passive: true,
  });
  window.addEventListener("scroll", refreshOpenStaticPositions, true);
}

function bootDropdownManager() {
  if (booted) return dropdownManager;
  booted = true;
  if (typeof document === "undefined" || typeof window === "undefined") {
    return dropdownManager;
  }

  initDropdownManager();

  return dropdownManager;
}

function bindDropdownManager(target: Element | null) {
  bootDropdownManager();
  if (target instanceof Element) bindStaticDropdown(target);
  return dropdownManager;
}

const dropdownManager = Object.freeze({
    open: openDynamic,
    close: closeDynamic,
    bind: bindDropdownManager,
    bindDropdown: bindStaticDropdown,
    boot: bootDropdownManager,
});

export { bootDropdownManager as boot };
export default dropdownManager;
