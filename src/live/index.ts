import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { refreshLive, type LiveOptions } from "./regions.js";
import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";

const LIVE_REFRESH_SELECTOR = frontendDataSelector("live-refresh");

function bindLiveRefresh(root: BindRoot = document, options: LiveOptions = {}) {
  queryAll<HTMLElement>(root, LIVE_REFRESH_SELECTOR).forEach((trigger) => {
      if (trigger.hasAttribute(frontendDataAttr("live-bound"))) return;
      trigger.setAttribute(frontendDataAttr("live-bound"), "true");
      trigger.addEventListener("click", (event) => {
          event.preventDefault();
          const url = trigger.getAttribute(frontendDataAttr("live-url")) || undefined;
          void refreshLive({ ...options, url });
      });
  });
}

export { LIVE_REFRESH_SELECTOR, bindLiveRefresh };
export type { LiveOptions };
export *from "./cards.js";
export *from "./connections.js";
export *from "./infinite.js";
export *from "./lists.js";
export *from "./overlays.js";
export *from "./page.js";
export *from "./regions.js";
export *from "./router.js";
export *from "./scroll-overflow.js";
export *from "./socket.js";
export *from "./state.js";
