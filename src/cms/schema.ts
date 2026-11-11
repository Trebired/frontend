type CmsLocalized<T> = T | Record<string, T>;

type CmsTextField = { kind: "text"; label: CmsLocalized<string>; maxLength?: number; multiline?: boolean; required?: boolean };
type CmsRichMark = "bold" | "italic" | "link" | "list";
type CmsRichTextField = { kind: "richText"; label: CmsLocalized<string>; marks?: CmsRichMark[]; maxLength?: number; required?: boolean };
type CmsImageField = { kind: "image"; label: CmsLocalized<string>; aspect?: number; maxWidth?: number; required?: boolean };
type CmsLinkField = { kind: "link"; label: CmsLocalized<string>; external?: boolean; required?: boolean };
type CmsDateField = { kind: "date"; label: CmsLocalized<string>; required?: boolean };
type CmsNumberField = { kind: "number"; label: CmsLocalized<string>; max?: number; min?: number; required?: boolean; step?: number };
type CmsToggleField = { kind: "toggle"; label: CmsLocalized<string> };

type CmsField = CmsDateField | CmsImageField | CmsLinkField | CmsNumberField | CmsRichTextField | CmsTextField | CmsToggleField;
type CmsFieldKind = CmsField["kind"];

type CmsCollection = {
  fields: Record<string, CmsField>;
  label: CmsLocalized<string>;
  max?: number;
  min?: number;
  slugFrom?: string;
};

type CmsSchema = {
  collections: Record<string, CmsCollection>;
  fields: Record<string, CmsField>;
};

const FIELD_KINDS: CmsFieldKind[] = ["date", "image", "link", "number", "richText", "text", "toggle"];
const ID_PATTERN = /^[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)*$/u;
const RICH_MARKS: CmsRichMark[] = ["bold", "italic", "link", "list"];

function assertId(id: string, where: string): void {
  if (!ID_PATTERN.test(id)) throw new Error(`cms-invalid-id:${where}:${id}`);
}

function assertField(id: string, field: CmsField): void {
  assertId(id, "field");
  if (!field || !FIELD_KINDS.includes(field.kind)) throw new Error(`cms-invalid-kind:${id}`);
  if (field.kind === "richText" && field.marks?.some((mark) => !RICH_MARKS.includes(mark))) throw new Error(`cms-invalid-mark:${id}`);
}

function defineContent(schema: Partial<CmsSchema>): CmsSchema {
  const fields = schema.fields ?? {};
  const collections = schema.collections ?? {};
  for (const [id, field] of Object.entries(fields)) assertField(id, field);
  for (const [id, collection] of Object.entries(collections)) {
    assertId(id, "collection");
    if (fields[id]) throw new Error(`cms-duplicate-id:${id}`);
    for (const [key, field] of Object.entries(collection.fields)) assertField(key, field);
    if (collection.slugFrom && collection.fields[collection.slugFrom]?.kind !== "text") throw new Error(`cms-invalid-slug:${id}`);
    if (collection.min !== undefined && collection.max !== undefined && collection.min > collection.max) throw new Error(`cms-invalid-range:${id}`);
  }
  return { collections, fields };
}

const cmsField = {
  date: (options: Omit<CmsDateField, "kind">): CmsDateField => ({ kind: "date", ...options }),
  image: (options: Omit<CmsImageField, "kind">): CmsImageField => ({ kind: "image", ...options }),
  link: (options: Omit<CmsLinkField, "kind">): CmsLinkField => ({ kind: "link", ...options }),
  number: (options: Omit<CmsNumberField, "kind">): CmsNumberField => ({ kind: "number", ...options }),
  richText: (options: Omit<CmsRichTextField, "kind">): CmsRichTextField => ({ kind: "richText", ...options }),
  text: (options: Omit<CmsTextField, "kind">): CmsTextField => ({ kind: "text", ...options }),
  toggle: (options: Omit<CmsToggleField, "kind">): CmsToggleField => ({ kind: "toggle", ...options }),
};

function cmsCollection(options: CmsCollection): CmsCollection {
  return options;
}

function localizedLabel(label: CmsLocalized<string>, locale: string): string {
  if (typeof label === "string") return label;
  return label[locale] ?? Object.values(label)[0] ?? "";
}

export { cmsCollection, cmsField, defineContent, FIELD_KINDS, localizedLabel, RICH_MARKS };
export type {
  CmsCollection,
  CmsDateField,
  CmsField,
  CmsFieldKind,
  CmsImageField,
  CmsLinkField,
  CmsLocalized,
  CmsNumberField,
  CmsRichMark,
  CmsRichTextField,
  CmsSchema,
  CmsTextField,
  CmsToggleField,
};
