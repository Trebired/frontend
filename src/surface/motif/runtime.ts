import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";
import { bindElementsOnReady } from "#2cwr1tgrgdg3";
import { registerPageCleanup } from "#tvicwpnoy4rk";
import { motifStart } from "./program.js";
import { A11Y_REDUCE_MOTION_ATTR } from "./../../a11y/attributes.js";
import { motifEntry } from "./registry.js";
import { STARTED_KEY } from "./boot.js";

const MOTIF_ATTRIBUTE = frontendDataAttr("motif");
const MOTIF_SELECTOR = frontendDataSelector("motif");

const CLEANED_KEY = "__motifCleanup";

type MotifCanvas = HTMLCanvasElement& {
  [CLEANED_KEY]?: true | undefined;
  [STARTED_KEY]?: (() => void) | undefined;
};

const started = new Set<MotifCanvas>();

function stopMotif(canvas: MotifCanvas) {
  started.delete(canvas);
  canvas[STARTED_KEY]?.();
  canvas[STARTED_KEY] = undefined;
  canvas[CLEANED_KEY] = undefined;
}

function pruneDetachedMotifs() {
  for (const canvas of Array.from(started)) {
    if (!canvas.isConnected) stopMotif(canvas);
  }
}

function restartMotif(canvas: MotifCanvas) {
  const entry = motifEntry(canvas.getAttribute(MOTIF_ATTRIBUTE));
  if (!entry) return;
  canvas[STARTED_KEY] = motifStart(canvas, entry.paint, entry.data, entry.still === true, A11Y_REDUCE_MOTION_ATTR);
  started.add(canvas);
}

function refreshMotifs() {
  for (const canvas of Array.from(started)) {
    if (!canvas.isConnected) continue;
    canvas[STARTED_KEY]?.();
    canvas[STARTED_KEY] = undefined;
    restartMotif(canvas);
  }
}

function bindMotifHost(element: Element) {
  pruneDetachedMotifs();
  const canvas = element as MotifCanvas;
  const host = canvas.parentElement;
  if (!host || typeof window === "undefined" || typeof canvas.getContext !== "function") return;
  if (!canvas[STARTED_KEY]) {
    const entry = motifEntry(canvas.getAttribute(MOTIF_ATTRIBUTE));
    if (!entry) return;
    canvas[STARTED_KEY] = motifStart(canvas, entry.paint, entry.data, entry.still === true, A11Y_REDUCE_MOTION_ATTR);
  }
  started.add(canvas);
  if (canvas[CLEANED_KEY]) return;
  canvas[CLEANED_KEY] = true;
  registerPageCleanup(host, () => stopMotif(canvas));
}

function bindMotifs() {
  return bindElementsOnReady(MOTIF_SELECTOR, (element) => bindMotifHost(element));
}

export { bindMotifHost, bindMotifs, MOTIF_SELECTOR, refreshMotifs };
