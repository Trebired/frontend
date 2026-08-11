import {
  classNames,
  escapeHtml,
  toText as text,
} from "#ndsvdqv80epr";

type IconPack = string;

type ParsedIconSpec = {
  icon: string;
  pack: IconPack;
  spec: string;
};

const SUPPORTED_ICON_PACKS: IconPack[] = ["remixicon", "simple-icons"];

function normalizeSpace(value: unknown): string {
  return text(value).replace(/\s+/gu, " ");
}

function normalizeIconName(value: unknown): string {
  return text(value)
  .replace(/\.svg$/iu, "")
  .toLowerCase();
}

function normalizeIconPack(value: unknown): IconPack | "" {
  const pack = text(value).toLowerCase().replace(/_/gu, "-");
  if (pack === "simpleicons") return "simple-icons";
  return /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/u.test(pack)
  ? pack
  : "";
}

function iconSpec(pack: unknown, name: unknown): string {
  const normalizedPack = normalizeIconPack(pack);
  const icon = normalizeIconName(name);
  return normalizedPack && icon ? `${normalizedPack}:${icon}` : "";
}

function parseIconSpec(value: unknown): ParsedIconSpec | null {
  const spec = normalizeSpace(value);
  if (!spec) return null;

  const colonIndex = spec.indexOf(":");
  if (colonIndex > 0 && colonIndex < spec.length - 1) {
    const pack = normalizeIconPack(spec.slice(0, colonIndex));
    const icon = normalizeIconName(spec.slice(colonIndex + 1));
    return pack && icon ? { icon, pack, spec: `${pack}:${icon}` } : null;
  }

  const spaceIndex = spec.indexOf(" ");
  if (spaceIndex > 0 && spaceIndex < spec.length - 1) {
    const pack = normalizeIconPack(spec.slice(0, spaceIndex));
    const icon = normalizeIconName(spec.slice(spaceIndex + 1));
    return pack && icon ? { icon, pack, spec: `${pack}:${icon}` } : null;
  }

  return null;
}

function normalizeHexColor(value: unknown): string {
  const hex = text(value).replace(/^#/u, "");
  return /^[0-9a-f]{6}$/iu.test(hex) ? `#${hex}` : "";
}

function normalizeDerivedColor(value: unknown): string {
  const raw = text(value);
  if (!raw || raw === "none" || raw === "currentColor" || raw === "transparent") return "";
  const full = normalizeHexColor(raw);
  if (full) return full;
  const shortHex = raw.replace(/^#/u, "");
  if (/^[0-9a-f]{3}$/iu.test(shortHex)) {
    return `#${shortHex.split("").map((char) => `${char}${char}`).join("")}`;
  }
  const rgbMatch = raw.match(/^rgba?\(([^)]+)\)$/iu);
if (!rgbMatch) return "";
const parts = String(rgbMatch[1] || "")
.split(",")
.map((part) => Number(String(part || "").trim()))
.slice(0, 3);
if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part) || part < 0 || part > 255)) {
  return "";
}
return `#${parts.map((part) => Math.round(part).toString(16).padStart(2, "0")).join("")}`;
}

function derivePrimarySvgColor(source: unknown): string {
  const svg = String(source || "");
  if (!svg) return "";

  const counts = new Map<string, number>();
  const regex = /(?:fill|stroke)\s*=\s*["']([^"']+)["']|(?:fill|stroke)\s*:\s*([^;"']+)/giu;
      let match: RegExpExecArray | null = null;
      while ((match = regex.exec(svg))) {
      const color = normalizeDerivedColor(match[1] || match[2] || "");
      if (color) counts.set(color, (counts.get(color) || 0) + 1);
      }

      let winner = "";
      let winnerCount = -1;
      for (const [color, count] of counts.entries()) {
      if (count > winnerCount) {
      winner = color;
      winnerCount = count;
      }
      }
      return winner;
      }

      function applySvgColor(svgMarkup: unknown, color: unknown, options: { important?: boolean } = {}): string {
      const svg = String(svgMarkup || "").trim();
      const colorValue = text(color);
      if (!svg || !colorValue || !/^<svg\b/iu.test(svg)) return svg;
      const suffix = options.important === false ? "" : " !important";
      return svg.replace(/^<svg\b([^>]*)>/iu, (_match, attrsRaw) => {
      const attrs = String(attrsRaw || "");
      const styleMatch = attrs.match(/\sstyle=(["'])([\s\S]*?)\1/iu);
      if (!styleMatch) {
      return `<svg${attrs} style="color: ${escapeHtml(colorValue)}${suffix}">`;
      }
      const quote = styleMatch[1];
      const currentStyle = text(styleMatch[2]);
      const nextStyle = currentStyle
      ? `${currentStyle.replace(/;?\s*$/u, "")}; color: ${colorValue}${suffix}`
      : `color: ${colorValue}${suffix}`;
      return `<svg${attrs.replace(styleMatch[0], ` style=${quote}${escapeHtml(nextStyle)}${quote}`)}>`;
      });
      }

      function applySvgRootAttrs(
      svgMarkup: unknown,
      attrs: Record<string, unknown> = {},
      ): string {
      const svg = String(svgMarkup || "").trim();
      if (!svg || !/^<svg\b/iu.test(svg)) return svg;
      const pairs: string[] = [];
      for (const [keyRaw, value] of Object.entries(attrs || {})) {
      const key = text(keyRaw);
      if (!key || value == null || value === false) continue;
      if (value === true) {
      pairs.push(key);
      continue;
      }
      pairs.push(`${key}="${escapeHtml(value)}"`);
      }
      if (!pairs.length) return svg;
      return svg.replace(
      /^<svg\b([^>]*)>/iu,
      (_match, openAttrs) => `<svg${String(openAttrs || "")} ${pairs.join(" ")}>`,
      );
      }

      function normalizeSvgMarkup(
      svgMarkup: unknown,
      options: {
      ariaHidden?: boolean;
      className?: string;
      preserveSourceColors?: boolean;
      } = {},
      ): string {
      const raw = String(svgMarkup || "")
      .replace(/^\uFEFF/u, "")
      .replace(/<\?xml[\s\S]*?\?>/giu, "")
      .replace(/<!DOCTYPE[\s\S]*?>/giu, "")
      .trim();
      if (!/^<svg\b/iu.test(raw)) return "";

      const openTagMatch = raw.match(/^<svg\b([^>]*)>/iu);
      if (!openTagMatch) return "";

      const removableAttrs = options.preserveSourceColors
      ? "width|height|role|focusable|aria-hidden|class"
      : "width|height|fill|role|focusable|aria-hidden|class";
      const removableAttrRx = new RegExp(`\\s(?:${removableAttrs})=("[\\s\\S]*?"|'[\\s\\S]*?'|[^\\s>]+)`, "giu");
      const openTag = String(openTagMatch[1] || "").replace(removableAttrRx, "").trim();
      const classAttr = options.className ? ` class="${escapeHtml(options.className)}"` : "";
      const fillAttr = options.preserveSourceColors ? "" : ' fill="currentColor"';
      const ariaHidden = options.ariaHidden === false ? "" : ' aria-hidden="true"';
      const nextOpen = `<svg${openTag ? ` ${openTag}` : ""}${classAttr} width="1em" height="1em"${fillAttr} focusable="false"${ariaHidden}>`;
      return raw.replace(/^<svg\b[^>]*>/iu, nextOpen);
      }

      function buildIconUrl(spec: unknown, endpoint = "/__icons/svg"): string {
      const parsed = parseIconSpec(spec);
      const normalizedSpec = parsed ? parsed.spec : normalizeSpace(spec);
      const separator = endpoint.includes("?") ? "&" : "?";
      return `${endpoint}${separator}spec=${encodeURIComponent(normalizedSpec)}`;
      }

      export {
      SUPPORTED_ICON_PACKS,
      applySvgColor,
      applySvgRootAttrs,
      buildIconUrl,
      classNames,
      derivePrimarySvgColor,
      escapeHtml,
      iconSpec,
      normalizeHexColor,
      normalizeIconName,
      normalizeIconPack,
      normalizeSpace,
      normalizeSvgMarkup,
      parseIconSpec,
      text,
      };
      export type { IconPack, ParsedIconSpec };
