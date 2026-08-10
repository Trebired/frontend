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
export { createFrontendTokenHelpers } from "./tokens.js";
export { defineFrontendConfig, findFrontendConfig, loadFrontendConfig };
export type {
  LoadFrontendConfigOptions,
  LoadedFrontendConfig,
  NormalizedFrontendActivePressInteractionConfig,
  NormalizedFrontendAssetsConfig,
  NormalizedFrontendConfig,
  NormalizedFrontendComponentsConfig,
  NormalizedFrontendDesignConfig,
  NormalizedFrontendDesignInteractionsConfig,
  NormalizedFrontendFontConfig,
  NormalizedFrontendFontFamilyConfig,
  NormalizedFrontendPaletteConfig,
  NormalizedFrontendPaletteMode,
  NormalizedFrontendPaletteSemantic,
  NormalizedFrontendRuntimeConfig,
  NormalizedFrontendScalesConfig,
  NormalizedFrontendThemeConfig,
  NormalizedFrontendThemeMode,
  NormalizedFrontendZIndexScaleConfig,
  FrontendConfig,
  FrontendActivePressInteractionConfig,
  FrontendAssetsConfig,
  FrontendComponentTokens,
  FrontendComponentsConfig,
  FrontendDataComponentsConfig,
  FrontendDesignConfig,
  FrontendDesignInteractionsConfig,
  FrontendFeedbackComponentsConfig,
  FrontendFontConfig,
  FrontendFontDisplay,
  FrontendFontFamilyConfig,
  FrontendFontStyle,
  FrontendIconPack,
  FrontendOverlayComponentsConfig,
  FrontendPaletteConfig,
  FrontendPaletteFamilies,
  FrontendPaletteMode,
  FrontendPaletteScale,
  FrontendPaletteSemanticRef,
  FrontendPrimitiveComponentsConfig,
  FrontendRuntimeConfig,
  FrontendScaleSteps,
  FrontendScalesConfig,
  FrontendShellComponentsConfig,
  FrontendSurfaceComponentsConfig,
  FrontendSystemKey,
  FrontendThemeConfig,
  FrontendThemeMode,
  FrontendThemeModeScheme,
  FrontendThemeTokens,
  FrontendZIndexScaleConfig,
} from "./types.js";
export type {
  FrontendConfigTokenHelpers,
  FrontendConfigVariableHelper,
  FrontendCssVariable,
  FrontendCssVariableWithFallback,
  FrontendPaletteFamily,
  FrontendPaletteModeKey,
  FrontendPaletteSemanticToken,
  FrontendPaletteStep,
} from "./tokens.js";
