import { DYNAMIC_SIDEBAR_DISABLED_LINK_SELECTOR } from "./selectors.js";

const disabledLinkRoots = new WeakSet<HTMLElement>();

function bindDynamicSidebarDisabledLinkGuard(root: HTMLElement) {
  if (disabledLinkRoots.has(root)) return;
  disabledLinkRoots.add(root);
  root.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target
      ? target.closest(DYNAMIC_SIDEBAR_DISABLED_LINK_SELECTOR)
      : null;
    if (!link || !root.contains(link)) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
}

export { bindDynamicSidebarDisabledLinkGuard };
