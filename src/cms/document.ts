import type { CmsSchema } from "./schema.js";
import { isRecord, validateValue, type CmsValue } from "./values.js";

type CmsLocaleValues = Record<string, CmsValue>;
type CmsItem = { id: string; values: Record<string, CmsLocaleValues> };
type CmsDocument = {
  collections: Record<string, CmsItem[]>;
  fields: Record<string, Record<string, CmsValue>>;
  format: 1;
};
type CmsIssue = { code: string; collection?: string; field: string; item?: string; locale: string };

const CMS_FORMAT = 1;

function emptyCmsDocument(): CmsDocument {
  return { collections: {}, fields: {}, format: CMS_FORMAT };
}

function normalizeCmsDocument(input: unknown): CmsDocument {
  if (!isRecord(input)) return emptyCmsDocument();
  if (input.format !== undefined && input.format !== CMS_FORMAT) throw new Error(`cms-format-unsupported:${String(input.format)}`);
  const fields: CmsDocument["fields"] = {};
  for (const [id, values] of Object.entries(isRecord(input.fields) ? input.fields : {})) {
    if (isRecord(values)) fields[id] = values as Record<string, CmsValue>;
  }
  const collections: CmsDocument["collections"] = {};
  for (const [id, items] of Object.entries(isRecord(input.collections) ? input.collections : {})) {
    if (!Array.isArray(items)) continue;
    collections[id] = items
    .filter((item): item is CmsItem => isRecord(item) && typeof item.id === "string" && isRecord(item.values))
    .map((item) => ({ id: item.id, values: item.values }));
  }
  return { collections, fields, format: CMS_FORMAT };
}

function sortedRecord<T>(record: Record<string, T>, map: (value: T) => unknown = (value) => value): Record<string, unknown> {
  return Object.fromEntries(Object.keys(record).sort().map((key) => [key, map(record[key] as T)]));
}

function serializeCmsDocument(document: CmsDocument): string {
  const stable = {
    format: CMS_FORMAT,
    fields: sortedRecord(document.fields, (values) => sortedRecord(values)),
    collections: sortedRecord(document.collections, (items) =>
      items.map((item) => ({ id: item.id, values: sortedRecord(item.values, (values) => sortedRecord(values)) })),
    ),
  };
  return `${JSON.stringify(stable, null, 2)}\n`;
}

function localeValue<T>(values: Record<string, T>|undefined, locale: string, fallbackLocale: string): T | undefined {
  if (!values) return undefined;
  return values[locale] ?? values[fallbackLocale];
}

function validateCmsDocument(schema: CmsSchema, document: CmsDocument, locales: string[]): CmsIssue[] {
  const issues: CmsIssue[] = [];
  for (const [id, field] of Object.entries(schema.fields)) {
    for (const locale of locales) {
      const code = validateValue(field, document.fields[id]?.[locale]);
      if (code) issues.push({ code, field: id, locale });
    }
  }
  for (const [id, collection] of Object.entries(schema.collections)) {
    const items = document.collections[id] ?? [];
    if (collection.min !== undefined && items.length < collection.min) issues.push({ code: "cms-too-few", collection: id, field: "", locale: "" });
    if (collection.max !== undefined && items.length > collection.max) issues.push({ code: "cms-too-many", collection: id, field: "", locale: "" });
    for (const item of items) {
      for (const [key, field] of Object.entries(collection.fields)) {
        for (const locale of locales) {
          const code = validateValue(field, item.values[locale]?.[key]);
          if (code) issues.push({ code, collection: id, field: key, item: item.id, locale });
        }
      }
    }
  }
  return issues;
}

function slugify(text: string): string {
  return text
  .normalize("NFKD")
  .replace(/[̀-ͯ]/gu, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/gu, "-")
  .replace(/^-+|-+$/gu, "")
  .slice(0, 80);
}

function itemSlugs(schema: CmsSchema, document: CmsDocument, collectionId: string, locale: string, fallbackLocale: string) {
  const collection = schema.collections[collectionId];
  const slugs = new Map<string, string>();
  if (!collection?.slugFrom) return slugs;
  const used = new Set<string>();
  for (const item of document.collections[collectionId] ?? []) {
    const source = localeValue(item.values, locale, fallbackLocale)?.[collection.slugFrom];
    const base = slugify(typeof source === "string" ? source : "") || item.id;
    let slug = base;
    for (let index = 2; used.has(slug); index += 1) slug = `${base}-${index}`;
    used.add(slug);
    slugs.set(item.id, slug);
  }
  return slugs;
}

export { CMS_FORMAT, emptyCmsDocument, itemSlugs, localeValue, normalizeCmsDocument, serializeCmsDocument, slugify, validateCmsDocument };
export type { CmsDocument, CmsIssue, CmsItem, CmsLocaleValues };
