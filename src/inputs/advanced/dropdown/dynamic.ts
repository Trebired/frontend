import { portalElement, promoteZIndex } from "#ccvonx3uhbte";
import { bindTooltip } from "#yf1o70q7eshd";
import { closeAll } from "./static/position.js";
import { CLOSE_ANIMATION_MS } from "./shared.js";
import { setDropdownOptionConfig } from "./registry.js";

const DROPDOWN_BASE_Z_INDEX = 1020;

let activeRequest = null;

function removeDynamicRequest(req) {
  if (!req) return;

  const wrap = req._wrap;
  if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);

  if (activeRequest === req) activeRequest = null;
}

function closeDynamic(immediate = false) {
  if (!activeRequest) return;

  const req = activeRequest;
  const wrap = activeRequest._wrap;
  activeRequest = null;

  if (immediate || !wrap || !wrap.parentNode) {
    removeDynamicRequest(req);
  } else {
    wrap.removeAttribute("data-dropdown-open");
    window.setTimeout(function () {
        removeDynamicRequest(req);
      }, CLOSE_ANIMATION_MS);
  }

  if (typeof req.onClose === "function") {
    try {
      req.onClose();
    } catch {}
  }
}

function getActiveDynamicWrap() {
  return activeRequest ? activeRequest._wrap : null;
}

function positionWrap(wrap, anchor) {
  const rect = anchor.getBoundingClientRect();
  wrap.style.position = "fixed";
  wrap.style.left = rect.left + "px";
  wrap.style.top = rect.bottom + 4 + "px";
  wrap.style.minWidth = Math.max(rect.width, 140) + "px";
}

function createDynamicWrap(opts) {
  const wrap = document.createElement("div");
  wrap.className = "dropdown-field-root dropdown-dynamic";
  wrap.setAttribute("data-dropdown-root", "");
  if (opts.noInput) {
    wrap.setAttribute("data-dropdown-no-input", "true");
  }
  wrap.style.width = "auto";
  return wrap;
}

function createDynamicList(opts) {
  const options = document.createElement("div");
  options.className = "options";
  options.setAttribute("data-dropdown-options", "");
  options.setAttribute("data-dropdown-portaled", "true");

  const list = document.createElement("ul");
  list.className = "dropdown-list";
  list.setAttribute("data-dropdown-list", "");

  for (let i = 0; i < opts.items.length; i += 1) {
    list.appendChild(createDynamicItem(opts, opts.items[i]));
  }

  options.appendChild(list);
  return options;
}

function createDynamicItem(opts, item) {
  const li = document.createElement("li");
  li.setAttribute("data-dropdown-option", "");
  setDropdownOptionConfig(li, {
      label: item.label != null ? String(item.label) : "",
      value: item.value != null ? String(item.value) : "",
  });
  li.textContent = item.label != null ? String(item.label) : "";
  if (item.title) {
    li.setAttribute("data-tbf-tooltip", String(item.title));
    bindTooltip(li);
  }

  li.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeDynamic();
      if (typeof opts.onSelect === "function") {
        opts.onSelect(item.value, item);
      }
  });

  return li;
}

function attachDynamicWrap(wrap) {
  portalElement(wrap);
}

function openDynamic(opts) {
  closeDynamic(true);
  closeAll(null);

  if (!opts || !opts.anchor || !Array.isArray(opts.items) || !opts.items.length)
  return;

  const wrap = createDynamicWrap(opts);
  wrap.appendChild(createDynamicList(opts));
  attachDynamicWrap(wrap);

  promoteZIndex(wrap, { fallback: DROPDOWN_BASE_Z_INDEX });
  positionWrap(wrap, opts.anchor);

  activeRequest = {
    _wrap: wrap,
    anchor: opts.anchor,
    onClose: opts.onClose || null,
  };

  requestAnimationFrame(function () {
      wrap.setAttribute("data-dropdown-open", "true");
  });
}

export { closeDynamic, getActiveDynamicWrap, openDynamic };
