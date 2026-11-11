import { localeValue, type CmsDocument } from "./document.js";
import { parseAddress } from "./protocol.js";
import type { CmsSchema } from "./schema.js";
import type { CmsValue } from "./values.js";

type CmsStoreOptions = {
  document: CmsDocument;
  editorOrigins: string[];
  enabled: boolean;
  fallbackLocale: string;
  locale: string;
  mediaBase: string;
  schema: CmsSchema;
};

type CmsStore = CmsStoreOptions& {
  read: (address: string) => CmsValue | undefined;
  replace: (document: CmsDocument) => void;
  setValue: (address: string, value: CmsValue) => void;
  snapshot: () => CmsDocument;
  subscribe: (listener: () => void) => () => void;
};

function writeValue(document: CmsDocument, address: string, locale: string, value: CmsValue): CmsDocument {
  const target = parseAddress(address);
  if (!("collection"in target)) {
    return { ...document, fields: { ...document.fields, [target.field]: { ...document.fields[target.field], [locale]: value } } };
  }
  const items = (document.collections[target.collection] ?? []).map((item) =>
    item.id === target.item ? { ...item, values: { ...item.values, [locale]: { ...item.values[locale], [target.field]: value } } } : item,
  );
  return { ...document, collections: { ...document.collections, [target.collection]: items } };
}

function createCmsStore(options: CmsStoreOptions): CmsStore {
  let current = options.document;
  const listeners = new Set<()=>void>();
  const notify = () => {
    for (const listener of listeners) listener();
  };
  const store: CmsStore = {
    ...options,
    read: (address) => {
      const target = parseAddress(address);
      if (!("collection"in target)) return localeValue(current.fields[target.field], options.locale, options.fallbackLocale);
      const item = (current.collections[target.collection] ?? []).find((entry) => entry.id === target.item);
      return localeValue(item?.values, options.locale, options.fallbackLocale)?.[target.field];
    },
    replace: (document) => {
      current = document;
      notify();
    },
    setValue: (address, value) => {
      current = writeValue(current, address, options.locale, value);
      notify();
    },
    snapshot: () => current,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return store;
}

export { createCmsStore, writeValue };
export type { CmsStore, CmsStoreOptions };
