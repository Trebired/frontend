import path from "node:path";

import { collectConfigDependencies, importConfigModule, pathExists } from "./module.js";
import { TREBIRED_FRONTEND_CONFIG_PATH, normalizeTrebiredFrontendConfig } from "./normalize.js";
import { generateTrebiredFrontendScss } from "./scss.js";
import type {
  LoadTrebiredFrontendConfigOptions,
  LoadedTrebiredFrontendConfig,
  TrebiredFrontendConfig,
} from "./types.js";

function defineTrebiredFrontendConfig<T extends TrebiredFrontendConfig>(config: T): T {
  return config;
}

async function findTrebiredFrontendConfig(
  startDir: string = process.cwd(),
  boundaryDir?: string,
): Promise<string | null> {
  const boundary = path.resolve(boundaryDir || path.parse(path.resolve(startDir)).root);
  let current = path.resolve(startDir);
  for (;;) {
    const candidate = path.join(current, TREBIRED_FRONTEND_CONFIG_PATH);
    if (await pathExists(candidate)) return candidate;
    if (current === boundary || current === path.dirname(current)) return null;
    current = path.dirname(current);
  }
}

function createDefaultLoadedConfig(): LoadedTrebiredFrontendConfig {
  const config = normalizeTrebiredFrontendConfig({});
  return {
    config,
    configPath: null,
    dependencies: [],
    generatedScss: generateTrebiredFrontendScss(config),
  };
}

async function loadTrebiredFrontendConfig(
  projectRoot: string = process.cwd(),
  options: LoadTrebiredFrontendConfigOptions = {},
): Promise<LoadedTrebiredFrontendConfig> {
  const root = path.resolve(projectRoot);
  const resolvedPath = options.configPath
    ? path.resolve(root, options.configPath)
    : await findTrebiredFrontendConfig(options.searchFrom || root);

  if (!resolvedPath) {
    if (options.defaultIfMissing === false) {
      throw new Error(`trebired-frontend-config-not-found :: ${TREBIRED_FRONTEND_CONFIG_PATH}`);
    }
    return createDefaultLoadedConfig();
  }

  if (!await pathExists(resolvedPath)) {
    throw new Error(`trebired-frontend-config-not-found :: ${resolvedPath}`);
  }

  const dependencies = await collectConfigDependencies(resolvedPath);
  const config = normalizeTrebiredFrontendConfig(await importConfigModule(root, resolvedPath, dependencies));
  return {
    config,
    configPath: resolvedPath,
    dependencies,
    generatedScss: generateTrebiredFrontendScss(config),
  };
}

export {
  DEFAULT_TREBIRED_FRONTEND_CONFIG,
  SUPPORTED_ICON_PACKS,
  SYSTEM_ORDER,
  THEME_MODE_ATTRIBUTE,
  TREBIRED_FRONTEND_CONFIG_PATH,
  normalizeTrebiredFrontendConfig,
} from "./normalize.js";
export { generateTrebiredFrontendScss } from "./scss.js";
export { collectConfigDependencies } from "./module.js";
export { defineTrebiredFrontendConfig, findTrebiredFrontendConfig, loadTrebiredFrontendConfig };
export type {
  LoadTrebiredFrontendConfigOptions,
  LoadedTrebiredFrontendConfig,
  NormalizedTrebiredFrontendConfig,
  NormalizedTrebiredFrontendFontConfig,
  NormalizedTrebiredFrontendFontFamilyConfig,
  NormalizedTrebiredFrontendPaletteConfig,
  NormalizedTrebiredFrontendPaletteMode,
  NormalizedTrebiredFrontendPaletteSemantic,
  NormalizedTrebiredFrontendScalesConfig,
  NormalizedTrebiredFrontendThemeConfig,
  NormalizedTrebiredFrontendThemeMode,
  NormalizedTrebiredFrontendZIndexScaleConfig,
  TrebiredFrontendConfig,
  TrebiredFrontendFontConfig,
  TrebiredFrontendFontDisplay,
  TrebiredFrontendFontFamilyConfig,
  TrebiredFrontendFontStyle,
  TrebiredFrontendIconPack,
  TrebiredFrontendPaletteConfig,
  TrebiredFrontendPaletteFamilies,
  TrebiredFrontendPaletteMode,
  TrebiredFrontendPaletteScale,
  TrebiredFrontendPaletteSemanticRef,
  TrebiredFrontendScaleSteps,
  TrebiredFrontendScalesConfig,
  TrebiredFrontendSystemKey,
  TrebiredFrontendThemeConfig,
  TrebiredFrontendThemeMode,
  TrebiredFrontendThemeModeScheme,
  TrebiredFrontendThemeTokens,
  TrebiredFrontendZIndexScaleConfig,
} from "./types.js";
