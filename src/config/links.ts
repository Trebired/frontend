import { assertPlainObject, invalidConfig } from "./shared.js";

import type {
  NormalizedFrontendLink,
  NormalizedFrontendLinkGroup,
  NormalizedFrontendLinkMessages,
  NormalizedFrontendLinksConfig,
  NormalizedFrontendLinkSet,
} from "./types/links.js";

const LINKS_FIELDS = ["categories", "icon", "links", "messages", "sets"];
const LINK_FIELDS = ["external", "href", "site"];
const SET_FIELDS = ["footer", "header", "site", "sitemap"];
const FOOTER_FIELDS = ["columns", "note", "site"];
const GROUP_FIELDS = ["group", "links", "search", "sitemap"];
const MESSAGE_FIELDS = ["categories", "descriptions", "groups", "links"];

const DEFAULT_LINK_ICON = "remixicon:external-link-line";

const ROOT = "config.links";

function assertFields(source: Record<string, unknown>, fields: string[], pathLabel: string) {
  for (const key of Object.keys(source)) {
    if (!fields.includes(key)) throw invalidConfig(`${pathLabel}.${key} is not supported`);
  }
}

function text(value: unknown, pathLabel: string): string {
  if (typeof value !== "string" || !value.trim()) throw invalidConfig(`${pathLabel} must be a non-empty string`);
  return value.trim();
}

function keys(value: unknown, known: Record<string, unknown>, pathLabel: string, kind: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw invalidConfig(`${pathLabel} must be an array of ${kind} keys`);
  return value.map((entry, index) => {
      const key = text(entry, `${pathLabel}[${index}]`);
      if (!(key in known)) throw invalidConfig(`${pathLabel}[${index}] names "${key}", which is not a ${kind} in ${ROOT}`);
      return key;
  });
}

function normalizeLink(value: unknown, pathLabel: string): NormalizedFrontendLink {
  const source = assertPlainObject(value, pathLabel);
  assertFields(source, LINK_FIELDS, pathLabel);
  if (source.external !== undefined && typeof source.external !== "boolean") throw invalidConfig(`${pathLabel}.external must be boolean`);
  return {
    external: source.external === true,
    href: text(source.href, `${pathLabel}.href`),
    site: source.site === undefined ? "" : text(source.site, `${pathLabel}.site`),
  };
}

function normalizeGroup(value: Record<string, unknown>, links: Record<string, unknown>, pathLabel: string): NormalizedFrontendLinkGroup {
  assertFields(value, GROUP_FIELDS, pathLabel);
  const sitemap = value.sitemap === true;
  const entries = keys(value.links, links, `${pathLabel}.links`, "link");
  if (!sitemap && !entries.length) throw invalidConfig(`${pathLabel} needs links or sitemap: true`);
  return { group: text(value.group, `${pathLabel}.group`), links: entries, search: value.search === true, sitemap };
}

function normalizeSet(name: string, value: unknown, links: Record<string, unknown>, categories: Record<string, unknown>): NormalizedFrontendLinkSet {
  const pathLabel = `${ROOT}.sets.${name}`;
  const source = assertPlainObject(value, pathLabel);
  assertFields(source, SET_FIELDS, pathLabel);
  const footer = assertPlainObject(source.footer ?? {}, `${pathLabel}.footer`);
  assertFields(footer, FOOTER_FIELDS, `${pathLabel}.footer`);
  const header = source.header === undefined ? [] : source.header;
  if (!Array.isArray(header)) throw invalidConfig(`${pathLabel}.header must be an array`);
  const columns = footer.columns === undefined ? [] : footer.columns;
  if (!Array.isArray(columns)) throw invalidConfig(`${pathLabel}.footer.columns must be an array of category key arrays`);
  return {
    footer: {
      columns: columns.map((column, index) => keys(column, categories, `${pathLabel}.footer.columns[${index}]`, "category")),
      note: keys(footer.note, links, `${pathLabel}.footer.note`, "link"),
      site: keys(footer.site, links, `${pathLabel}.footer.site`, "link"),
    },
    header: header.map((item, index) => {
        const itemPath = `${pathLabel}.header[${index}]`;
        if (typeof item === "string") return keys([item], links, itemPath, "link")[0] as string;
        return normalizeGroup(assertPlainObject(item, itemPath), links, itemPath);
    }),
    site: source.site === undefined ? name : text(source.site, `${pathLabel}.site`),
    sitemap: source.sitemap === undefined ? Object.keys(categories) : keys(source.sitemap, categories, `${pathLabel}.sitemap`, "category"),
  };
}

function labels(value: unknown, pathLabel: string): Record<string, string> {
  if (value === undefined) return {};
  const source = assertPlainObject(value, pathLabel);
  return Object.fromEntries(Object.entries(source).map(([key, entry]) => [key, text(entry, `${pathLabel}.${key}`)]));
}

function normalizeMessages(locale: string, value: unknown): NormalizedFrontendLinkMessages {
  const pathLabel = `${ROOT}.messages.${locale}`;
  const source = assertPlainObject(value, pathLabel);
  assertFields(source, MESSAGE_FIELDS, pathLabel);
  return {
    categories: labels(source.categories, `${pathLabel}.categories`),
    descriptions: labels(source.descriptions, `${pathLabel}.descriptions`),
    groups: labels(source.groups, `${pathLabel}.groups`),
    links: labels(source.links, `${pathLabel}.links`),
  };
}

function missing(record: Record<string, string>, wanted: string[], pathLabel: string) {
  const absent = wanted.filter((key) => !record[key]);
  if (absent.length) throw invalidConfig(`${pathLabel} has no label for ${absent.map((key) => `"${key}"`).join(", ")}`);
}

function assertLabelled(config: NormalizedFrontendLinksConfig) {
  const groups = Object.values(config.sets).flatMap((set) => set.header.filter((item) => typeof item !== "string").map((item) => item.group));
  for (const [locale, messages] of Object.entries(config.messages)) {
    missing(messages.links, Object.keys(config.links), `${ROOT}.messages.${locale}.links`);
    missing(messages.categories, Object.keys(config.categories), `${ROOT}.messages.${locale}.categories`);
    missing(messages.groups, groups, `${ROOT}.messages.${locale}.groups`);
  }
}

function normalizeLinksConfig(value: unknown): NormalizedFrontendLinksConfig | null {
  if (value === undefined) return null;
  const source = assertPlainObject(value, ROOT);
  assertFields(source, LINKS_FIELDS, ROOT);
  const rawLinks = assertPlainObject(source.links, `${ROOT}.links`);
  const links = Object.fromEntries(Object.entries(rawLinks).map(([key, entry]) => [key, normalizeLink(entry, `${ROOT}.links.${key}`)]));
  const rawCategories = assertPlainObject(source.categories ?? {}, `${ROOT}.categories`);
  const categories = Object.fromEntries(
    Object.entries(rawCategories).map(([key, entry]) => [key, keys(entry, links, `${ROOT}.categories.${key}`, "link")]),
  );
  const rawMessages = assertPlainObject(source.messages, `${ROOT}.messages`);
  if (!Object.keys(rawMessages).length) throw invalidConfig(`${ROOT}.messages needs at least one locale`);
  const sets = assertPlainObject(source.sets, `${ROOT}.sets`);
  const config: NormalizedFrontendLinksConfig = {
    categories,
    icon: source.icon === undefined ? DEFAULT_LINK_ICON : text(source.icon, `${ROOT}.icon`),
    links,
    messages: Object.fromEntries(Object.entries(rawMessages).map(([locale, entry]) => [locale, normalizeMessages(locale, entry)])),
    sets: Object.fromEntries(Object.entries(sets).map(([name, entry]) => [name, normalizeSet(name, entry, links, categories)])),
  };
  assertLabelled(config);
  return config;
}

export { DEFAULT_LINK_ICON, normalizeLinksConfig };
