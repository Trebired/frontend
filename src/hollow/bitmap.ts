import { frontendCssVar } from "#5vbaqj4pirp3";
import type { HollowPrint } from "./print.js";

type Urls = (images: readonly string[], ink: 0 | 1) => string;

const PREFIX = "data:image/svg+xml,";

function sized(image: string, width: number, height: number): string {
  const markup = decodeURIComponent(image.slice(image.indexOf(PREFIX) + PREFIX.length, image.lastIndexOf("\"")));
  const resized = markup.replace(/ width="[^"]*"/u, ` width="${width}"`).replace(/ height="[^"]*"/u, ` height="${height}"`);
  return `${PREFIX}${encodeURIComponent(resized)}`;
}

async function rasterOf(image: string, width: number, height: number): Promise<string> {
  const source = new Image();
  source.src = sized(image, width, height);
  await source.decode();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(source, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}

function bindHollowBitmaps(element: HTMLElement, print: HollowPrint, urls: Urls): () => void {
  let drawn = 0;
  let live = true;
  const draw = async() => {
    const style = getComputedStyle(element);
    const font = Number.parseFloat(style.fontSize);
    const line = Number.parseFloat(style.lineHeight) || font * 1.2;
    const scale = Math.min(3, window.devicePixelRatio || 1);
    const height = Math.round(line * scale);
    if (!height || height === drawn) return;
    drawn = height;
    const width = Math.round(print.width * font * scale);
    const next = await Promise.all(print.layers.map((layer) => rasterOf(layer.image, width, height).catch (() => null)));
    if (!live || drawn !== height || next.some((url) => !url)) return;
    element.style.setProperty(frontendCssVar("hollow-a"), urls(next as string[], 0));
    element.style.setProperty(frontendCssVar("hollow-b"), urls(next as string[], 1));
  };
  const observer = new ResizeObserver(() => void draw());
  observer.observe(element);
  return () => {
    live = false;
    observer.disconnect();
  };
}

export { bindHollowBitmaps };
