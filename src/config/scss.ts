import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderFontsCss } from "./fonts.js";
import { cssComment, cssString } from "./shared.js";
import {
  SYSTEM_ORDER,
  THEME_MODE_ATTRIBUTE,
  normalizeTrebiredFrontendConfig,
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
  NormalizedTrebiredFrontendConfig,
  NormalizedTrebiredFrontendThemeMode,
  TrebiredFrontendConfig,
  TrebiredFrontendThemeTokens,
} from "./types.js";

const SYSTEM_STYLE_FILES: Partial<Record<string, string>> = {
  actions: "actions/styles/index.scss",
  flash: "flash/styles/index.scss",
  graph: "graph/styles/index.scss",
  icons: "icons/styles/index.scss",
  inputs: "inputs/styles/index.scss",
  layer: "layer/styles/index.scss",
  layout: "layout/styles/index.scss",
  modal: "modal/styles/index.scss",
  popover: "popover/styles/index.scss",
  progress: "progress/styles/index.scss",
  sidebar: "sidebar/styles/index.scss",
  surface: "surface/styles/index.scss",
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

function isNormalizedConfig(value: unknown): value is NormalizedTrebiredFrontendConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const config = value as Partial<NormalizedTrebiredFrontendConfig>;
  return Array.isArray(config.fonts?.families) &&
    Array.isArray(config.theme?.modes) &&
    Array.isArray(config.palette?.modes);
}

function tokenDeclarations(prefix: string, tokens: TrebiredFrontendThemeTokens): string[] {
  return flattenThemeTokens(tokens).map(([key, value]) => `  --${prefix}-${key}: ${String(value)};`);
}

function rootDeclarations(config: NormalizedTrebiredFrontendConfig): string[] {
  const { modes, defaultMode } = config.theme;
  return [
    `  --${config.prefix}-config-prefix: ${cssString(config.prefix)};`,
    `  --${config.prefix}-icon-endpoint: ${cssString(config.icons.endpoint)};`,
    ...(modes.length ? [`  --${config.prefix}-theme-modes: ${cssString(modes.map((mode) => mode.key).join(" "))};`] : []),
    ...(defaultMode ? [`  --${config.prefix}-theme-default: ${cssString(defaultMode)};`] : []),
    ...tokenDeclarations(config.prefix, config.theme.tokens),
    ...paletteSemanticDeclarations(config.palette),
    ...paletteSuffixedDeclarations(config.palette),
  ];
}

function modeDeclarations(
  config: NormalizedTrebiredFrontendConfig,
  mode: NormalizedTrebiredFrontendThemeMode,
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

function renderModeBlocks(config: NormalizedTrebiredFrontendConfig): string[] {
  return config.theme.modes.flatMap((mode) => [
    "",
    `/* theme mode: ${cssComment(mode.key)} */`,
    ...renderBlock(`[${THEME_MODE_ATTRIBUTE}="${mode.key}"]`, modeDeclarations(config, mode)),
  ]);
}

function renderSystemPreferenceBlock(
  config: NormalizedTrebiredFrontendConfig,
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

function renderThemeCss(config: NormalizedTrebiredFrontendConfig): string[] {
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

function renderSystemImports(config: NormalizedTrebiredFrontendConfig): string[] {
  const lines: string[] = [];
  for (const system of SYSTEM_ORDER) {
    const stylePath = SYSTEM_STYLE_FILES[system];
    if (stylePath && config.systems[system]) lines.push(packageStyleUse(stylePath));
  }
  return lines;
}

function generateTrebiredFrontendScss(
  configInput: TrebiredFrontendConfig | NormalizedTrebiredFrontendConfig,
): string {
  const config = isNormalizedConfig(configInput)
    ? configInput
    : normalizeTrebiredFrontendConfig(configInput);
  const scalesCss = renderScalesCss(config.scales);
  const lines = [
    "/* Generated by @trebired/frontend. Do not edit directly. */",
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

export { generateTrebiredFrontendScss };
