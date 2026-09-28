import { frontendDataSelector } from "#5vbaqj4pirp3";
import { bindTabs } from "./manager.js";

function bootTabsClient() {
  if (typeof document === "undefined") return;
  document.querySelectorAll(frontendDataSelector("tabs-root")).forEach((root) => {
      if (root instanceof HTMLElement) bindTabs(root);
  });
}

export { bootTabsClient };
