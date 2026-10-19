import type { BindRoot } from "./../dom/index.js";
import { bindFullscreen } from "./index.js";

export function bind(scope: BindRoot) {
  bindFullscreen(scope);
}
