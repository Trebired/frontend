import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderFontsCss } from "./fonts.js";
import { renderFlagRules } from "./flags.js";
import { breakpointDeclarations } from "./breakpoints.js";
import { renderContainerRules, renderHeadingVariantRules } from "./typography.js";
import { cssComment, cssString, invalidConfig } from "./shared.js";
import { componentGroupCssName, componentTokenCssName } from "#lccfzjsnej6t";
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
import { renderButtonToneRules, renderCardToneRules } from "./tones.js";
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

function packageStyleLoad(relativePath: string): string {
  return `@include meta.load-css(${cssString(packageStylePath(relativePath))});`;
}

function isNormalizedConfig(value: unknown): value is NormalizedFrontendConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const config = value as Partial<NormalizedFrontendConfig>;
  return Array.isArray(config.assets?.fonts?.families) &&
    Array.isArray(config.runtime?.theme?.modes) &&
    Array.isArray(config.design?.palette?.modes);
}

function tokenDeclarations(prefix: string, tokens: FrontendThemeTokens): string[] {
  return flattenThemeTokens(tokens).map(
    ([key, value]) => `  --${prefix}-${componentTokenCssName(key)}: ${String(value)};`,
  );
}

function componentTokenDeclarations(config: NormalizedFrontendConfig): string[] {
  const lines: string[] = [];
  for (const [componentGroup, tokens] of Object.entries(config.components)) {
    const componentKey = componentGroupCssName(componentGroup);
    for (const [key, value] of flattenThemeTokens(tokens)) {
      lines.push(`  --${config.prefix}-${componentKey}-${componentTokenCssName(key)}: ${String(value)};`);
    }
  }
  return lines;
}

function rootDeclarations(config: NormalizedFrontendConfig): string[] {
  const { modes, defaultMode } = config.runtime.theme;
  return [
    `  --${config.prefix}-config-prefix: ${cssString(config.prefix)};`,
    `  --${config.prefix}-icon-endpoint: ${cssString(config.assets.icons.endpoint)};`,
    `  --${config.prefix}-icon-mode: ${cssString(config.assets.icons.mode)};`,
    `  --${config.prefix}-interaction-active-filter: ${config.design.interactions.activePress.filter};`,
    ...breakpointDeclarations(config.prefix, config.design.breakpoints),
    ...(modes.length ? [`  --${config.prefix}-theme-modes: ${cssString(modes.map((mode) => mode.key).join(" "))};`] : []),
    ...(defaultMode ? [`  --${config.prefix}-theme-default: ${cssString(defaultMode)};`] : []),
    ...tokenDeclarations(config.prefix, config.design.semantics),
    ...tokenDeclarations(config.prefix, config.runtime.theme.tokens),
    ...tokenDeclarations(`${config.prefix}-runtime`, {
        layer: config.runtime.layer,
        layout: config.runtime.layout,
        progress: config.runtime.progress,
    }),
    ...componentTokenDeclarations(config),
    ...paletteSemanticDeclarations(config.design.palette),
    ...paletteSuffixedDeclarations(config.design.palette),
  ];
}

function modeDeclarations(
  config: NormalizedFrontendConfig,
  mode: NormalizedFrontendThemeMode,
): string[] {
  const paletteMode = findPaletteMode(config.design.palette, mode.key);
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
  return config.runtime.theme.modes.flatMap((mode) => [
      "",
      `/* theme mode: ${cssComment(mode.key)} */`,
      ...renderBlock(`[${THEME_MODE_ATTRIBUTE}="${mode.key}"]`, modeDeclarations(config, mode)),
  ]);
}

function renderSystemPreferenceBlock(
  config: NormalizedFrontendConfig,
  scheme: "dark" | "light",
): string[] {
  const key = scheme === "dark" ? config.runtime.theme.dark : config.runtime.theme.light;
  const mode = config.runtime.theme.modes.find((item) => item.key === key);
  if (!mode) return [];
  return [
    "",
    `@media (prefers-color-scheme: ${scheme}) {`,
    ...renderBlock(`:root:not([${THEME_MODE_ATTRIBUTE}])`, modeDeclarations(config, mode), "  "),
    "}",
  ];
}

function renderThemeCss(config: NormalizedFrontendConfig): string[] {
  if (!config.runtime.theme.cssVariables) return [];
  return [
    "",
    ...renderBlock(":root", rootDeclarations(config)),
    ...renderModeBlocks(config),
    ...renderSystemPreferenceBlock(config, "dark"),
    ...renderSystemPreferenceBlock(config, "light"),
  ];
}

function renderScrollBehaviorCss(config: NormalizedFrontendConfig): string[] {
  if (config.design.scrollBehavior !== "smooth") return [];
  return ["", ...renderBlock("html", ["  scroll-behavior: smooth;"])];
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
    if (stylePath && config.systems[system]) lines.push(packageStyleLoad(stylePath));
  }
  return lines;
}

let packageDeclaredTokens: Set<string>|null = null;

function packageStyleDeclarations(prefix: string): Set<string> {
  if (packageDeclaredTokens) return packageDeclaredTokens;
  const names = new Set<string>();
  for (const relative of ["styles/tokens.scss", "styles/utils/base.scss"]) {
    try {
      const source = fs.readFileSync(packageStylePath(relative), "utf8");
      for (const match of source.matchAll(/ns\.css-var\("([^"]+)"\)\s*\}?\s*:/gu)) {
        names.add(`--${prefix}-${match[1] as string}`);
      }
    } catch {
      continue;
    }
  }
  packageDeclaredTokens = names;
  return names;
}

function assertGeneratedVariablesResolve(prefix: string, lines: string[]): void {
  const css = lines.join("\n");
  const declared = new Set([
      ...[...css.matchAll(/^\s*(--[A-Za-z0-9_-]+)\s*:/gmu)].map((match) => match[1] as string),
      ...packageStyleDeclarations(prefix),
  ]);
  const missing = new Set<string>();
  for (const match of css.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)\s*\)/gu)) {
    const name = match[1] as string;
    if (!name.startsWith(`--${prefix}-`)) continue;
    if (!declared.has(name)) missing.add(name);
  }
  if (missing.size) {
    throw invalidConfig(
      `generated css references undeclared variables :: ${Array.from(missing).sort().join(", ")}`,
    );
  }
}

function generateFrontendScss(
  configInput: FrontendConfig | NormalizedFrontendConfig,
): string {
  const config = isNormalizedConfig(configInput)
  ? configInput
  : normalizeFrontendConfig(configInput);
  const scalesCss = renderScalesCss(config.design.scales);
  const lines = [
    "/* Generated by frontend package config. Do not edit directly. */",
    `/* prefix: ${cssComment(config.prefix)} */`,
    '@use "sass:meta";',
    ...renderFontsCss(config.assets.fonts),
    ...renderFlagRules(config.assets.flags),
    packageStyleLoad("styles/tokens.scss"),
    packageStyleLoad("styles/utils.scss"),
    ...renderSystemImports(config),
    ...renderScrollBehaviorCss(config),
    ...renderThemeCss(config),
    ...renderScalesRootBlock(scalesCss.vars),
    ...renderScalesBody(scalesCss.body),
    ...renderButtonToneRules(config),
    ...renderCardToneRules(config),
    ...renderContainerRules(config),
    ...renderHeadingVariantRules(config),
  ];
  assertGeneratedVariablesResolve(config.prefix, lines);
  return `${lines.join("\n")}\n`;
}

export { generateFrontendScss };
