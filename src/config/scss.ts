import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderFontsCss } from "./fonts.js";
import { renderFlagRules } from "./flags.js";
import { breakpointDeclarations } from "./breakpoints.js";
import { renderContainerRules, renderHeadingVariantRules } from "./typography.js";
import { cssComment, cssString, invalidConfig } from "./shared.js";
import { componentGroupCssName, componentTokenCssName } from "#lccfzjsnej6t";
import { FRONTEND_PREFIX, frontendDataAttr } from "#5vbaqj4pirp3";
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

/**
 * Emitted only for "smooth", and scoped to `html`: the viewport takes
 * `scroll-behavior` from the root element, so a `body` copy is redundant and
 * only makes the value harder to override. With "auto" nothing is emitted, so
 * programmatic scrolls stay instant unless a caller opts in per call.
 */
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

function buttonToneEntries(
  config: NormalizedFrontendConfig,
): Array<[string, Set<string>]> {
  const button = (config.components as Record<string, any>)?.surfaces?.button;
  const tones = button && typeof button === "object" ? button.tones : null;
  if (!tones || typeof tones !== "object" || Array.isArray(tones)) return [];
  const entries: Array<[string, Set<string>]> = [];
  const seen = new Set<string>();
  for (const [key, value] of Object.entries(tones)) {
    const name = componentTokenCssName(key);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const declared = new Set<string>(
      flattenThemeTokens((value || {}) as FrontendThemeTokens).map(
        ([tokenKey]) => componentTokenCssName(tokenKey),
      ),
    );
    entries.push([name, declared]);
  }
  return entries;
}

function buttonToneDeclarations(
  prefix: string,
  tone: string,
  state: "" | "state-hover-",
  declared: Set<string>,
): string[] {
  const surface = (part: string) => `--${prefix}-surf-btn-tone-${tone}-${state}${part}`;
  const primitive = (part: string) => `--${prefix}-ui-btn-tone-${tone}-${state}${part}`;
  const fallbackBg = state
  ? "transparent"
  : `var(--${prefix}-ui-btn-root-bg, transparent)`;
  return [
    `  --${prefix}-surf-btn-current-icon: var(${surface("icon")}, var(${primitive("icon")}, currentColor));`,
    `  border-color: var(${surface("border")}, var(${primitive("border")}, currentColor));`,
    ...(declared.has(`${state}border-style`)
      ? [`  border-style: var(${surface("border-style")}, var(${primitive("border-style")}, solid));`]
      : []),
    ...(declared.has(`${state}border-width`)
      ? [`  border-width: var(${surface("border-width")}, var(${primitive("border-width")}, var(--border-width, 1px)));`]
      : []),
    `  color: var(${surface("color")}, var(${primitive("color")}, currentColor));`,
    `  background: var(${surface("bg")}, var(${primitive("bg")}, ${fallbackBg}));`,
  ];
}

function renderButtonToneRules(config: NormalizedFrontendConfig): string[] {
  const activeAttr = frontendDataAttr("active");
  const lines: string[] = [];
  for (const [tone, declared] of buttonToneEntries(config)) {
    const selector = `.${FRONTEND_PREFIX}-button--${tone}`;
    lines.push(
      `${selector} {`,
      ...buttonToneDeclarations(config.prefix, tone, "", declared),
      "}",
      `${selector}:hover,`,
      `${selector}[aria-pressed="true"],`,
      `${selector}[${activeAttr}="true"] {`,
      ...buttonToneDeclarations(config.prefix, tone, "state-hover-", declared),
      "}",
    );
  }
  return lines;
}

/**
 * `Card` (`src/surface/components/index.tsx`) accepts a `tone` prop and emits
 * `.tbf-card--<tone>` via the same `surfaceClass()` helper `Button` uses for
 * its own tones, but until this, only the button side of that pairing had a
 * config-driven generator producing matching CSS. A configured card tone
 * therefore added a class with nothing to select it: accepted, silently
 * inert. Mirrors `buttonToneEntries`/`buttonToneDeclarations` exactly, one
 * tier down (no icon slot, and hover only matters together with
 * `interactive`).
 */
function cardToneEntries(
  config: NormalizedFrontendConfig,
): Array<[string, Set<string>]> {
  const card = (config.components as Record<string, any>)?.surfaces?.card;
  const tones = card && typeof card === "object" ? card.tones : null;
  if (!tones || typeof tones !== "object" || Array.isArray(tones)) return [];
  const entries: Array<[string, Set<string>]> = [];
  const seen = new Set<string>();
  for (const [key, value] of Object.entries(tones)) {
    const name = componentTokenCssName(key);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const declared = new Set<string>(
      flattenThemeTokens((value || {}) as FrontendThemeTokens).map(
        ([tokenKey]) => componentTokenCssName(tokenKey),
      ),
    );
    entries.push([name, declared]);
  }
  return entries;
}

function cardToneDeclarations(
  prefix: string,
  tone: string,
  state: "" | "state-hover-",
  declared: Set<string>,
): string[] {
  const surface = (part: string) => `--${prefix}-surf-card-tone-${tone}-${state}${part}`;
  const primitive = (part: string) => `--${prefix}-ui-card-tone-${tone}-${state}${part}`;
  const fallbackBg = state
  ? "transparent"
  : `var(--${prefix}-ui-card-root-bg, transparent)`;
  return [
    `  border-color: var(${surface("border")}, var(${primitive("border")}, currentColor));`,
    ...(declared.has(`${state}color`)
      ? [`  color: var(${surface("color")}, var(${primitive("color")}, inherit));`]
      : []),
    `  background: var(${surface("bg")}, var(${primitive("bg")}, ${fallbackBg}));`,
  ];
}

function renderCardToneRules(config: NormalizedFrontendConfig): string[] {
  const interactiveAttr = frontendDataAttr("interactive");
  const lines: string[] = [];
  for (const [tone, declared] of cardToneEntries(config)) {
    const selector = `.${FRONTEND_PREFIX}-card--${tone}`;
    lines.push(
      `${selector} {`,
      ...cardToneDeclarations(config.prefix, tone, "", declared),
      "}",
      `${selector}[${interactiveAttr}="true"]:hover {`,
      ...cardToneDeclarations(config.prefix, tone, "state-hover-", declared),
      "}",
    );
  }
  return lines;
}

/**
 * A generated rule that reads `var(--x)` with no fallback is inert unless the
 * same output declares `--x`. Emitting one half of that pair is silent — the
 * rule simply does nothing — so the generator refuses to produce it. Only
 * fallback-less references are checked; a reference with a fallback is allowed
 * to point at a token declared by the package stylesheets.
 */
let packageDeclaredTokens: Set<string> | null = null;

/**
 * Tokens declared by the package's own stylesheets are concatenated into the
 * same output at build time, so they count as declared even though they are
 * not part of the generated string.
 */
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
