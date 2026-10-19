import type { BindRoot } from "./../../../dom/index.js";
import { bindSourceLanguageRuntime } from "./index.js";
import type { SourceLanguageRuntimeOptions } from "./types.js";

export function bind(scope: BindRoot, options: SourceLanguageRuntimeOptions = {}) {
  bindSourceLanguageRuntime(scope, options);
}
