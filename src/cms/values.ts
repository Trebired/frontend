import type { CmsField, CmsRichMark } from "./schema.js";

type CmsRun = { bold?: boolean; href?: string; italic?: boolean; text: string };
type CmsRichBlock = { runs: CmsRun[]; type: "p" } | { items: CmsRun[][]; type: "ol" | "ul" };
type CmsImageValue = { alt: string; height?: number; src: string; width?: number };
type CmsLinkValue = { href: string; label: string };
type CmsValue = boolean | number | string | CmsImageValue | CmsLinkValue | CmsRichBlock[];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const SAFE_HREF = /^(?:https?:\/\/|mailto:|tel:|\/|#)/iu;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function runIssue(run: unknown, marks: CmsRichMark[]): string | null {
  if (!isRecord(run) || typeof run.text !== "string") return "cms-rich-run";
  if (run.bold && !marks.includes("bold")) return "cms-mark-bold";
  if (run.italic && !marks.includes("italic")) return "cms-mark-italic";
  if (run.href !== undefined && (!marks.includes("link") || typeof run.href !== "string" || !SAFE_HREF.test(run.href))) return "cms-mark-link";
  return null;
}

function richLength(blocks: CmsRichBlock[]): number {
  let total = 0;
  for (const block of blocks) {
    const lines = block.type === "p" ? [block.runs] : block.items;
    for (const runs of lines) for (const run of runs) total += run.text.length;
  }
  return total;
}

function richIssue(value: unknown, marks: CmsRichMark[], maxLength?: number): string | null {
  if (!Array.isArray(value)) return "cms-rich-blocks";
  for (const block of value as unknown[]) {
    if (!isRecord(block)) return "cms-rich-block";
    if (block.type === "p" && Array.isArray(block.runs)) {
      const issue = block.runs.map((run) => runIssue(run, marks)).find(Boolean);
      if (issue) return issue;
      continue;
    }
    if ((block.type === "ul" || block.type === "ol") && Array.isArray(block.items) && marks.includes("list")) {
      for (const item of block.items) {
        if (!Array.isArray(item)) return "cms-rich-item";
        const issue = item.map((run) => runIssue(run, marks)).find(Boolean);
        if (issue) return issue;
      }
      continue;
    }
    return "cms-rich-block";
  }
  if (maxLength !== undefined && richLength(value as CmsRichBlock[]) > maxLength) return "cms-too-long";
  return null;
}

function emptyValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (isRecord(value) && "src"in value) return !value.src;
  if (isRecord(value) && "href"in value) return !value.href;
  return false;
}

function kindIssue(field: CmsField, value: unknown): string | null {
  switch (field.kind) {
    case "text":
    if (typeof value !== "string") return "cms-text";
    if (field.maxLength !== undefined && value.length > field.maxLength) return "cms-too-long";
    return !field.multiline && /[\r\n]/u.test(value) ? "cms-single-line" : null;
    case "richText":
    return richIssue(value, field.marks ?? ["bold", "italic", "link"], field.maxLength);
    case "image":
    return isRecord(value) && typeof value.src === "string" && typeof value.alt === "string" ? null : "cms-image";
    case "link":
    return isRecord(value) && typeof value.href === "string" && SAFE_HREF.test(value.href) && typeof value.label === "string" ? null : "cms-link";
    case "date":
    return typeof value === "string" && DATE_PATTERN.test(value) ? null : "cms-date";
    case "number":
    if (typeof value !== "number" || !Number.isFinite(value)) return "cms-number";
    if (field.min !== undefined && value < field.min) return "cms-too-small";
    return field.max !== undefined && value > field.max ? "cms-too-large" : null;
    case "toggle":
    return typeof value === "boolean" ? null : "cms-toggle";
  }
}

function validateValue(field: CmsField, value: unknown): string | null {
  if (emptyValue(value)) return "required"in field && field.required ? "cms-required" : null;
  return kindIssue(field, value);
}

export { emptyValue, isRecord, richLength, validateValue };
export type { CmsImageValue, CmsLinkValue, CmsRichBlock, CmsRun, CmsValue };
