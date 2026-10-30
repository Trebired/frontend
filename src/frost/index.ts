import { frontendCssVar } from "#5vbaqj4pirp3";
import { queryAll, touchOnly, type BindRoot } from "#er0dlx1gtbzh";

type Box = { bottom: number; left: number; right: number; top: number };

const BLOCKS = "p, li:not([class]), blockquote, figcaption, dd";
const MARK = frontendCssVar("frost");
const MASK = frontendCssVar("frost-mask");
const PAD = { block: 0.3, inline: 0.55 };
const RIPPLE = 0.7;
const SOFTEN = 0.28;

const frosted = new Set<HTMLElement>();
const pending = new Set<HTMLElement>();

let resizes: ResizeObserver | null = null;
let changes: MutationObserver | null = null;
let frame = 0;

function lines(block: HTMLElement): Box[] {
  const range = document.createRange();
  range.selectNodeContents(block);
  const merged: Box[] = [];
  for (const rect of [...range.getClientRects()].sort((first, second) => first.top - second.top)) {
    if (rect.width < 1 || rect.height < 1) continue;
    const line = merged.find((box) => rect.top < box.bottom - rect.height / 2 && rect.bottom > box.top + rect.height / 2);
    if (!line) {
      merged.push({ bottom: rect.bottom, left: rect.left, right: rect.right, top: rect.top });
      continue;
    }
    line.left = Math.min(line.left, rect.left);
    line.right = Math.max(line.right, rect.right);
    line.top = Math.min(line.top, rect.top);
    line.bottom = Math.max(line.bottom, rect.bottom);
  }
  return merged;
}

function seedOf(text: string): number {
  let hash = 7;
  for (let index = 0; index < text.length; index++) hash = (hash * 31 + text.charCodeAt(index)) % 9973;
  return hash;
}

function maskOf(block: HTMLElement): string {
  const feather = -parseFloat(getComputedStyle(block, "::after").top) || 0;
  const em = parseFloat(getComputedStyle(block).fontSize) || 16;
  const box = block.getBoundingClientRect();
  const width = Math.round(box.width + feather * 2);
  const height = Math.round(box.height + feather * 2);
  const shapes = lines(block).map((line) => {
      const left = Math.round(line.left - box.left + feather - PAD.inline * em);
      const top = Math.round(line.top - box.top + feather - PAD.block * em);
      const across = Math.round(line.right - line.left + PAD.inline * em * 2);
      const tall = Math.round(line.bottom - line.top + PAD.block * em * 2);
      return `<rect x='${left}' y='${top}' width='${across}' height='${tall}' rx='${Math.round(tall / 2)}'/>`;
  });
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>`
  +`<filter id='f' x='-20%' y='-20%' width='140%' height='140%'>`
  +`<feTurbulence type='fractalNoise' baseFrequency='${(1.6 / em).toFixed(4)}' numOctaves='2' seed='${seedOf(block.textContent || "")}'/>`
  +`<feDisplacementMap in='SourceGraphic' scale='${Math.round(feather * RIPPLE * 2)}' xChannelSelector='R' yChannelSelector='G'/>`
  +`<feGaussianBlur stdDeviation='${(feather * SOFTEN).toFixed(1)}'/></filter>`
  +`<g filter='url(#f)' fill='#fff'>${shapes.join("")}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function shape(): void {
  frame = 0;
  for (const block of pending) {
    if (block.isConnected) block.style.setProperty(MASK, maskOf(block));
  }
  pending.clear();
}

function reshape(block: HTMLElement): void {
  pending.add(block);
  if (!frame) frame = requestAnimationFrame(shape);
}

function observers(): void {
  if (resizes || typeof ResizeObserver !== "function") return;
  resizes = new ResizeObserver((entries) => entries.forEach((entry) => reshape(entry.target as HTMLElement)));
  changes = new MutationObserver((records) => {
      for (const record of records) {
        const node = record.target instanceof Element ? record.target : record.target.parentElement;
        for (const block of frosted) if (node && block.contains(node)) reshape(block);
      }
  });
  changes.observe(document.body, { characterData: true, childList: true, subtree: true });
  document.fonts?.ready.then(() => frosted.forEach(reshape)).catch (() => undefined);
}

function bindFrost(root: BindRoot = document): number {
  if (typeof window === "undefined" || touchOnly()) return 0;
  observers();
  for (const block of frosted) {
    if (block.isConnected) continue;
    frosted.delete(block);
    resizes?.unobserve(block);
  }
  let found = 0;
  for (const block of queryAll<HTMLElement>(root, BLOCKS)) {
    if (frosted.has(block) || getComputedStyle(block).getPropertyValue(MARK).trim() !== "on") continue;
    frosted.add(block);
    resizes?.observe(block);
    reshape(block);
    found += 1;
  }
  return found;
}

export { bindFrost };
