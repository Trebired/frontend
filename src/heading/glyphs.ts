import { frontendCssVar } from "./../namespace/index.js";

const GLYPH_FIRST = 32;

const GLYPH_LAST = 126;

const OTHER = "other";

function glyphKey(char: string): string {
  const code = char.codePointAt(0) ?? 0;
  return code >= GLYPH_FIRST && code <= GLYPH_LAST ? String(code) : OTHER;
}

function glyphVar(key: string): string {
  return frontendCssVar(`glyph-${key}`);
}

function plainChars(text: string): string[] {
  return [...text.normalize("NFD").replace(/\p{M}/gu, "")];
}

function glyphSum(text: string): string {
  const counts = new Map<string, number>();
  for (const char of plainChars(text)) counts.set(glyphKey(char), (counts.get(glyphKey(char)) || 0) + 1);
  const terms = [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([key, count]) => {
      const ref = `var(${glyphVar(key)})`;
      return count > 1 ? `${count} * ${ref}` : ref;
  });
  return terms.length ? `calc(${terms.join(" + ")})` : "0";
}

const MAX_LINES = 6;

const FIT = "100cqi / (%s * 1.04)";

function charWidth(char: string): number {
  return char === " " ? 0.4 : 1;
}

function lengthOf(words: string[]): number {
  return words.reduce((sum, word, index) => sum + (index ? 0.4 : 0) + [...word].reduce((width, char) => width + charWidth(char), 0), 0);
}

function balanced(words: string[], lines: number): number[][] {
  const count = words.length;
  const best: number[][] = Array.from({ length: lines + 1 }, () => Array(count + 1).fill(Infinity));
  const cut: number[][] = Array.from({ length: lines + 1 }, () => Array(count + 1).fill(0));
  best[0][0] = 0;
  for (let line = 1; line <= lines; line++) {
    for (let end = line; end <= count; end++) {
      for (let start = line - 1; start < end; start++) {
        const worst = Math.max(best[line - 1][start], lengthOf(words.slice(start, end)));
        if (worst >= best[line][end]) continue;
        best[line][end] = worst;
        cut[line][end] = start;
      }
    }
  }
  const ranges: number[][] = [];
  for (let line = lines, end = count; line > 0; line--) {
    const start = cut[line][end];
    ranges.unshift(Array.from({ length: end - start }, (_, index) => start + index));
    end = start;
  }
  return ranges;
}

function lineSum(indexes: number[]): string {
  const terms = indexes.map((index) => `var(${frontendCssVar(`title-w${index}`)})`);
  const spaces = indexes.length - 1;
  return `calc(${[...terms, ...(spaces ? [`${spaces} * var(${glyphVar("32")})`] : [])].join(" + ")})`;
}

function candidate(words: string[], lines: number, last: boolean): string {
  const widest = balanced(words, lines).map(lineSum);
  const size = FIT.replace("%s", widest.length > 1 ? `max(${widest.join(", ")})` : widest[0] as string);
  return last ? `calc(${size})` : `calc(${size} + clamp(0px, (1em - ${size}) * 1000, 1px) * 100000)`;
}

function titleFitVars(text: string): Record<string, string>|null {
  const words = text.replace(/\s+/gu, " ").trim().split(" ").filter(Boolean);
  if (!words.length) return null;
  const most = Math.min(words.length, MAX_LINES);
  const sizes = Array.from({ length: most }, (_, index) => candidate(words, index + 1, index + 1 === most));
  return {
    ...Object.fromEntries(words.map((word, index) => [frontendCssVar(`title-w${index}`), glyphSum(word)])),
    [frontendCssVar("title-size")]: sizes.length > 1 ? `min(${sizes.join(", ")})` : sizes[0] as string,
  };
}

export { GLYPH_FIRST, GLYPH_LAST, OTHER as GLYPH_OTHER, glyphVar, titleFitVars };
