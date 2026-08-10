import { bindTabs } from "./manager.js";

function bootTabsClient() {
  if (typeof document === "undefined") return;
  document.querySelectorAll("[data-tabs-root]").forEach((root) => {
      if (root instanceof HTMLElement) bindTabs(root);
  });
}

export { bootTabsClient };
