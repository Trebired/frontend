import type { SiteSearchSection } from "./extract.js";
import type { SiteSearchPage } from "./build.js";

type SnippetPart = { mark: boolean; text: string };

type SiteSearchHit = { href: string; path: string; section?: SiteSearchSection; snippet: SnippetPart[]; title: string };

type Folded = { map: number[]; text: string };

type PreparedPage = SiteSearchPage& { folded: { description: string; sections: string[]; text: Folded; title: string } };

const SNIPPET_BEFORE = 60;
const SNIPPET_LENGTH = 180;
const RESULT_LIMIT = 12;

function fold(value: string): Folded {
  const map: number[] = [];
  let text = "";
  for (let index = 0; index < value.length; index += 1) {
    const plain = (value[index] as string).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    for (const char of plain) {
      text += char;
      map.push(index);
    }
  }
  return { map, text };
}

function preparePages(pages: SiteSearchPage[]): PreparedPage[] {
  return pages.map((page) => ({
        ...page,
        folded: {
          description: fold(page.description || "").text,
          sections: page.sections.map((section) => fold(section.title).text),
          text: fold(page.text),
          title: fold(page.title).text,
        },
  }));
}

function termsOf(query: string): string[] {
  return [...new Set(fold(query).text.split(/[^\p{L}\p{N}]+/u).filter(Boolean))];
}

function count(haystack: string, term: string, cap: number): number {
  let found = 0;
  for (let at = haystack.indexOf(term); at >= 0 && found < cap; at = haystack.indexOf(term, at + term.length)) found += 1;
  return found;
}

function scoreOf(page: PreparedPage, terms: string[]): number {
  const { folded } = page;
  let score = 0;
  for (const term of terms) {
    const inTitle = folded.title.includes(term);
    const inSection = folded.sections.some((section) => section.includes(term));
    const inText = count(folded.text.text, term, 6);
    if (!inTitle && !inSection && !inText && !folded.description.includes(term)) return 0;
    score += (inTitle ? 12 : 0) + (folded.title.startsWith(term) ? 6 : 0) + (inSection ? 5 : 0);
    score += (folded.description.includes(term) ? 3 : 0) + inText;
  }
  return score;
}

function bestSection(page: PreparedPage, terms: string[]): SiteSearchSection | undefined {
  let best = -1;
  let found = 0;
  page.folded.sections.forEach((section, index) => {
      const hits = terms.filter((term) => section.includes(term)).length;
      if (hits <= found) return;
      best = index;
      found = hits;
  });
  return best >= 0 ? page.sections[best] : undefined;
}

function markParts(original: string, folded: string, offset: number, map: number[], terms: string[]): SnippetPart[] {
  const marks = new Array<boolean>(original.length).fill(false);
  for (const term of terms) {
    for (let at = folded.indexOf(term); at >= 0; at = folded.indexOf(term, at + term.length)) {
      for (let index = at; index < at + term.length; index += 1) marks[(map[index] as number) - offset] = true;
    }
  }
  const parts: SnippetPart[] = [];
  for (let index = 0; index < original.length; index += 1) {
    const mark = Boolean(marks[index]);
    const last = parts[parts.length - 1];
    if (last && last.mark === mark) last.text += original[index];
    else parts.push({ mark, text: original[index] as string });
  }
  return parts;
}

function wordStart(text: string, from: number, anchor: number): number {
  if (from === 0) return 0;
  const space = text.indexOf(" ", from);
  return space >= 0 && space < anchor ? space + 1 : from;
}

function wordEnd(text: string, to: number): number {
  if (to >= text.length) return text.length;
  const space = text.lastIndexOf(" ", to);
  return space > 0 ? space : to;
}

function snippetOf(page: PreparedPage, terms: string[]): SnippetPart[] {
  const { map, text } = page.folded.text;
  const anchor = [...terms].sort((left, right) => right.length - left.length).map((term) => text.indexOf(term)).find((at) => at >= 0);
  if (anchor === undefined) return [{ mark: false, text: page.description || page.text.slice(0, SNIPPET_LENGTH) }];
  const from = wordStart(text, Math.max(0, anchor - SNIPPET_BEFORE), anchor);
  const to = wordEnd(text, Math.min(text.length, from +SNIPPET_LENGTH));
  const start = map[from] as number;
  const end = to < text.length ? (map[to] as number) : page.text.length;
  const parts = markParts(page.text.slice(start, end), text.slice(from, to), start, map.slice(from, to), terms);
  if (start > 0) parts.unshift({ mark: false, text: "… " });
  if (end < page.text.length) parts.push({ mark: false, text: " …" });
  return parts;
}

function searchSite(pages: PreparedPage[], query: string, limit = RESULT_LIMIT): SiteSearchHit[] {
  const terms = termsOf(query);
  if (!terms.length) return [];
  return pages
  .map((page) => ({ page, score: scoreOf(page, terms) }))
  .filter(({ score }) => score > 0)
  .sort((left, right) => right.score - left.score)
  .slice(0, limit)
  .map(({ page }) => {
      const section = bestSection(page, terms);
      const href = section?.id ? `${page.path}#${section.id}` : page.path;
      return { href, path: page.path, ...(section ? { section } : {}), snippet: snippetOf(page, terms), title: page.title };
  });
}

export { fold, preparePages, searchSite };
export type { PreparedPage, SiteSearchHit, SnippetPart };
