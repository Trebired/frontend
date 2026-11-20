import { frontendDataAttr } from "#5vbaqj4pirp3";
import { MEDIA_ICON_SPECS } from "#sk3bq6u127vb";
import { parseIconSpec } from "./shared.js";

const ICON_REGISTRY_ATTR = frontendDataAttr("icon-registry");

const RUNTIME_ICON_SPECS: readonly string[] = Object.freeze([
    "remixicon arrow-down-s-line",
    "remixicon arrow-right-s-line",
    "remixicon braces-line",
    "remixicon checkbox-circle-line",
    "remixicon clipboard-line",
    "remixicon close-line",
    "remixicon code-box-line",
    "remixicon download-2-line",
    "remixicon draggable",
    "remixicon error-warning-line",
    "remixicon external-link-line",
    "remixicon fullscreen-exit-line",
    "remixicon fullscreen-line",
    "remixicon home-4-line",
    "remixicon line-chart-line",
    "remixicon search-line",
    ...MEDIA_ICON_SPECS,
]);

function uniqueIconSpecs(specs: readonly unknown[]): string[] {
  return Array.from(new Set(specs.map((spec) => parseIconSpec(spec)?.spec || "").filter(Boolean)));
}

export { ICON_REGISTRY_ATTR, RUNTIME_ICON_SPECS, uniqueIconSpecs };
