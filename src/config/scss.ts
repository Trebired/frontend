import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderFontsCss } from "./fonts.js";
import { cssComment, cssString } from "./shared.js";
import {
  SYSTEM_ORDER,
  THEME_MODE_ATTRIBUTE,
  normalizeFrontendConfig,
} from "./normalize.js";
import {
  findPaletteMode,
  paletteModeScaleDeclarations,
  paletteSemanticDeclarations,
  paletteSuffixedDeclarations,
} from "./palette.js";
import { renderScalesCss } from "./scales-css.js";
import { flattenThemeTokens } from "./theme.js";
import type {
  NormalizedFrontendConfig,
  NormalizedFrontendThemeMode,
  FrontendConfig,
  FrontendThemeTokens,
} from "./types.js";

const SYSTEM_STYLE_FILES: Partial<Record<string, string>> = {
  actions: "actions/styles/index.scss",
  code: "code/styles/index.scss",
  editor: "editor/styles/index.scss",
  explorer: "explorer/styles/index.scss",
  flash: "flash/styles/index.scss",
  graph: "graph/styles/index.scss",
  icons: "icons/styles/index.scss",
  inputs: "inputs/styles/index.scss",
  language: "language/styles/index.scss",
  layer: "layer/styles/index.scss",
  layout: "layout/styles/index.scss",
  logs: "logs/styles/index.scss",
  modal: "modal/styles/index.scss",
  popover: "popover/styles/index.scss",
  primitives: "primitives/styles/index.scss",
  progress: "progress/styles/index.scss",
  sidebar: "sidebar/styles/index.scss",
  surface: "surface/styles/index.scss",
  theme: "theme/styles/index.scss",
  tooltip: "tooltip/styles/index.scss",
  fullscreen: "fullscreen/styles/index.scss",
};

function packageStylePath(relativePath: string): string {
  const configDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(configDir, "..", relativePath).replace(/\\/gu, "/");
}

function packageStyleUse(relativePath: string): string {
  return `@use ${cssString(packageStylePath(relativePath))} as *;`;
}

function isNormalizedConfig(value: unknown): value is NormalizedFrontendConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const config = value as Partial<NormalizedFrontendConfig>;
  return Array.isArray(config.fonts?.families) &&
    Array.isArray(config.theme?.modes) &&
    Array.isArray(config.palette?.modes);
}

function tokenDeclarations(prefix: string, tokens: FrontendThemeTokens): string[] {
  return flattenThemeTokens(tokens).map(([key, value]) => `  --${prefix}-${key}: ${String(value)};`);
}

function cssTokenKey(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/gu, "$1-$2").toLowerCase();
}

function componentCssTokenKey(value: string): string {
  if (value === "actionButton") return "action-control";
  return cssTokenKey(value);
}

function componentTokenDeclarations(config: NormalizedFrontendConfig): string[] {
  const lines: string[] = [];
  for (const [component, tokens] of Object.entries(config.components)) {
    const componentKey = componentCssTokenKey(component);
    for (const [key, value] of flattenThemeTokens(tokens)) {
      lines.push(`  --${config.prefix}-${componentKey}-${cssTokenKey(key)}: ${String(value)};`);
    }
  }
  return lines;
}

function rootDeclarations(config: NormalizedFrontendConfig): string[] {
  const { modes, defaultMode } = config.theme;
  return [
    `  --${config.prefix}-config-prefix: ${cssString(config.prefix)};`,
    `  --${config.prefix}-icon-endpoint: ${cssString(config.icons.endpoint)};`,
    ...(modes.length ? [`  --${config.prefix}-theme-modes: ${cssString(modes.map((mode) => mode.key).join(" "))};`] : []),
    ...(defaultMode ? [`  --${config.prefix}-theme-default: ${cssString(defaultMode)};`] : []),
    ...tokenDeclarations(config.prefix, config.theme.tokens),
    ...componentTokenDeclarations(config),
    ...paletteSemanticDeclarations(config.palette),
    ...paletteSuffixedDeclarations(config.palette),
  ];
}

function modeDeclarations(
  config: NormalizedFrontendConfig,
  mode: NormalizedFrontendThemeMode,
): string[] {
  const paletteMode = findPaletteMode(config.palette, mode.key);
  return [
    `  color-scheme: ${mode.scheme};`,
    ...tokenDeclarations(config.prefix, mode.tokens),
    ...(paletteMode ? paletteModeScaleDeclarations(paletteMode) : []),
  ];
}

function renderBlock(selector: string, declarations: string[], indent = ""): string[] {
  if (!declarations.length) return [];
  return [
    `${indent}${selector} {`,
    ...declarations.map((line) => `${indent}${line}`),
    `${indent}}`,
  ];
}

function renderModeBlocks(config: NormalizedFrontendConfig): string[] {
  return config.theme.modes.flatMap((mode) => [
    "",
    `/* theme mode: ${cssComment(mode.key)} */`,
    ...renderBlock(`[${THEME_MODE_ATTRIBUTE}="${mode.key}"]`, modeDeclarations(config, mode)),
  ]);
}

function renderSystemPreferenceBlock(
  config: NormalizedFrontendConfig,
  scheme: "dark" | "light",
): string[] {
  const key = scheme === "dark" ? config.theme.dark : config.theme.light;
  const mode = config.theme.modes.find((item) => item.key === key);
  if (!mode) return [];
  return [
    "",
    `@media (prefers-color-scheme: ${scheme}) {`,
    ...renderBlock(`:root:not([${THEME_MODE_ATTRIBUTE}])`, modeDeclarations(config, mode), "  "),
    "}",
  ];
}

function renderThemeCss(config: NormalizedFrontendConfig): string[] {
  if (!config.theme.cssVariables) return [];
  return [
    "",
    ...renderBlock(":root", rootDeclarations(config)),
    ...renderModeBlocks(config),
    ...renderSystemPreferenceBlock(config, "dark"),
    ...renderSystemPreferenceBlock(config, "light"),
  ];
}

function renderScalesRootBlock(vars: string[]): string[] {
  if (!vars.length) return [];
  return ["", ...renderBlock(":root", vars)];
}

function renderScalesBody(body: string[]): string[] {
  if (!body.length) return [];
  return ["", ...body];
}

function renderSystemImports(config: NormalizedFrontendConfig): string[] {
  const lines: string[] = [];
  for (const system of SYSTEM_ORDER) {
    const stylePath = SYSTEM_STYLE_FILES[system];
    if (stylePath && config.systems[system]) lines.push(packageStyleUse(stylePath));
  }
  return lines;
}

function generateFrontendScss(
  configInput: FrontendConfig | NormalizedFrontendConfig,
): string {
  const config = isNormalizedConfig(configInput)
    ? configInput
    : normalizeFrontendConfig(configInput);
  const scalesCss = renderScalesCss(config.scales);
  const lines = [
    "/* Generated by frontend package config. Do not edit directly. */",
    `/* prefix: ${cssComment(config.prefix)} */`,
    packageStyleUse("styles/tokens.scss"),
    packageStyleUse("styles/utils.scss"),
    ...renderSystemImports(config),
    ...renderFontsCss(config.fonts),
    ...renderThemeCss(config),
    ...renderScalesRootBlock(scalesCss.vars),
    ...renderScalesBody(scalesCss.body),
  ];
  return `${lines.join("\n")}\n`;
}

export { generateFrontendScss };
