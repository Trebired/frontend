import { toString } from "#dqy2d22qyujv";
import { ownedNodes, panelIdForTab, simplifyRouteToken } from "./dom";
import { registeredTabRoots } from "./registry";

function familyKeyForRoot(root) {
  return root instanceof HTMLElement
  ? toString(root.getAttribute("data-tabs-family-key"))
  : "";
}

function routeParamNameForFamily(familyKey) {
  const value = toString(familyKey);
  return value ? `tab-${value}` : "";
}

function routeParamNameForRoot(root) {
  return routeParamNameForFamily(familyKeyForRoot(root));
}

function activeTabForRoot(root) {
  return (
    ownedNodes(root, "[data-tab-button]").find((tab) => {
        return (
          tab instanceof HTMLElement &&
            tab.getAttribute("aria-selected") === "true"
        );
    }) || null
  );
}

function tabToken(tab) {
  if (!(tab instanceof HTMLElement)) return "";
  const route = toString(
    tab && tab.getAttribute ? tab.getAttribute("data-tab-route") : "",
  );
  if (route) return route;
  if (tab instanceof HTMLAnchorElement) {
    const href = toString(tab.getAttribute("href"));
    if (href.startsWith("#")) return toString(href.slice(1));
  }
  return (
    toString(tab.getAttribute("value")) ||
      simplifyRouteToken(panelIdForTab(tab))
  );
}

function isRootVisible(root) {
  return (
    root instanceof HTMLElement &&
      !(typeof root.closest === "function" && root.closest("[hidden]"))
  );
}

function routeTokenForRoot(root) {
  const key = routeParamNameForRoot(root);
  if (!key) return "";
  return toString(new URLSearchParams(location.search).get(key) || "");
}

function writeRoute() {
  const params = new URLSearchParams(location.search);
  const visibleRoots = registeredTabRoots().filter(isRootVisible);

  visibleRoots
  .map((node) => routeParamNameForRoot(node))
  .filter(Boolean)
  .forEach((key) => params.delete(key));

  for (const node of visibleRoots) {
    const key = routeParamNameForRoot(node);
    const token = tabToken(activeTabForRoot(node));
    if (key && token) params.set(key, token);
  }

  const search = params.toString();
  history.replaceState(
    null,
    "",
    `${location.pathname}${search ? `?${search}` : ""}${location.hash}`,
  );
}

export {
  familyKeyForRoot,
  isRootVisible,
  routeTokenForRoot,
  tabToken,
  routeParamNameForFamily,
  writeRoute,
};
