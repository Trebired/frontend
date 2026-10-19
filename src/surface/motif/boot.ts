import {
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
} from "./program.js";
import { A11Y_REDUCE_MOTION_ATTR } from "./../../a11y/attributes.js";
import { motifEntry } from "./registry.js";

const STARTED_KEY = "__motifStop";

function declare(value: unknown): string {
  const fn = value as { name: string };
  return `var ${fn.name}=${String(value)};`;
}

function motifProgramSource(): string {
  return [
    motifNoiseSeed,
    motifNoiseGrad,
    motifNoiseCorner,
    motifNoise2,
    motifWarp,
    motifStroke,
    motifPaint,
    motifMeasure,
    motifCalm,
    motifListen,
    motifStart,
  ].map(declare).join("");
}

function motifData(value: unknown): string {
  return JSON.stringify(value ?? null).replace(/</gu, "\\u003c");
}

function motifBootSource(variant: string): string {
  const entry = motifEntry(variant);
  if (!entry) return "";
  const start = motifStart as unknown as { name: string };
  return [
    "(function(){",
    motifProgramSource(),
    (entry.helpers || []).map(declare).join(""),
    `var p=${String(entry.paint)},d=${motifData(entry.data)},q=${entry.still === true};`,
    `var a=${motifData(A11Y_REDUCE_MOTION_ATTR)};`,
    "var c=document.currentScript&&document.currentScript.previousElementSibling;",
    `if(c&&c.getContext&&!c.${STARTED_KEY})c.${STARTED_KEY}=${start.name}(c,p,d,q,a);`,
    "})();",
  ].join("");
}

export { motifBootSource, motifProgramSource, STARTED_KEY };
