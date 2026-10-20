type SiteSearchSection = { id?: string; title: string };

type ExtractedPage = { sections: SiteSearchSection[]; text: string };

type OpenElement = { heading: boolean; id?: string; skip: boolean; tag: string };

const SKIPPED = new Set(["button", "canvas", "noscript", "script", "select", "style", "svg", "template", "textarea"]);
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const INLINE = new Set([
    "a", "abbr", "b", "bdi", "cite", "code", "em", "i", "kbd", "mark", "q", "s", "sub", "sup", "time", "u",
]);
const HEADING = /^h[1-4]$/u;
const TOKEN = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>|([^<]+)|</gu;
const ENTITIES: Record<string, string> = { amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: "\"" };

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/giu, (match, name: string) => {
      if (name[0] !== "#") return ENTITIES[name.toLowerCase()] ?? match;
      const code = name[1]?.toLowerCase() === "x" ? Number.parseInt(name.slice(2), 16) : Number.parseInt(name.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
  });
}

function attribute(attrs: string, name: string): string | undefined {
  const match = new RegExp(`(?:^|\\s)${name}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+)))?`, "iu").exec(attrs);
  if (!match) return undefined;
  return match[1] ?? match[2] ?? match[3] ?? "";
}

function hides(tag: string, attrs: string): boolean {
  if (SKIPPED.has(tag)) return true;
  if (attribute(attrs, "aria-hidden") === "true") return true;
  return attribute(attrs, "hidden") !== undefined || attribute(attrs, "inert") !== undefined;
}

function mainOf(html: string): string {
  const start = html.search(/<main[\s>]/iu);
  const end = html.toLowerCase().lastIndexOf("</main>");
  return start >= 0 && end > start ? html.slice(start, end + 7) : html;
}

function clean(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

function closeElement(stack: OpenElement[], tag: string, sections: SiteSearchSection[], heading: string[]) {
  const index = stack.map((entry) => entry.tag).lastIndexOf(tag);
  if (index < 0) return;
  const closed = stack.splice(index);
  const own = closed[0] as OpenElement;
  if (!own.heading) return;
  const title = clean(heading.splice(0).join(""));
  if (title) sections.push({ ...(own.id ? { id: own.id } : {}), title });
}

function extractPage(html: string): ExtractedPage {
  const stack: OpenElement[] = [];
  const sections: SiteSearchSection[] = [];
  const heading: string[] = [];
  const text: string[] = [];
  for (const match of mainOf(html).matchAll(TOKEN)) {
    const [, closing, rawTag, attrs = "", selfClosing, chunk] = match;
    const skipping = stack.some((entry) => entry.skip);
    if (chunk !== undefined) {
      if (skipping) continue;
      const value = decodeEntities(chunk);
      text.push(value);
      if (stack.some((entry) => entry.heading)) heading.push(value);
      continue;
    }
    if (!rawTag) continue;
    const tag = rawTag.toLowerCase();
    if (!INLINE.has(tag) && !skipping) {
      text.push(" ");
      heading.push(" ");
    }
    if (closing) closeElement(stack, tag, sections, heading);
    else if (!VOID.has(tag) && !selfClosing) stack.push({ heading: HEADING.test(tag), id: attribute(attrs, "id"), skip: hides(tag, attrs), tag });
  }
  return { sections, text: clean(text.join("")) };
}

export { decodeEntities, extractPage };
export type { ExtractedPage, SiteSearchSection };
