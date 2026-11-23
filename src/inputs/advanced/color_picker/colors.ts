const COLOR_SWATCHES: readonly string[] = [
  "#b8636b", "#b66946", "#a67628", "#8a8329", "#638f49", "#2d9570",
  "#009494", "#138db1", "#5182c1", "#7a76bf", "#996bad", "#ae648f",
  "#873e46", "#854324", "#784e00", "#615a00", "#3e6427", "#00694a",
  "#006869", "#006282", "#2e598f", "#534f8d", "#6d457e", "#7e3f65",
];

const HEX = /^#?([0-9a-f]{6})$/iu;

function normalizeHexColor(value: unknown): string {
  const match = HEX.exec(String(value ?? "").trim());
  return match ? `#${match[1]!.toLowerCase()}` : "";
}

function linear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function oklab(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [linear((value >> 16)&255), linear((value >> 8)&255), linear(value&255)];
  const long = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const medium = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const short = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short,
    1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short,
    0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short,
  ];
}

function colorDistance(left: string, right: string): number {
  const [a, b] = [oklab(left), oklab(right)];
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function distinctColor(used: readonly unknown[], candidates: readonly string[] = COLOR_SWATCHES): string {
  const taken = used.map(normalizeHexColor).filter(Boolean);
  const pool = candidates.map(normalizeHexColor).filter(Boolean);
  if (!pool.length) return "";
  let best = pool[0]!;
  let bestDistance = -1;
  for (const candidate of pool) {
    const nearest = taken.length ? Math.min(...taken.map((color) => colorDistance(candidate, color))) : Infinity;
    if (nearest > bestDistance) {
      best = candidate;
      bestDistance = nearest;
    }
  }
  return best;
}

export { COLOR_SWATCHES, colorDistance, distinctColor, normalizeHexColor };
