import type { BindRoot } from "./../dom/index.js";
import { bindLogsRuntime } from "./index.js";

export function bind(scope: BindRoot) {
  bindLogsRuntime(scope);
}
