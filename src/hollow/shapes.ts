import type { Art, PathArt, Point } from "@trebired/overprint";

type Rng = () => number;

const fixed = (value: number) => String(Math.round(value * 1000) / 1000);

function seeded(seed: string): Rng {
  let state = [...seed].reduce((total, letter) => (total * 31 + letter.charCodeAt(0)) >>> 0, 2166136261);
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function polygon(points: Point[]): string {
  return `M${points.map(([x, y]) => `${fixed(x)} ${fixed(y)}`).join("L")}Z`;
}

function irregular(next: Rng): string {
  const corners = 3 + Math.floor(next() * 5);
  const cuts = Array.from({ length: corners }, () => next() * Math.PI * 2).sort((left, right) => left - right);
  return polygon(cuts.map((angle) => {
        const reach = 0.25 + next() * 0.25;
        return [0.5 + Math.cos(angle) * reach, 0.5 + Math.sin(angle) * reach] as Point;
  }));
}

function sliver(next: Rng): string {
  const lean = (next() - 0.5) * 0.6;
  const thin = 0.1 + next() * 0.2;
  return polygon([[0.02 + lean, 0.5 - thin], [0.98, 0.5 - thin * next()], [0.98 - lean, 0.5 + thin], [0.02, 0.5 + thin * next()]]);
}

function arcPoint(angle: number, reach: number): string {
  return `${fixed(0.5 + Math.cos(angle) * reach)} ${fixed(0.5 + Math.sin(angle) * reach)}`;
}

function sector(next: Rng): string {
  const start = next() * Math.PI * 2;
  const sweep = Math.PI * (0.35 + next() * 0.9);
  const inner = next() < 0.5 ? 0 : 0.12 + next() * 0.24;
  const large = sweep > Math.PI ? 1 : 0;
  const end = start + sweep;
  const rim = `M${arcPoint(start, 0.48)}A0.48 0.48 0 ${large} 1 ${arcPoint(end, 0.48)}`;
  if (!inner) return `${rim}L0.5 0.5Z`;
  return `${rim}L${arcPoint(end, inner)}A${fixed(inner)} ${fixed(inner)} 0 ${large} 0 ${arcPoint(start, inner)}Z`;
}

type Frame = { box: Point; font: number };

function shapesFor(next: Rng, count: number): string[] {
  const curved = next() < 0.4 ? Math.floor(next() * count) : -1;
  const makers = [irregular, irregular, sliver];
  return Array.from({ length: count }, (_, index) => {
      if (index === curved) return sector(next);
      return (makers[Math.floor(next() * makers.length)] as typeof irregular)(next);
  });
}

function scatter(next: Rng, frame: Frame): Art[] {
  const [width, height] = frame.box;
  const lines = Math.max(1, Math.round(height / (frame.font * 0.95)));
  const count = Math.max(2, Math.min(8, Math.round((width * lines) / (frame.font * 1.5)) + Math.floor(next() * 2)));
  const slot = width / Math.ceil(count / lines);
  return shapesFor(next, count).map((path, index) => {
      const row = index % lines;
      const column = Math.floor(index / lines);
      const side = frame.font * (1 + next() * 1.4);
      const across = side * (0.7 + next() * 0.8);
      const centerX = slot * (column + 0.1 + next() * 0.8);
      const centerY = (height / lines) * (row + 0.2 + next() * 0.6);
      const box = { height: side / height, width: across / width, x: (centerX - across / 2) / width, y: (centerY - side / 2) / height };
      return { box, d: path, fit: "fill", kind: "path", rotate: Math.round(next() * 360) } as PathArt;
  });
}

export { scatter, seeded };
export type { Frame, Rng };
