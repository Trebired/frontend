import { escapeHtml, text } from "#bu1nq95e3k0f";
import { frontendClassName, frontendDataAttr } from "#5vbaqj4pirp3";
import type { ServerIconCacheEntry, ServerIconRenderer } from "#6o6fqz7svsts";
import { ICON_REGISTRY_ATTR, uniqueIconSpecs } from "#yqq4li47ao7b";
import { fileTreeIconSpecs } from "#m6ckog6p21a3";

function registryIconHtml(renderer: ServerIconRenderer, spec: string) {
  const entry = renderer(spec);
  const svg = text(entry?.svg);
  if (!entry || !svg) return "";
  const brand = entry.colorMode === "brand" && entry.colorValue
  ? ` ${frontendDataAttr("icon-brand-color")}="${escapeHtml(entry.colorValue)}"`
  : "";
  const className = `${frontendClassName("icon")} ${frontendClassName("icon-glyph")}`;
  const attrs = `aria-hidden="true" class="${className}" ${frontendDataAttr("icon")}="${escapeHtml(text(entry.normalizedSpec) || spec)}"`;
  return `<i ${attrs}${brand}>${svg}</i>`;
}

function renderIconRegistryHtml(specs: readonly unknown[], renderer: ServerIconRenderer | null | undefined): string {
  if (!renderer) return "";
  const icons = uniqueIconSpecs(specs).map((spec) => registryIconHtml(renderer, spec)).join("");
  return icons ? `<div hidden ${ICON_REGISTRY_ATTR}="">${icons}</div>` : "";
}

function renderIconRegistryEntries(
  specs: readonly unknown[],
  renderer: ServerIconRenderer | null | undefined,
): Record<string, ServerIconCacheEntry> {
  const entries: Record<string, ServerIconCacheEntry> = {};
  if (!renderer) return entries;
  for (const spec of uniqueIconSpecs(specs)) {
    const entry = renderer(spec);
    if (!entry || !text(entry.svg)) continue;
    entries[text(entry.normalizedSpec) || spec] = { colorMode: entry.colorMode, colorValue: entry.colorValue, svg: entry.svg };
  }
  return entries;
}

function renderFileTreeIconEntries(tree: unknown, renderer: ServerIconRenderer | null | undefined) {
  return renderIconRegistryEntries(fileTreeIconSpecs(tree), renderer);
}

export { renderFileTreeIconEntries, renderIconRegistryEntries, renderIconRegistryHtml };
