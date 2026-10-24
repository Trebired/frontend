import { printLayers, type Art, type Plate, type Point, type Screen, type Tone } from "@trebired/overprint";
import { scatter, seeded, type Frame, type Rng } from "./shapes.js";

type HollowLayer = { image: string; ink: 0 | 1; offset: Point };

type HollowInk = { dark: string; light: string };

type HollowPrint = { inks: [HollowInk, HollowInk]; layers: HollowLayer[]; width: number };

type Style = "bayer" | "cross" | "lines" | "squares";

const UNIT = 100;

const STYLES: Style[] = ["lines", "squares", "cross", "bayer"];

const COOL = ["#a6c6f3", "#c2a9f2", "#a7e0c2", "#b2b8ef", "#9ed3f2", "#a4ddd6"];

function pick<T>(next: Rng, items: readonly T[]): T {
  return items[Math.floor(next() * items.length)] as T;
}

function hslOf(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(value >> 16)&255, (value >> 8)&255, value&255].map((channel) => channel / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const light = (max + min) / 2;
  const span = max - min;
  if (!span) return [0, 0, light];
  const hue = max === r ? ((g - b) / span) % 6 : max === g ? (b - r) / span + 2 : (r - g) / span + 4;
  return [(hue * 60 + 360) % 360, span / (1 - Math.abs(2 * light - 1)), light];
}

function inkOf(hex: string): HollowInk {
  const [hue, saturation, lightness] = hslOf(hex);
  const css = (chroma: number, light: number) => `hsl(${Math.round(hue)} ${Math.round(chroma * 100)}% ${Math.round(light * 100)}%)`;
  const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
  return {
    dark: css(clamp(saturation * 0.6, 0.15, 0.55), clamp(lightness * 0.85, 0.55, 0.72)),
    light: css(clamp(saturation * 0.6, 0.2, 0.55), clamp(lightness * 0.78, 0.52, 0.66)),
  };
}

function tonesFor(seed: string, palette: readonly string[]): [string, string] {
  const next = seeded(`print:${seed}`);
  const own = [...new Set(palette)];
  if (own.length >= 2) {
    const [first, second] = own as [string, string];
    return next() < 0.5 ? [first, second] : [second, first];
  }
  const first = own[0] || pick(next, COOL);
  return [first, pick(next, COOL.filter((tone) => tone !== first))];
}

function widthOf(text: string): number {
  const em = [...text].reduce((total, char) => {
      if (char === " ") return total + 0.28;
      if (/[.,:;'!|]/u.test(char)) return total + 0.3;
      if (/[iIl1]/u.test(char)) return total + 0.38;
      if (/[mMwW@]/u.test(char)) return total + 0.98;
      return total + 0.76;
    }, 0);
  return Math.max(1, Math.round(em * 100) / 100);
}

function screenOf(style: Style, angle: number): Screen {
  const cell = Math.max(5, Math.round(UNIT * 0.07));
  if (style === "bayer") return { grain: Math.max(2, Math.round(UNIT / 45)), kind: "dither", mode: "bayer" };
  const dot = style === "lines" ? "line" : style === "cross" ? "cross" : "square";
  return { angle, cell, dot, kind: "halftone" };
}

function fadeOf(next: Rng, flip: boolean, strength: number): Tone {
  const angle = next() * Math.PI * 2;
  const along: Point = [0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5];
  const back: Point = [1 - along[0], 1 - along[1]];
  return { from: flip ? back : along, kind: "linear", range: [strength, 0.06], to: flip ? along : back };
}

function platesOf(next: Rng, art: Art, style: Style): Plate[] {
  const shift = Math.max(3, Math.round(UNIT * 0.035));
  const angle = Math.round(next() * 180);
  const offsets: Point[] = [[-shift, shift * 0.7], [shift, -shift * 0.5]];
  return offsets.map((offset, index): Plate => ({
        art,
        ink: [0, 0, 0],
        offset,
        screen: index === 0 ? { grain: Math.max(2, Math.round(UNIT / 60)), kind: "dither", mode: "atkinson" } : screenOf(style, angle + 35),
        tone: fadeOf(next, index === 1, index === 0 ? 0.95 : 0.85),
  }));
}

function hollowPrint(text: string, inks?: readonly [string, string], palette: readonly string[] = []): HollowPrint {
  const width = widthOf(text);
  const frame: Frame = { box: [width * UNIT, UNIT], font: UNIT };
  const next = seeded(`riso:${text}`);
  const shapes = scatter(next, frame);
  const groups: [Art[], Art[]] = [[], []];
  shapes.forEach((shape) => groups[next() < 0.55 ? 0 : 1].push(shape));
  const used = groups.map((parts, group) => ({ group, parts })).filter((entry) => entry.parts.length);
  const lead = pick(next, STYLES);
  const styles = [lead, pick(next, STYLES.filter((style) => style !== lead))];
  const plates = used.flatMap((entry) => platesOf(next, { kind: "group", parts: entry.parts }, styles[entry.group] as Style));
  const { layers } = printLayers({ plates, size: frame.box }, { id: "hollow" });
  const tones = inks ? [inks[0], inks[1]] : tonesFor(text, palette);
  return {
    inks: [inkOf(tones[0] as string), inkOf(tones[1] as string)],
    layers: layers.map((layer, index) => {
        const group = (used[Math.floor(index / 2)] as { group: number }).group;
        const ink = ((index % 2) ^ group) as 0 | 1;
        return { image: layer.image, ink, offset: [layer.offset[0] / UNIT, layer.offset[1] / UNIT] };
    }),
    width,
  };
}

export { hollowPrint };
export type { HollowInk, HollowLayer, HollowPrint };
