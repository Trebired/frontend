import { queryAll } from "#er0dlx1gtbzh";
import {
  clearChildren,
  runtimeContext,
  slotActive,
  slotDisabled,
} from "./dom.js";
import {
  defaultCountNode,
  defaultLoaderNode,
  defaultStateNode,
} from "./renderers.js";
import {
  DYNAMIC_SIDEBAR_COUNT_SLOT_SELECTOR,
  DYNAMIC_SIDEBAR_DYNAMIC_LINK_SELECTOR,
  DYNAMIC_SIDEBAR_LOADER_SLOT_SELECTOR,
  DYNAMIC_SIDEBAR_STATE_SLOT_SELECTOR,
} from "./selectors.js";
import type { DynamicSidebarRuntimeRenderers } from "./types.js";
import {
  dynamicSidebarNumber,
  dynamicSidebarText,
  textValue,
} from "#yv4ubgils4dc";

function applyDynamicSidebarCountSlots(
  root: HTMLElement,
  counts: unknown,
  renderers: DynamicSidebarRuntimeRenderers = {},
) {
  queryAll<HTMLElement>(root, DYNAMIC_SIDEBAR_COUNT_SLOT_SELECTOR)
  .forEach((slot) => {
      const path = textValue(slot.getAttribute("data-tbf-sidebar-count-path"));
      const count = dynamicSidebarNumber(counts, path);
      if (!path || slotDisabled(slot) ||
          !slotActive(slot, "data-tbf-sidebar-count-visibility") || count == null) {
        clearChildren(slot);
        return;
      }
      const node = (renderers.count || defaultCountNode)({
          ...runtimeContext(root, counts, slot),
          count,
          path,
      });
      slot.replaceChildren(...(node ? [node] : []));
  });
}

function applyDynamicSidebarStateSlots(
  root: HTMLElement,
  counts: unknown,
  renderers: DynamicSidebarRuntimeRenderers = {},
) {
  queryAll<HTMLElement>(root, DYNAMIC_SIDEBAR_STATE_SLOT_SELECTOR)
  .forEach((slot) => {
      const path = textValue(slot.getAttribute("data-tbf-sidebar-state-path"));
      const state = dynamicSidebarText(counts, path);
      const node = path && !slotDisabled(slot)
      ? (renderers.state || defaultStateNode)({
          ...runtimeContext(root, counts, slot),
          path,
          state,
      })
      : null;
      slot.replaceChildren(...(node ? [node] : []));
  });
}

function applyRepositoryIdleLoader(
  slot: HTMLElement,
  root: HTMLElement,
  counts: unknown,
  idleCountPath: string,
  renderers: DynamicSidebarRuntimeRenderers,
) {
  if (!idleCountPath || slot.getAttribute("data-tbf-sidebar-active") !== "1") {
    clearChildren(slot);
    return true;
  }
  const idleCount = dynamicSidebarNumber(counts, idleCountPath);
  if (idleCount == null) {
    clearChildren(slot);
    return true;
  }
  const node = (renderers.count || defaultCountNode)({
      ...runtimeContext(root, counts, slot),
      count: idleCount,
      path: idleCountPath,
  });
  slot.replaceChildren(...(node ? [node] : []));
  return true;
}

function applyDynamicSidebarLoaderSlot(
  root: HTMLElement,
  counts: unknown,
  slot: HTMLElement,
  renderers: DynamicSidebarRuntimeRenderers = {},
) {
  const loaderPath = textValue(slot.getAttribute("data-tbf-sidebar-loader-path"));
  const repositoryId = textValue(
    slot.getAttribute("data-tbf-sidebar-status-repository-id"),
  );
  const idleCountPath = textValue(
    slot.getAttribute("data-tbf-sidebar-status-idle-count-path"),
  );
  const statusPath = textValue(slot.getAttribute("data-tbf-sidebar-status-path"));
  const running = dynamicSidebarNumber(counts, loaderPath) || 0;
  if (slotDisabled(slot) || !slotActive(slot, "data-tbf-sidebar-loader-visibility")) {
    clearChildren(slot);
    return;
  }
  if (repositoryId && running <= 0 && idleCountPath) {
    if (applyRepositoryIdleLoader(slot, root, counts, idleCountPath, renderers)) return;
  }
  const node = (renderers.loader || defaultLoaderNode)({
      ...runtimeContext(root, counts, slot),
      idleCount: idleCountPath ? dynamicSidebarNumber(counts, idleCountPath) : null,
      idleCountPath,
      lastStatus: dynamicSidebarText(counts, statusPath),
      loaderPath,
      repositoryId,
      running,
      statusPath,
  });
  slot.replaceChildren(...(node ? [node] : []));
}

function applyDynamicSidebarLoaderSlots(
  root: HTMLElement,
  counts: unknown,
  renderers: DynamicSidebarRuntimeRenderers = {},
) {
  queryAll<HTMLElement>(root, DYNAMIC_SIDEBAR_LOADER_SLOT_SELECTOR)
  .forEach((slot) => {
      applyDynamicSidebarLoaderSlot(root, counts, slot, renderers);
  });
}

function setDynamicSidebarLinkDisabled(link: HTMLElement, disabled: boolean) {
  link.setAttribute("data-tbf-sidebar-link-disabled", disabled ? "1" : "0");
  link.setAttribute("data-tbf-disabled", disabled ? "true" : "false");
  if (disabled) {
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("tabindex", "-1");
    link.removeAttribute("aria-current");
    link.removeAttribute("data-tbf-sidebar-link-active");
    link.closest("li")?.removeAttribute("data-tbf-sidebar-link-row-active");
    link.closest("li")?.removeAttribute("data-tbf-active");
  } else {
    link.removeAttribute("aria-disabled");
    link.removeAttribute("tabindex");
  }
  link.querySelectorAll([
      DYNAMIC_SIDEBAR_COUNT_SLOT_SELECTOR,
      DYNAMIC_SIDEBAR_LOADER_SLOT_SELECTOR,
      DYNAMIC_SIDEBAR_STATE_SLOT_SELECTOR,
    ].join(",")).forEach((slot) => {
      if (slot instanceof HTMLElement) {
        slot.setAttribute("data-tbf-sidebar-disabled", disabled ? "1" : "0");
      }
  });
}

function applyDynamicSidebarDisabledLinks(root: HTMLElement, counts: unknown) {
  queryAll<HTMLElement>(root, DYNAMIC_SIDEBAR_DYNAMIC_LINK_SELECTOR)
  .forEach((link) => {
      const path = textValue(link.getAttribute("data-tbf-sidebar-disabled-path"));
      const disabled = !path || (dynamicSidebarNumber(counts, path) || 0) <= 0;
      setDynamicSidebarLinkDisabled(link, disabled);
  });
}

function applyDynamicSidebarCounts(
  root: HTMLElement,
  counts: unknown,
  renderers: DynamicSidebarRuntimeRenderers = {},
) {
  applyDynamicSidebarDisabledLinks(root, counts);
  applyDynamicSidebarCountSlots(root, counts, renderers);
  applyDynamicSidebarStateSlots(root, counts, renderers);
  applyDynamicSidebarLoaderSlots(root, counts, renderers);
}

export {
  applyDynamicSidebarCounts,
  applyDynamicSidebarCountSlots,
  applyDynamicSidebarDisabledLinks,
  applyDynamicSidebarLoaderSlot,
  applyDynamicSidebarLoaderSlots,
  applyDynamicSidebarStateSlots,
  setDynamicSidebarLinkDisabled,
};
