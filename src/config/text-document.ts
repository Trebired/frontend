type TextDocumentPart = { body: string[]; heading: string };

type TextDocumentSection = { body: string[]; heading: string; parts?: TextDocumentPart[] };

type TextDocument = { sections: TextDocumentSection[]; title: string; updated: string };

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

function readParagraphs(body: string): string[] {
  return body.split(/\n{2,}/u).map((part) => part.trim()).filter(Boolean);
}

function readParts(body: string): TextDocumentPart[] {
  return body
  .split(/\n### /u)
  .slice(1)
  .map((block) => {
      const [heading = "", ...rest] = block.split("\n");
      return { body: readParagraphs(rest.join("\n")), heading: heading.trim() };
  })
  .filter((part) => part.heading && part.body.length > 0);
}

function readSection(block: string): TextDocumentSection {
  const [heading = "", ...rest] = block.split("\n");
  const body = `\n${rest.join("\n")}`;
  const parts = readParts(body);
  if (parts.length > 0) return { body: [], heading: heading.trim(), parts };
  return { body: readParagraphs(body), heading: heading.trim() };
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
  const sections = readSections(`\n${parsed.body.trim()}`);
  if (!title || !updated || sections.length === 0) return null;
  return { sections, title, updated };
}

export { parseTextDocument };
export type { TextDocument, TextDocumentPart, TextDocumentSection };
