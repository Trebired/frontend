import type { BindRoot } from "./../dom/index.js";
import { bindLiveCards, bindLiveLists, type LiveSubscribe } from "./index.js";

export function bind(scope: BindRoot, subscribe?: LiveSubscribe) {
  bindLiveCards(scope, { subscribe });
  bindLiveLists(scope, { subscribe });
}
