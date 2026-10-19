import type { BindRoot } from "./../dom/index.js";
import { bindEditors } from "./index.js";

export function bind(scope: BindRoot) {
  bindEditors(scope);
}
