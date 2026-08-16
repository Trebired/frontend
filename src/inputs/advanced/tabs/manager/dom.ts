import { toString } from "#dqy2d22qyujv";

import { bindTooltip, setTooltipText } from "#yf1o70q7eshd";
import {
  initializeOwnedNodes,
  ownedNodes,
} from "./ownership.js";
import { frontendDataAttr } from "#5vbaqj4pirp3";

const TAB_PANE_ANIMATION_MS = 290;
const TAB_PANE_ANIMATION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

const paneAnimations = new WeakMap<HTMLElement, Animation>();
const overflowFrames = new WeakMap<HTMLElement, number>();

function cancelPaneAnimation(pane: HTMLElement) {
  const animation = paneAnimations.get(pane);
  if (!animation) return;
  animation.cancel();
  paneAnimations.delete(pane);
}

function simplifyRouteToken(value) {
  return toString(value)
  .replace(/[_\s]+/g, "-")
  .replace(/-?(panel|tab)$/g, "")
  .replace(/^-+|-+$/g, "")
  .toLowerCase();
}

function panelIdForTab(tab) {
  return toString(
    tab && tab.getAttribute ? tab.getAttribute("aria-controls") : "",
  );
}

function paneForTab(tab) {
  const id = panelIdForTab(tab);
  return id ? document.getElementById(id) : null;
}

function familyContainer(root) {
  return ownedNodes(root, "[data-tabs-family]")[0] || null;
}

function uiContainer(root) {
  return (
    familyContainer(root) ||
      ownedNodes(root, "[data-tabs-stack]")[0] ||
      ownedNodes(root, "[data-tabs-list]")[0] ||
      null
  );
}

function nestedGroups(root) {
  const family = familyContainer(root);
  if (!(family instanceof HTMLElement)) return [];
  return Array.from(
    family.querySelectorAll("[data-tabs-nested-parent-panel]"),
  ).filter((node) => {
      return (
        node instanceof HTMLElement &&
          node.closest("[data-tabs-family]") === family
      );
  });
}

function syncNestedGroups(root, activeTab) {
  if (!(root instanceof HTMLElement)) return;
  const activePanelId = panelIdForTab(activeTab);
  nestedGroups(root).forEach((group) => {
      if (!(group instanceof HTMLElement)) return;
      const parentPanelId = toString(
        group.getAttribute("data-tabs-nested-parent-panel"),
      );
      group.hidden = !activePanelId || parentPanelId !== activePanelId;
  });
}

function hoistNestedFamily(root) {
  if (!(root instanceof HTMLElement)) return;
  if (toString(root.getAttribute("data-tabs-hoist-family")) !== "true") return;
  const parentContainer = root.parentElement;
  if (!(parentContainer instanceof HTMLElement)) return;
  const parentRoot = parentContainer.closest("[data-tabs-root]");
  if (!(parentRoot instanceof HTMLElement) || parentRoot === root) return;

  const family = familyContainer(root);
  const parentFamily = familyContainer(parentRoot);
  if (
    !(family instanceof HTMLElement) ||
      !(parentFamily instanceof HTMLElement)
  )
  return;
  if (family === parentFamily) return;

  const parentPanelId = toString(parentContainer.id);
  const activeParentTab = ownedNodes(parentRoot, "[data-tab-button]").find(
    (tab) => {
      return (
        tab instanceof HTMLElement &&
          tab.getAttribute("aria-selected") === "true"
      );
    },
  );
  const activeParentPanelId = panelIdForTab(activeParentTab);

  Array.from(family.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;
      if (parentPanelId)
      child.setAttribute("data-tabs-nested-parent-panel", parentPanelId);
      child.hidden = !parentPanelId || parentPanelId !== activeParentPanelId;
      parentFamily.appendChild(child);
  });

  family.remove();
}

function syncNestedTabsIndicator(tab) {
  if (!(tab instanceof HTMLElement)) return;
  const pane = paneForTab(tab);
  const hasNestedTabs = Boolean(
    pane instanceof HTMLElement && pane.querySelector("[data-tabs-root]"),
  );
  if (hasNestedTabs) {
    tab.setAttribute("data-tab-has-nested-tabs", "true");
    return;
  }
  if (tab.getAttribute("data-tab-has-nested-tabs") === "true") return;
  tab.removeAttribute("data-tab-has-nested-tabs");
}

function hidePane(pane) {
  if (!(pane instanceof HTMLElement)) return;
  cancelPaneAnimation(pane);
  pane.style.willChange = "";
  pane.style.opacity = "";
  pane.style.transform = "";
  pane.hidden = true;
}

function showPane(pane, animate) {
  if (!(pane instanceof HTMLElement)) return;
  pane.hidden = false;

  cancelPaneAnimation(pane);

  pane.style.willChange = "";
  pane.style.opacity = "";
  pane.style.transform = "";

  if (!animate || typeof pane.animate !== "function") return;

  pane.style.willChange = "opacity, transform";
  const nextAnimation = pane.animate(
    [
      { opacity: 0, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    {
      duration: TAB_PANE_ANIMATION_MS,
      easing: TAB_PANE_ANIMATION_EASING,
    },
  );

  paneAnimations.set(pane, nextAnimation);
  const finish = () => {
    if (paneAnimations.get(pane) === nextAnimation) paneAnimations.delete(pane);
    pane.style.willChange = "";
    pane.style.opacity = "";
    pane.style.transform = "";
  };

  nextAnimation.addEventListener("finish", finish, { once: true });
  nextAnimation.addEventListener("cancel", finish, { once: true });
}

function tabLabel(tab) {
  return toString(tab.textContent);
}

function syncOverflowTooltip(tab) {
  const label = tabLabel(tab);
  const overflowing = Boolean(
    typeof tab.scrollWidth === "number" &&
      typeof tab.clientWidth === "number" &&
      tab.scrollWidth > tab.clientWidth + 1,
  );

  if (overflowing && label) {
    setTooltipText(tab, label);
    return;
  }

  setTooltipText(tab, "");
  tab.removeAttribute("aria-description");
  tab.removeAttribute("title");
}

function scheduleOverflowSync(root) {
  const frame = overflowFrames.get(root);
  if (frame) cancelAnimationFrame(frame);
  overflowFrames.set(
    root,
    requestAnimationFrame(() => {
        overflowFrames.delete(root);
        ownedNodes(root, "[data-tab-button]").forEach((tab) => {
            if (tab instanceof HTMLElement) syncOverflowTooltip(tab);
        });
    }),
  );
}

function syncNestedSpacing(root, active) {
  if (!(root instanceof HTMLElement)) return;
  const family = familyContainer(root);
  const stack = ownedNodes(root, "[data-tabs-stack]")[0];
  if (family instanceof HTMLElement) {
    family.setAttribute(
      "data-tabs-active-has-nested-tabs",
      active ? "true" : "false",
    );
    if (active) family.style.removeProperty("gap");
    else family.style.setProperty("gap", "0px");
  }
  if (stack instanceof HTMLElement) {
    if (active) stack.style.removeProperty("gap");
    else stack.style.setProperty("gap", "0px");
  }
}

function activeNestedGroup(root, activePanelId) {
  if (!activePanelId) return null;
  return nestedGroups(root).find((group) => {
      return (
        group instanceof HTMLElement &&
          toString(group.getAttribute("data-tabs-nested-parent-panel")) ===
        activePanelId &&
          Array.from(group.querySelectorAll("[data-tab-button]")).some((button) => {
            return button instanceof HTMLElement && button.hidden !== true;
        })
      );
  });
}

function activeNestedTab(root) {
  return ownedNodes(root, "[data-tab-button]").find((tab) => {
      return (
        tab instanceof HTMLElement &&
          tab.getAttribute("aria-selected") === "true" &&
          tab.getAttribute("data-tab-has-nested-tabs") === "true"
      );
  });
}

function deactivateNestedIndicator(root, row) {
  syncNestedSpacing(root, false);
  row.hidden = true;
  row.setAttribute("data-state", "inactive");
  row.style.removeProperty("--tabs-nested-indicator-left");
}

function activateNestedIndicator(root, row, list, activeTab) {
  syncNestedSpacing(root, true);
  row.hidden = false;
  const listRect = list.getBoundingClientRect();
  const tabRect = activeTab.getBoundingClientRect();
  const left = Math.max(0, tabRect.left - listRect.left + tabRect.width / 2);
  row.style.setProperty("--tabs-nested-indicator-left", `${left}px`);
  row.setAttribute("data-state", "active");
}

function syncNestedIndicatorRow(root) {
  if (!(root instanceof HTMLElement)) return;
  const row = ownedNodes(root, "[data-tabs-nested-indicator-row]")[0];
  if (!(row instanceof HTMLElement)) return;
  const list = ownedNodes(root, "[data-tabs-list]")[0];
  const activeTab = activeNestedTab(root);
  const activePanelId = panelIdForTab(activeTab);
  const nestedGroup = activeNestedGroup(root, activePanelId);

  if (!(list instanceof HTMLElement) || !(activeTab instanceof HTMLElement)) {
    deactivateNestedIndicator(root, row);
    return;
  }

  activateNestedIndicator(root, row, list, activeTab);
  if (!(nestedGroup instanceof HTMLElement)) return;
}

function bindTabTooltip(tab) {
  if (!tab.hasAttribute(frontendDataAttr("tooltip"))) {
    tab.setAttribute(frontendDataAttr("tooltip"), tabLabel(tab));
  }
  bindTooltip(tab);
}

export {
  bindTabTooltip,
  familyContainer,
  hidePane,
  hoistNestedFamily,
  initializeOwnedNodes,
  ownedNodes,
  paneForTab,
  panelIdForTab,
  scheduleOverflowSync,
  showPane,
  simplifyRouteToken,
  syncNestedGroups,
  syncNestedIndicatorRow,
  syncNestedTabsIndicator,
  uiContainer,
};
