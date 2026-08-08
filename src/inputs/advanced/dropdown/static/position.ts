import { portalElement, promoteZIndex } from "#ccvonx3uhbte";
import { CLOSE_ANIMATION_MS, getDropdownOptions } from "#c0ew0jlb0c87";

const DROPDOWN_BASE_Z_INDEX = 1020;
const openStaticDropdowns = new Set<Element>();

function resetDropdownSearch(drop) {
  const options = getDropdownOptions(drop);
  if (!options) return;

  options
  .querySelectorAll("search-query-input input")
  .forEach(function (input) {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function cancelPendingStaticClose(drop) {
  if (!drop) return;
  drop._dropdownCloseToken = (Number(drop._dropdownCloseToken) || 0) + 1;
  if (drop._dropdownCloseTimer) {
    window.clearTimeout(drop._dropdownCloseTimer);
    drop._dropdownCloseTimer = 0;
  }
}

function finishStaticClose(drop, options, token) {
  if (!drop || Number(drop._dropdownCloseToken) !== token) return;
  if (options) {
    options.removeAttribute("data-dropdown-show");
    options.removeAttribute("data-dropdown-closing");
  }
  resetDropdownSearch(drop);
}

function positionStaticOptions(drop) {
  const options = getDropdownOptions(drop);
  if (drop instanceof Element && !drop.isConnected) {
    openStaticDropdowns.delete(drop);
    return;
  }
  if (
    !drop ||
      !options ||
      options.getAttribute("data-dropdown-portaled") !== "true"
  )
  return;

  const rect = drop.getBoundingClientRect();
  const root = document.documentElement;
  const vw = root ? root.clientWidth : window.innerWidth;
  const vh = root ? root.clientHeight : window.innerHeight;
  const edge = 8;
  const gap = 4;

  options.style.position = "fixed";
  options.style.left = "0px";
  options.style.top = "0px";
  options.style.right = "auto";
  options.style.bottom = "auto";
  options.style.boxSizing = "border-box";
  options.style.width = `${Math.max(140, Math.round(rect.width))}px`;
  options.style.minWidth = `${Math.max(140, Math.round(rect.width))}px`;
  options.style.maxWidth = `${Math.max(140, vw - edge * 2)}px`;

  const wasMeasuring =
  options.getAttribute("data-dropdown-measuring") === "true";
  options.setAttribute("data-dropdown-measuring", "true");
  const panelRect = options.getBoundingClientRect();
  if (!wasMeasuring) {
    options.removeAttribute("data-dropdown-measuring");
  }
  const nextLeft = Math.max(
    edge,
    Math.min(rect.left, vw - panelRect.width - edge),
  );

  let nextTop = rect.bottom + gap;
  if (nextTop + panelRect.height > vh - edge) {
    nextTop = Math.max(edge, rect.top - gap - panelRect.height);
  }
  const position = nextTop < rect.top ? "above" : "below";

  options.style.left = `${Math.round(nextLeft)}px`;
  options.style.top = `${Math.round(nextTop)}px`;
  options.setAttribute("data-dropdown-position", position);
}

function connectedLiveIslandRoot(drop, options) {
  const fromDrop =
  drop && drop.closest ? drop.closest("[data-live-island-root]") : null;
  const fromOptions =
  options && options.closest
  ? options.closest("[data-live-island-root]")
  : null;
  const root = fromDrop || fromOptions;
  return root instanceof HTMLElement && root.isConnected ? root : null;
}

function portalStaticOptions(drop) {
  const options = getDropdownOptions(drop);
  if (!drop || !options) return;

  options.setAttribute("data-dropdown-portaled", "true");

  if (connectedLiveIslandRoot(drop, options)) {
    positionStaticOptions(drop);
    return;
  }

  portalElement(options);

  positionStaticOptions(drop);
}

function closeStatic(drop) {
  if (!drop) return;
  const options = getDropdownOptions(drop);
  const token = (Number(drop._dropdownCloseToken) || 0) + 1;
  drop._dropdownCloseToken = token;
  drop.removeAttribute("data-dropdown-open");
  if (drop instanceof Element) openStaticDropdowns.delete(drop);
  if (!options) {
    resetDropdownSearch(drop);
    return;
  }

  options.setAttribute("data-dropdown-closing", "true");
  options.removeAttribute("data-dropdown-show");
  const onDone = function (event) {
    if (event && event.target !== options) return;
    options.removeEventListener("transitionend", onDone);
    if (drop._dropdownCloseTimer) {
      window.clearTimeout(drop._dropdownCloseTimer);
      drop._dropdownCloseTimer = 0;
    }
    finishStaticClose(drop, options, token);
  };

  options.addEventListener("transitionend", onDone);
  drop._dropdownCloseTimer = window.setTimeout(function () {
      options.removeEventListener("transitionend", onDone);
      drop._dropdownCloseTimer = 0;
      finishStaticClose(drop, options, token);
    }, CLOSE_ANIMATION_MS);
}

function openStatic(drop) {
  const options = getDropdownOptions(drop);
  if (!drop || !options) return;

  cancelPendingStaticClose(drop);
  drop.setAttribute("data-dropdown-open", "true");
  if (drop instanceof Element) openStaticDropdowns.add(drop);
  portalStaticOptions(drop);
  options.removeAttribute("data-dropdown-closing");
  requestAnimationFrame(function () {
      positionStaticOptions(drop);
      promoteZIndex(options, { fallback: DROPDOWN_BASE_Z_INDEX });
      options.setAttribute("data-dropdown-show", "true");

      const searchInput = options.querySelector("search-query-input input");
      if (searchInput && typeof searchInput.focus === "function") {
        window.setTimeout(function () {
            searchInput.focus();
          }, 50);
      }
  });
}

function closeAll(except) {
  Array.from(openStaticDropdowns).forEach((drop) => {
      if (!drop.isConnected) {
        openStaticDropdowns.delete(drop);
        return;
      }
      if (drop !== except) closeStatic(drop);
  });
}

function openedStaticDropdowns() {
  return Array.from(openStaticDropdowns).filter((drop) => {
      if (drop.isConnected) return true;
      openStaticDropdowns.delete(drop);
      return false;
  });
}

export {
  closeAll,
  closeStatic,
  openedStaticDropdowns,
  openStatic,
  positionStaticOptions,
  portalStaticOptions,
};
