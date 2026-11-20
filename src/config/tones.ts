import { componentTokenCssName } from "#lccfzjsnej6t";
import { FRONTEND_PREFIX, frontendDataAttr } from "#5vbaqj4pirp3";
import { flattenThemeTokens } from "./theme.js";
import type { FrontendThemeTokens, NormalizedFrontendConfig } from "./types.js";

function buttonVariantEntries(
  config: NormalizedFrontendConfig,
): Array<[string, Set<string>]> {
  const button = (config.components as Record<string, any>)?.surfaces?.button;
  const variants = button && typeof button === "object" ? button.variants : null;
  if (!variants || typeof variants !== "object" || Array.isArray(variants)) return [];
  const entries: Array<[string, Set<string>]> = [];
  const seen = new Set<string>();
  for (const [key, value] of Object.entries(variants)) {
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

function buttonVariantDeclarations(
  prefix: string,
  variant: string,
  state: "" | "state-hover-",
  declared: Set<string>,
): string[] {
  const surface = (part: string) => `--${prefix}-surf-btn-variants-${variant}-${state}${part}`;
  const primitive = (part: string) => `--${prefix}-ui-btn-variants-${variant}-${state}${part}`;
  const property = (key: string, line: string) => (declared.has(`${state}${key}`) ? [line] : []);
  return [
    ...property("icon", `  --${prefix}-surf-btn-current-icon: var(${surface("icon")}, var(${primitive("icon")}, currentColor));`),
    ...property("border", `  border-color: var(${surface("border")}, var(${primitive("border")}, currentColor));`),
    ...property("border-style", `  border-style: var(${surface("border-style")}, var(${primitive("border-style")}, solid));`),
    ...property("border-width", `  border-width: var(${surface("border-width")}, var(${primitive("border-width")}, var(--border-width, 1px)));`),
    ...property("color", `  color: var(${surface("color")}, var(${primitive("color")}, currentColor));`),
    ...property("bg", `  background: var(${surface("bg")}, var(${primitive("bg")}, transparent));`),
  ];
}

function renderButtonVariantRules(config: NormalizedFrontendConfig): string[] {
  const activeAttr = frontendDataAttr("active");
  const lines: string[] = [];
  for (const [variant, declared] of buttonVariantEntries(config)) {
    const selector = `.${FRONTEND_PREFIX}-button--${variant}`;
    const root = buttonVariantDeclarations(config.prefix, variant, "", declared);
    const hover = buttonVariantDeclarations(config.prefix, variant, "state-hover-", declared);
    if (root.length) lines.push(`${selector} {`, ...root, "}");
    if (hover.length) {
      lines.push(
        `${selector}:hover,`,
        `${selector}[aria-pressed="true"],`,
        `${selector}[${activeAttr}="true"] {`,
        ...hover,
        "}",
      );
    }
  }
  return lines;
}

export { renderButtonVariantRules };
