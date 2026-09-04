import { componentTokenCssName } from "#lccfzjsnej6t";
import { FRONTEND_PREFIX, frontendDataAttr } from "#5vbaqj4pirp3";
import { flattenThemeTokens } from "./theme.js";
import type { FrontendThemeTokens, NormalizedFrontendConfig } from "./types.js";

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

export { renderButtonToneRules, renderCardToneRules };
