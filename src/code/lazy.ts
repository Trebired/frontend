import type { BindRoot } from "./../dom/index.js";
import { bindCodeBlocks } from "./index.js";

export function bind(scope: BindRoot) {
  bindCodeBlocks(scope);
}
