type TextDocumentParts = "disclosure" | "prose";

type TextDocumentPart = { body: string[]; heading: string; id: string };

type TextDocumentSection = { body: string[]; heading: string; id: string; parts?: TextDocumentPart[] };

type TextDocument = {
  lead: string[];
  parts: TextDocumentParts;
  sections: TextDocumentSection[];
  title: string;
  updated: string;
};

const PART_MODES: readonly TextDocumentParts[] = ["disclosure", "prose"];

function documentSlug(heading: string): string {
  return heading
  .normalize("NFD")
  .replace(/[̀-ͯ]/gu, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/gu, "-")
  .replace(/^-+|-+$/gu, "");
}

function readFrontMatter(raw: string) {
  const match = /^---\n([\s\S]*?)\n---\n/u.exec(raw);
  if (!match) return null;
  const fields: Record<string, string> = {};
  for (const line of(match[1] as string).split("\n")) {
    const [, key = "", value = ""] = /^([a-z]+):\s*(.*)$/u.exec(line.trim()) || [];
    if (key) fields[key] = value.trim();
  }
  return { body: raw.slice(match[0].length), fields };
}

function readPartsMode(value: string): TextDocumentParts {
  const mode = value as TextDocumentParts;
  return PART_MODES.includes(mode) ? mode : "prose";
}

function readParagraphs(body: string): string[] {
  return body.split(/\n{2,}/u).map((part) => part.trim()).filter(Boolean);
}

function readParts(body: string): TextDocumentPart[] {
  return body
  .split(/\n### /u)
  .slice(1)
  .map((block) => {
      const [heading = "", ...rest] = block.split("\n");
      return { body: readParagraphs(rest.join("\n")), heading: heading.trim(), id: documentSlug(heading) };
  })
  .filter((part) => part.heading && part.body.length > 0);
}

function readSection(block: string): TextDocumentSection {
  const [heading = "", ...rest] = block.split("\n");
  const body = `\n${rest.join("\n")}`;
  const parts = readParts(body);
  const base = { heading: heading.trim(), id: documentSlug(heading) };
  if (parts.length > 0) return { ...base, body: [], parts };
  return { ...base, body: readParagraphs(body) };
}

function readSections(body: string): TextDocumentSection[] {
  return body
  .split(/\n## /u)
  .slice(1)
  .map((block) => readSection(block))
  .filter((section) => section.heading && (section.body.length > 0 || (section.parts?.length || 0) > 0));
}

function parseTextDocument(raw: string): TextDocument | null {
  const parsed = readFrontMatter(String(raw || "").replace(/\r\n/gu, "\n").trimStart());
  if (!parsed) return null;
  const title = parsed.fields.title || "";
  const updated = parsed.fields.updated || "";
  const body = `\n${parsed.body.trim()}`;
  const sections = readSections(body);
  if (!title || !updated || sections.length === 0) return null;
  return {
    lead: readParagraphs(body.split(/\n## /u)[0] as string),
    parts: readPartsMode(parsed.fields.parts || ""),
    sections,
    title,
    updated,
  };
}

export { documentSlug, parseTextDocument };
export type { TextDocument, TextDocumentPart, TextDocumentParts, TextDocumentSection };
