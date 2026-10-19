import type { BindRoot } from "./../dom/index.js";
import { bindGraphs } from "./index.js";

export function bind(scope: BindRoot) {
  bindGraphs(scope);
}
