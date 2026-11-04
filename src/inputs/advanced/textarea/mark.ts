import { useCallback, useEffect, useRef, type RefObject } from "react";

type TextHighlightOptions = { exclude?: string };

const HIGHLIGHT_NAME = "text-mark";

function sharedHighlight(): Highlight | null {
  if (typeof CSS === "undefined" || !("highlights"in CSS)) return null;
  const existing = CSS.highlights.get(HIGHLIGHT_NAME);
  if (existing) return existing;
  const created = new Highlight();
  CSS.highlights.set(HIGHLIGHT_NAME, created);
  return created;
}

function matchingRanges(root: HTMLElement, pattern: RegExp, exclude?: string): Range[] {
  const ranges: Range[] = [];
  const global = new RegExp(pattern.source, pattern.flags.replace("g", "") + "g");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (exclude && node.parentElement?.closest(exclude)) continue;
    for (const match of(node.nodeValue ?? "").matchAll(global)) {
      if (!match[0]) continue;
      const range = new Range();
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      ranges.push(range);
    }
  }
  return ranges;
}

function useTextHighlight(ref: RefObject<HTMLElement|null>, pattern: RegExp, options: TextHighlightOptions = {}) {
  const own = useRef<Range[]>([]);
  const clear = useCallback(() => {
      const highlight = sharedHighlight();
      for (const range of own.current) highlight?.delete(range);
      own.current = [];
    }, []);
  const refresh = useCallback(() => {
      const highlight = sharedHighlight();
      if (!highlight || !ref.current) return;
      clear();
      own.current = matchingRanges(ref.current, pattern, options.exclude);
      for (const range of own.current) highlight.add(range);
    }, [clear, options.exclude, pattern, ref]);
  useEffect(() => {
      const root = ref.current;
      refresh();
      root?.addEventListener("input", refresh);
      return () => {
        root?.removeEventListener("input", refresh);
        clear();
      };
    }, [clear, ref, refresh]);
  return refresh;
}

export { useTextHighlight };
export type { TextHighlightOptions };
