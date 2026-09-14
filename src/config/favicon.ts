import fs from "node:fs/promises";
import path from "node:path";

import { toTrimmedString as toString } from "@trebired/utils";

import { buildIco } from "./favicon-ico.js";
import type { IcoFrame } from "./favicon-ico.js";
import type {
  FrontendFaviconConfig,
  NormalizedFrontendFaviconConfig,
} from "./types/assets.js";
import type { NormalizedFrontendConfig } from "./types.js";

type FaviconScheme = "dark" | "light";

type GeneratedFaviconFile = {
  contents: Uint8Array;
  path: string;
};

type GeneratedFaviconLink = Record<string, string>;

type GeneratedFaviconAssets = {
  files: GeneratedFaviconFile[];
  links: GeneratedFaviconLink[];
  rasterized: boolean;
};

const DEFAULT_FAVICON_SIZES = [32, 180, 192, 512];
const DEFAULT_FAVICON_ICO = [16, 32, 48];
const APPLE_TOUCH_SIZE = 180;
const SVG_EXTENSION = ".svg";

function emptyFaviconAssets(): GeneratedFaviconAssets {
  return { files: [], links: [], rasterized: false };
}

function assertSvgSource(value: string, field: string): string {
  const source = toString(value);
  if (!source) return "";
  if (path.extname(source).toLowerCase() !== SVG_EXTENSION) {
    throw new Error(`assets.favicon.${field} must point at an .svg file`);
  }
  return source;
}

function normalizeSizeList(value: unknown, fallback: readonly number[]): number[] {
  if (value === false) return [];
  if (value === undefined) return [...fallback];
  if (!Array.isArray(value)) throw new Error("assets.favicon sizes must be an array");
  const sizes = value
  .map((entry) => Math.trunc(Number(entry)))
  .filter((entry) => Number.isFinite(entry) && entry > 0 && entry <= 1024);
  return [...new Set(sizes)].sort((left, right) => left - right);
}

function normalizeFaviconConfig(value: unknown): NormalizedFrontendFaviconConfig {
  const empty = { dark: "", default: "", ico: [], light: "", sizes: [] };
  if (value === undefined || value === false) return empty;

  const source: FrontendFaviconConfig = typeof value === "string"
  ? { default: value }
  : value as FrontendFaviconConfig;

  const primary = assertSvgSource(String(source.default ||""), "default");
  if (!primary) throw new Error("assets.favicon requires a default svg path");

  return {
    dark: assertSvgSource(String(source.dark || ""), "dark"),
    default: primary,
    ico: normalizeSizeList(source.ico, DEFAULT_FAVICON_ICO),
    light: assertSvgSource(String(source.light || ""), "light"),
    sizes: normalizeSizeList(source.sizes, DEFAULT_FAVICON_SIZES),
  };
}

function svgOutputName(scheme: FaviconScheme | null): string {
  return scheme ? `favicon-${scheme}.svg` : "favicon.svg";
}

function pngOutputName(size: number): string {
  return size === APPLE_TOUCH_SIZE ? "apple-touch-icon.png" : `icon-${size}.png`;
}

const ADAPTIVE_FAVICON_STYLE = [
  "<style>.favicon-dark{display:none}",
  "@media (prefers-color-scheme: dark){.favicon-light{display:none}.favicon-dark{display:inline}}</style>",
].join("");

function svgViewBox(source: string): string {
  const match = /<svg\b[^>]*\bviewBox="([^"]+)"/iu.exec(source);
  return match ? match[1] : "0 0 64 64";
}

function nestedSchemeSvg(source: string, scheme: FaviconScheme): string {
  const clean = source.replace(/<\?xml[^>]*\?>/giu, "").replace(/<!DOCTYPE[^>]*>/giu, "").trim();
  const open = /<svg\b([^>]*)>/iu.exec(clean);
  if (!open) return "";
  const attributes = open[1].replace(/\s(?:width|height|class)="[^"]*"/giu, "");
  const body = clean.slice(open.index + open[0].length);
  return `<svg${attributes} class="favicon-${scheme}" width="100%" height="100%">${body}`;
}

function adaptiveFaviconSvg(light: Uint8Array, dark: Uint8Array): Uint8Array {
  const decoder = new TextDecoder();
  const lightSource = decoder.decode(light);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewBox(lightSource)}">`,
    ADAPTIVE_FAVICON_STYLE,
    nestedSchemeSvg(lightSource, "light"),
    nestedSchemeSvg(decoder.decode(dark), "dark"),
    "</svg>\n",
  ].join("");
  return new TextEncoder().encode(svg);
}

function hasSchemeVariants(favicon: NormalizedFrontendFaviconConfig): boolean {
  return Boolean(favicon.light && favicon.dark);
}

function svgLinks(favicon: NormalizedFrontendFaviconConfig): GeneratedFaviconLink[] {
  const primary: GeneratedFaviconLink = {
    href: `/${svgOutputName(null)}`,
    id: "app_favicon",
    rel: "icon",
    type: "image/svg+xml",
  };
  if (hasSchemeVariants(favicon)) return [primary];

  const schemeLinks = (["light", "dark"] as FaviconScheme[])
  .filter((scheme) => favicon[scheme])
  .map((scheme) => ({
        href: `/${svgOutputName(scheme)}`,
        media: `(prefers-color-scheme: ${scheme})`,
        rel: "icon",
        type: "image/svg+xml",
  }));
  return [primary, ...schemeLinks];
}

type SvgSources = {
  files: GeneratedFaviconFile[];
  primary: Uint8Array;
};

async function readSvgSource(rootDir: string, source: string): Promise<Uint8Array|null> {
  if (!source) return null;
  return new Uint8Array(await fs.readFile(path.resolve(rootDir, source)));
}

async function readSvgSources(
  favicon: NormalizedFrontendFaviconConfig,
  rootDir: string,
): Promise<SvgSources> {
  const primary = await readSvgSource(rootDir, favicon.default) as Uint8Array;
  const light = await readSvgSource(rootDir, favicon.light);
  const dark = await readSvgSource(rootDir, favicon.dark);
  const files: GeneratedFaviconFile[] = [{
      contents: light && dark ? adaptiveFaviconSvg(light, dark) : primary,
      path: svgOutputName(null),
  }];
  if (light) files.push({ contents: light, path: svgOutputName("light") });
  if (dark) files.push({ contents: dark, path: svgOutputName("dark") });
  return { files, primary };
}

async function loadSharp(): Promise<((input:Uint8Array)=>SharpInstance)|null> {
  try {
    const importOptional = Function("specifier", "return import(specifier)") as
    (specifier: string) => Promise<Record<string, unknown>>;
    const loaded = await importOptional("sharp");
    const factory = (loaded.default ||loaded) as unknown;
    return typeof factory === "function"
    ? factory as(input: Uint8Array) => SharpInstance
    : null;
  } catch {
    return null;
  }
}

type SharpInstance = {
  png: () => { toBuffer: () => Promise<Buffer> };
  resize: (options: Record<string, unknown>) => SharpInstance;
};

async function renderPng(
  sharp: (input: Uint8Array) => SharpInstance,
  svg: Uint8Array,
  size: number,
): Promise<Uint8Array> {
  const buffer = await sharp(svg)
  .resize({ background: { alpha: 0, b: 0, g: 0, r: 0 }, fit: "contain", height: size, width: size })
  .png()
  .toBuffer();
  return new Uint8Array(buffer);
}

function rasterLinks(sizes: readonly number[], icoSizes: readonly number[]): GeneratedFaviconLink[] {
  const links: GeneratedFaviconLink[] = [];

  if (icoSizes.length) {
    links.push({
        href: "/favicon.ico",
        rel: "icon",
        sizes: icoSizes.map((size) => `${size}x${size}`).join(" "),
        type: "image/x-icon",
    });
  }

  for (const size of sizes) {
    if (size === APPLE_TOUCH_SIZE) {
      links.push({ href: "/apple-touch-icon.png", rel: "apple-touch-icon", sizes: "180x180" });
      continue;
    }
    links.push({
        href: `/${pngOutputName(size)}`,
        rel: "icon",
        sizes: `${size}x${size}`,
        type: "image/png",
    });
  }

  return links;
}

async function renderRasters(
  sharp: (input: Uint8Array) => SharpInstance,
  svg: Uint8Array,
  favicon: NormalizedFrontendFaviconConfig,
): Promise<GeneratedFaviconFile[]> {
  const files: GeneratedFaviconFile[] = [];

  for (const size of favicon.sizes) {
    files.push({ contents: await renderPng(sharp, svg, size), path: pngOutputName(size) });
  }

  if (favicon.ico.length) {
    const frames: IcoFrame[] = [];
    for (const size of favicon.ico) {
      frames.push({ contents: await renderPng(sharp, svg, size), size });
    }
    files.push({ contents: buildIco(frames), path: "favicon.ico" });
  }

  return files;
}

async function generateFaviconAssets(
  config: NormalizedFrontendConfig,
  options: { rootDir?: string } = {},
): Promise<GeneratedFaviconAssets> {
  const favicon = config?.assets?.favicon;
  if (!favicon?.default) return emptyFaviconAssets();

  const rootDir = options.rootDir || process.cwd();
  const { files, primary } = await readSvgSources(favicon, rootDir);
  const links = svgLinks(favicon);
  if (!favicon.sizes.length && !favicon.ico.length) return { files, links, rasterized: false };

  const sharp = await loadSharp();
  if (!sharp) return { files, links, rasterized: false };

  const rasters = await renderRasters(sharp, primary, favicon);
  const raster = rasterLinks(favicon.sizes, favicon.ico)
  .filter((link) => !hasSchemeVariants(favicon) || link.rel !== "icon");
  return {
    files: [...files, ...rasters],
    links: [...raster, ...links],
    rasterized: true,
  };
}

export { DEFAULT_FAVICON_ICO, DEFAULT_FAVICON_SIZES, generateFaviconAssets, normalizeFaviconConfig };
export type { GeneratedFaviconAssets, GeneratedFaviconFile, GeneratedFaviconLink };
