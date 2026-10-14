type Rgb = { a: number; b: number; g: number; r: number };

const HEX_SHORT = /^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/iu;

const HEX_LONG = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/iu;

const RGB_CALL = /^rgba?\(([^)]+)\)$/iu;

const TEXT_RATIO = 4.5;

const LARGE_TEXT_RATIO = 3;

const NON_TEXT_RATIO = 3;

function channel(part: string): number {
  const text = part.trim();
  if (text.endsWith("%")) return Math.round((parseFloat(text) / 100) * 255);
  return Math.round(parseFloat(text));
}

function alphaPart(part: string | undefined): number {
  if (part === undefined) return 1;
  const text = part.trim();
  const value = text.endsWith("%") ? parseFloat(text) / 100 : parseFloat(text);
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 1;
}

function fromHex(value: string): Rgb | null {
  const short = value.match(HEX_SHORT);
  if (short) {
    const expand = (part: string) => parseInt(`${part}${part}`, 16);
    return {
      a: short[4] === undefined ? 1 : expand(short[4]) / 255,
      b: expand(short[3]!),
      g: expand(short[2]!),
      r: expand(short[1]!),
    };
  }
  const long = value.match(HEX_LONG);
  if (!long) return null;
  return {
    a: long[4] === undefined ? 1 : parseInt(long[4], 16) / 255,
    b: parseInt(long[3]!, 16),
    g: parseInt(long[2]!, 16),
    r: parseInt(long[1]!, 16),
  };
}

function fromRgbCall(value: string): Rgb | null {
  const call = value.match(RGB_CALL);
  if (!call) return null;
  const parts = call[1]!.replace(/\//gu, " ").split(/[,\s]+/u).filter(Boolean);
  if (parts.length < 3) return null;
  return {
    a: alphaPart(parts[3]),
    b: channel(parts[2]!),
    g: channel(parts[1]!),
    r: channel(parts[0]!),
  };
}

function parseColor(value: unknown): Rgb | null {
  const text = String(value || "").trim().toLowerCase();
  if (!text || text === "transparent") return null;
  const parsed = fromHex(text) || fromRgbCall(text);
  if (!parsed) return null;
  if (![parsed.r, parsed.g, parsed.b].every((part) => Number.isFinite(part))) return null;
  return parsed;
}

function linearize(part: number): number {
  const channelValue = part / 255;
  if (channelValue <= 0.03928) return channelValue / 12.92;
  return ((channelValue + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: Rgb): number {
  return 0.2126 * linearize(color.r) + 0.7152 * linearize(color.g) + 0.0722 * linearize(color.b);
}

function flatten(color: Rgb, backdrop: Rgb): Rgb {
  if (color.a >= 1) return color;
  const mix = (part: number, under: number) => part * color.a + under * (1 - color.a);
  return { a: 1, b: mix(color.b, backdrop.b), g: mix(color.g, backdrop.g), r: mix(color.r, backdrop.r) };
}

function contrastRatio(foreground: unknown, background: unknown): number | null {
  const back = parseColor(background);
  const front = parseColor(foreground);
  if (!back || !front) return null;
  const over = flatten(front, back);
  const lighter = Math.max(relativeLuminance(over), relativeLuminance(back));
  const darker = Math.min(relativeLuminance(over), relativeLuminance(back));
  return (lighter + 0.05) / (darker + 0.05);
}

function meetsContrast(ratio: number | null, kind: "text" | "large" | "non-text" = "text"): boolean {
  if (ratio === null) return false;
  if (kind === "large") return ratio >= LARGE_TEXT_RATIO;
  if (kind === "non-text") return ratio >= NON_TEXT_RATIO;
  return ratio >= TEXT_RATIO;
}

export {
  contrastRatio,
  LARGE_TEXT_RATIO,
  meetsContrast,
  NON_TEXT_RATIO,
  parseColor,
  relativeLuminance,
  TEXT_RATIO,
};
export type { Rgb };
