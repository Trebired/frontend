import path from "node:path";

import { collectConfigDependencies, importConfigModule, pathExists } from "./module.js";
import { FRONTEND_CONFIG_PATH, normalizeFrontendConfig } from "./normalize.js";
import { generateFrontendScss } from "./scss.js";
import type {
  LoadFrontendConfigOptions,
  LoadedFrontendConfig,
  FrontendConfig,
} from "./types.js";

function defineFrontendConfig<T extends FrontendConfig>(config: T): T {
  return config;
}

async function findFrontendConfig(
  startDir: string = process.cwd(),
  boundaryDir?: string,
): Promise<string | null> {
  const boundary = path.resolve(boundaryDir || path.parse(path.resolve(startDir)).root);
  let current = path.resolve(startDir);
  for (;;) {
    const candidate = path.join(current, FRONTEND_CONFIG_PATH);
    if (await pathExists(candidate)) return candidate;
    if (current === boundary || current === path.dirname(current)) return null;
    current = path.dirname(current);
  }
}

function createDefaultLoadedConfig(): LoadedFrontendConfig {
  const config = normalizeFrontendConfig({});
  return {
    config,
    configPath: null,
    dependencies: [],
    generatedScss: generateFrontendScss(config),
  };
}

async function loadFrontendConfig(
  projectRoot: string = process.cwd(),
  options: LoadFrontendConfigOptions = {},
): Promise<LoadedFrontendConfig> {
  const root = path.resolve(projectRoot);
  const resolvedPath = options.configPath
    ? path.resolve(root, options.configPath)
    : await findFrontendConfig(options.searchFrom || root);

  if (!resolvedPath) {
    if (options.defaultIfMissing === false) {
      throw new Error(`frontend-config-not-found :: ${FRONTEND_CONFIG_PATH}`);
    }
    return createDefaultLoadedConfig();
  }

  if (!await pathExists(resolvedPath)) {
    throw new Error(`frontend-config-not-found :: ${resolvedPath}`);
  }

  const dependencies = await collectConfigDependencies(resolvedPath);
  const config = normalizeFrontendConfig(await importConfigModule(root, resolvedPath, dependencies));
  return {
    config,
    configPath: resolvedPath,
    dependencies,
    generatedScss: generateFrontendScss(config),
  };
}

export {
  DEFAULT_FRONTEND_CONFIG,
  SUPPORTED_ICON_PACKS,
  SYSTEM_ORDER,
  THEME_MODE_ATTRIBUTE,
  FRONTEND_CONFIG_PATH,
  normalizeFrontendConfig,
} from "./normalize.js";
export { generateFrontendScss } from "./scss.js";
export { collectConfigDependencies } from "./module.js";
export { defineFrontendConfig, findFrontendConfig, loadFrontendConfig };
export type {
  LoadFrontendConfigOptions,
  LoadedFrontendConfig,
  NormalizedFrontendActiveInteractionConfig,
  NormalizedFrontendConfig,
  NormalizedFrontendComponentsConfig,
  NormalizedFrontendFontConfig,
  NormalizedFrontendFontFamilyConfig,
  NormalizedFrontendInteractionsConfig,
  NormalizedFrontendPaletteConfig,
  NormalizedFrontendPaletteMode,
  NormalizedFrontendPaletteSemantic,
  NormalizedFrontendScalesConfig,
  NormalizedFrontendThemeConfig,
  NormalizedFrontendThemeMode,
  NormalizedFrontendZIndexScaleConfig,
  FrontendConfig,
  FrontendActiveInteractionConfig,
  FrontendComponentTokens,
  FrontendComponentsConfig,
  FrontendFontConfig,
  FrontendFontDisplay,
  FrontendFontFamilyConfig,
  FrontendFontStyle,
  FrontendIconPack,
  FrontendInteractionsConfig,
  FrontendPaletteConfig,
  FrontendPaletteFamilies,
  FrontendPaletteMode,
  FrontendPaletteScale,
  FrontendPaletteSemanticRef,
  FrontendScaleSteps,
  FrontendScalesConfig,
  FrontendSystemKey,
  FrontendThemeConfig,
  FrontendThemeMode,
  FrontendThemeModeScheme,
  FrontendThemeTokens,
  FrontendZIndexScaleConfig,
} from "./types.js";
