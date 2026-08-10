import { flash as defaultFlash } from "#33o6e7mug9pg";
import type { UploadRuntimeOptions } from "./types.js";

function resolveUploadFlash(options: UploadRuntimeOptions = {}) {
  return options.flash || defaultFlash;
}

export { resolveUploadFlash };
