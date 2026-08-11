import type { IconServerOptions, MaterialFileIconOptions } from "./types.js";

const DEFAULT_ICON_SERVER_PACKS = Object.freeze([
    "remixicon",
    "simple-icons",
    "material-icon-theme",
]);

const DEFAULT_ICON_SOURCE_COLOR_PACKS = Object.freeze(["material-icon-theme"]);

function createIconServerOptions(
  options: IconServerOptions = {},
): IconServerOptions {
  return {
    ...options,
    packs: options.packs || DEFAULT_ICON_SERVER_PACKS,
    preserveSourceColors:
    options.preserveSourceColors === undefined
    ? DEFAULT_ICON_SOURCE_COLOR_PACKS
    : options.preserveSourceColors,
  };
}

function createMaterialFileIconOptions(
  options: MaterialFileIconOptions = {},
): MaterialFileIconOptions {
  return createIconServerOptions(options) as MaterialFileIconOptions;
}

export {
  createIconServerOptions,
  createMaterialFileIconOptions,
  DEFAULT_ICON_SERVER_PACKS,
  DEFAULT_ICON_SOURCE_COLOR_PACKS,
};
