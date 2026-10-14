import type { MotifDefinition, MotifPainter } from "./program.js";

type MotifEntry = MotifDefinition | MotifPainter;

type MotifRegistry = Record<string, MotifEntry>;

let registry: MotifRegistry = {};

function configureMotifs(motifs: MotifRegistry) {
  registry = { ...registry, ...motifs };
}

function motifNames(): string[] {
  return Object.keys(registry);
}

function motifEntry(variant: unknown): MotifDefinition | null {
  const entry = registry[String(variant || "")];
  if (!entry) return null;
  return typeof entry === "function" ? { paint: entry } : entry;
}

function motifPainter(variant: unknown): MotifPainter | null {
  return motifEntry(variant)?.paint || null;
}

export { configureMotifs, motifEntry, motifNames, motifPainter };
export type { MotifEntry, MotifRegistry };
