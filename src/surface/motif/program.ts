type MotifPointer = { s: number; ts: number; tx: number; ty: number; x: number; y: number };

type MotifFrame = {
  at: (x: number, y: number, ax?: number, ay?: number) => number[];
  context: any;
  cursor: number[] | null;
  data: any;
  height: number;
  line: (points: number[][], closed?: boolean) => void;
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

export { motifCalm, motifListen, motifMeasure, motifPaint, motifStart, motifStroke, motifWarp };
export type { MotifDefinition, MotifFrame, MotifPainter, MotifPointer };
