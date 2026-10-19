type MotifPointer = { s: number; ts: number; tx: number; ty: number; x: number; y: number };

type MotifFrame = {
  at: (x: number, y: number, ax?: number, ay?: number) => number[];
  context: any;
  cursor: number[] | null;
  data: any;
  height: number;
  line: (points: number[][], closed?: boolean) => void;
  noise: (x: number, y: number) => number;
  pointer: { inside: boolean; strength: number; x: number; y: number };
  scale: number[];
  state: any;
  taps: number[][];
  time: number;
  unit: number;
  width: number;
};

type MotifPainter = (frame: MotifFrame) => void;

type MotifDefinition = { data?: unknown; helpers?: unknown[]; paint: MotifPainter; still?: boolean };

function motifNoiseSeed(seed: number) {
  const source: number[] = [];
  const perm: number[] = [];
  for (let index = 0; index < 256; index += 1) source[index] = index;
  let state = (seed >>> 0) || 1;
  for (let index = 255; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swap = state % (index + 1);
    const held = source[index];
    source[index] = source[swap];
    source[swap] = held;
  }
  for (let index = 0; index < 512; index += 1) perm[index] = source[index&255];
  return perm;
}

function motifNoiseGrad(hash: number, gx: number, gy: number) {
  const bits = hash&7;
  const run = bits < 4 ? gx : gy;
  const rise = bits < 4 ? gy : gx;
  return ((bits&1) === 0 ? run : -run) + ((bits&2) === 0 ? 2 * rise : -2 * rise);
}

function motifNoiseCorner(perm: number[], ii: number, jj: number, off: number[], gx: number, gy: number) {
  const fade = 0.5 - gx * gx - gy * gy;
  if (fade < 0) return 0;
  const hash = perm[ii + off[0] + perm[jj + off[1]]];
  return fade * fade * fade * fade * motifNoiseGrad(hash, gx, gy);
}

function motifNoise2(perm: number[], xin: number, yin: number) {
  const skew = 0.3660254037844386;
  const unskew = 0.21132486540518713;
  const lean = (xin + yin) * skew;
  const cellX = Math.floor(xin + lean);
  const cellY = Math.floor(yin + lean);
  const back = (cellX + cellY) * unskew;
  const dx0 = xin - (cellX - back);
  const dy0 = yin - (cellY - back);
  const step = dx0 > dy0 ? [1, 0] : [0, 1];
  const ii = cellX&255;
  const jj = cellY&255;
  const total = motifNoiseCorner(perm, ii, jj, [0, 0], dx0, dy0)
  +motifNoiseCorner(perm, ii, jj, step, dx0 - step[0] + unskew, dy0 - step[1] + unskew)
  +motifNoiseCorner(perm, ii, jj, [1, 1], dx0 - 1 + 2 * unskew, dy0 - 1 + 2 * unskew);
  return 70 * total;
}

function motifWarp(pointer: any, x: number, y: number, ax: number, ay: number): number[] {
  if (pointer.s <= 0.002) return [x, y];
  const dx = x - pointer.x;
  const dy = y - pointer.y;
  const fall = Math.exp(-(dx * dx + dy * dy) / 62500) * pointer.s;
  if (fall === 0) return [x, y];
  return [x + dx * fall * ax, y + dy * fall * ay];
}

function motifStroke(context: any, pointer: any, rgb: string, scale: number[]) {
  if (pointer.s < 0.002) return `rgba(${rgb}, 0.14)`;
  const halo = context.createRadialGradient(
    pointer.x * scale[0], pointer.y * scale[1], 0,
    pointer.x * scale[0], pointer.y * scale[1], 550 * scale[0],
  );
  halo.addColorStop(0, `rgba(${rgb}, ${0.14 + 0.16 * pointer.s})`);
  halo.addColorStop(0.5, `rgba(${rgb}, ${0.14 + 0.06 * pointer.s})`);
  halo.addColorStop(1, `rgba(${rgb}, 0.14)`);
  return halo;
}

function motifPaint(canvas: any, painter: any, pointer: any, time: number) {
  const context = canvas.getContext("2d");
  const box = canvas.__motifBox;
  if (!context || !box || !painter) return;
  const taps = canvas.__motifTaps || [];
  canvas.__motifTaps = [];
  const scale = [box[0] / 1000, box[1] / 1000];
  const paint = motifStroke(context, pointer, canvas.__motifRgb, scale);
  context.clearRect(0, 0, box[0], box[1]);
  context.strokeStyle = paint;
  context.fillStyle = paint;
  context.lineWidth = 1;
  painter({
      at: (x: number, y: number, ax: number, ay: number) => {
        const point = motifWarp(pointer, x, y, ax || 0, ay || 0);
        return [point[0] * scale[0], point[1] * scale[1]];
      },
      context,
      cursor: pointer.ts > 0 ? [pointer.tx, pointer.ty] : null,
      data: canvas.__motifData,
      height: box[1],
      line: (points: number[][], closed: boolean) => {
        context.beginPath();
        points.forEach((point: number[], index: number) => (index === 0
            ? context.moveTo(point[0], point[1])
            : context.lineTo(point[0], point[1])));
        if (closed) context.closePath();
        context.stroke();
      },
      noise: (nx: number, ny: number) => motifNoise2(canvas.__motifPerm, nx, ny),
      pointer: { inside: pointer.ts > 0, strength: pointer.s, x: pointer.x, y: pointer.y },
      scale,
      state: canvas.__motifState,
      taps,
      time,
      unit: 1000,
      width: box[0],
  });
}

function motifMeasure(canvas: any) {
  const host = canvas.parentElement;
  const rect = (host || canvas).getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d");
  if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
  canvas.__motifBox = [width, height];
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) return;
  probe.fillStyle = window.getComputedStyle(canvas).color;
  probe.fillRect(0, 0, 1, 1);
  const data = probe.getImageData(0, 0, 1, 1).data;
  canvas.__motifRgb = `${data[0]}, ${data[1]}, ${data[2]}`;
}

function motifListen(canvas: any, host: any, pointer: any, redraw: any, repaint: any, still: boolean) {
  const move = (event: any) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointer.ts = 1;
    pointer.tx = ((event.clientX - rect.left) / rect.width) * 1000;
    pointer.ty = ((event.clientY - rect.top) / rect.height) * 1000;
    redraw();
  };
  const leave = () => {
    pointer.ts = 0;
    redraw();
  };
  const tap = (event: any) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    canvas.__motifTaps.push([
        ((event.clientX - rect.left) / rect.width) * 1000,
        ((event.clientY - rect.top) / rect.height) * 1000,
    ]);
    redraw();
  };
  const resize = () => {
    motifMeasure(canvas);
    repaint();
  };
  window.addEventListener("resize", resize);
  let watcher: any = null;
  if (typeof ResizeObserver === "function") {
    watcher = new ResizeObserver(resize);
    watcher.observe(host);
  }
  if (!still) {
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointerdown", tap);
  }
  return () => {
    window.removeEventListener("resize", resize);
    watcher?.disconnect();
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerleave", leave);
    host.removeEventListener("pointerdown", tap);
  };
}

function motifCalm(still: boolean, attr: string) {
  if (still) return true;
  const mode = attr ? document.documentElement.getAttribute(attr) : "";
  if (mode === "on") return true;
  if (mode === "off") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function motifStart(canvas: any, painter: any, data: any, still: boolean, attr: string) {
  const calm = motifCalm(still, attr);
  canvas.__motifData = data;
  canvas.__motifPerm = canvas.__motifPerm || motifNoiseSeed(1973);
  canvas.__motifState = canvas.__motifState || {};
  canvas.__motifTaps = [];
  const pointer: MotifPointer = { s: 0, ts: 0, tx: 0, ty: 0, x: 0, y: 0 };
  let frame = 0;
  let began = 0;
  let last = 0;
  const render = (now: number) => {
    if (!began) began = now;
    last = now;
    const ease = calm ? 1 : 0.06;
    pointer.x += (pointer.tx - pointer.x) * ease;
    pointer.y += (pointer.ty - pointer.y) * ease;
    pointer.s += (pointer.ts - pointer.s) * ease;
    motifPaint(canvas, painter, pointer, calm ? 0 : (now - began) / 1400);
    frame = calm ? 0 : window.requestAnimationFrame(render);
  };
  const redraw = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };
  const repaint = () => {
    if (!began) {
      redraw();
      return;
    }
    motifPaint(canvas, painter, pointer, calm ? 0 : (last - began) / 1400);
  };
  const host = canvas.parentElement || canvas;
  motifMeasure(canvas);
  frame = window.requestAnimationFrame(render);
  const unlisten = motifListen(canvas, host, pointer, redraw, repaint, still);
  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    unlisten();
  };
}

export {
  motifCalm,
  motifListen,
  motifMeasure,
  motifNoise2,
  motifNoiseCorner,
  motifNoiseGrad,
  motifNoiseSeed,
  motifPaint,
  motifStart,
  motifStroke,
  motifWarp,
};
export type { MotifDefinition, MotifFrame, MotifPainter, MotifPointer };
