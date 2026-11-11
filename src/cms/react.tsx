import { createContext, createElement, Fragment, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { emptyCmsDocument, itemSlugs, type CmsDocument } from "./document.js";
import { cmsCollectionAttrs, cmsFieldAttrs, cmsItemAttrs } from "./markers.js";
import { CMS_EDIT_PARAM, fieldAddress, parseAddress } from "./protocol.js";
import { DEFAULT_MEDIA_BASE } from "./runtime.js";
import type { CmsField, CmsSchema } from "./schema.js";
import { createCmsStore, type CmsStore } from "./store.js";
import type { CmsImageValue, CmsLinkValue, CmsRichBlock, CmsRun, CmsValue } from "./values.js";

type CmsProviderProps = {
  children?: ReactNode;
  document?: CmsDocument;
  editorOrigins?: string[];
  enabled?: boolean;
  fallbackLocale?: string;
  locale: string;
  mediaBase?: string;
  schema: CmsSchema;
};

type CmsItemView = { field: (key: string) => string; id: string; slug: string; value: (key: string) => CmsValue | undefined };

const CmsContext = createContext<CmsStore | null>(null);

function fieldDefinition(schema: CmsSchema, address: string): CmsField | undefined {
  const target = parseAddress(address);
  if ("collection" in target) return schema.collections[target.collection]?.fields[target.field];
  return schema.fields[target.field];
}

function useCmsStore(): CmsStore {
  const store = useContext(CmsContext);
  if (!store) throw new Error("cms-provider-missing");
  return store;
}

function useCmsDocument(): CmsDocument {
  const store = useCmsStore();
  return useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot);
}

function useCmsValue(address: string): CmsValue | undefined {
  const store = useCmsStore();
  useCmsDocument();
  return store.read(address);
}

function markerAttrs(store: CmsStore, address: string): Record<string, string> {
  const field = fieldDefinition(store.schema, address);
  if (!store.enabled || !field) return {};
  return cmsFieldAttrs(address, field);
}

function CmsProvider(props: CmsProviderProps) {
  const store = useMemo(
    () =>
    createCmsStore({
        document: props.document ?? emptyCmsDocument(),
        editorOrigins: props.editorOrigins ?? [],
        enabled: props.enabled === true,
        fallbackLocale: props.fallbackLocale ?? props.locale,
        locale: props.locale,
        mediaBase: props.mediaBase ?? DEFAULT_MEDIA_BASE,
        schema: props.schema,
    }),
    [props.document, props.schema, props.locale, props.enabled, props.mediaBase],
  );
  useEffect(() => {
      if (!store.enabled || typeof window === "undefined" || window.parent === window) return;
      if (!new URL(window.location.href).searchParams.get(CMS_EDIT_PARAM)) return;
      let stop: (() => void) | null = null;
      void import("./edit.js").then((module) => {
          stop = module.startCmsEditMode(store);
      });
      return () => stop?.();
    }, [store]);
  return createElement(CmsContext.Provider, { value: store }, props.children);
}

function lines(text: string): ReactNode {
  const parts = text.split(/\r?\n/u);
  return parts.map((part, index) => createElement(Fragment, { key: index }, index ? createElement("br") : null, part));
}

function CmsText(props: { as?: string; className?: string; fallback?: string; field: string }) {
  const store = useCmsStore();
  const value = useCmsValue(props.field);
  const text = typeof value === "string" && value ? value : (props.fallback ?? "");
  return createElement(props.as ?? "span", { ...markerAttrs(store, props.field), className: props.className }, lines(text));
}

function renderRun(run: CmsRun, index: number): ReactNode {
  let node: ReactNode = run.text;
  if (run.bold) node = createElement("strong", null, node);
  if (run.italic) node = createElement("em", null, node);
  if (run.href) node = createElement("a", { href: run.href }, node);
  return createElement(Fragment, { key: index }, node);
}

function renderBlocks(blocks: CmsRichBlock[]): ReactNode {
  return blocks.map((block, index) =>
    block.type === "p"
    ? createElement("p", { key: index }, block.runs.map(renderRun))
    : createElement(block.type, { key: index }, block.items.map((runs, item) => createElement("li", { key: item }, runs.map(renderRun)))),
  );
}

function CmsRichText(props: { className?: string; fallback?: ReactNode; field: string }) {
  const store = useCmsStore();
  const value = useCmsValue(props.field);
  const blocks = Array.isArray(value) && value.length ? renderBlocks(value as CmsRichBlock[]) : props.fallback;
  return createElement("div", { ...markerAttrs(store, props.field), className: props.className }, blocks);
}

function cmsMediaUrl(src: string, mediaBase: string): string {
  if (/^(?:https?:)?\/\//iu.test(src) || src.startsWith("/") || src.startsWith("data:")) return src;
  return `${mediaBase.replace(/\/+$/u, "")}/${src.replace(/^\/+/u, "")}`;
}

function CmsImage(props: { className?: string; fallback?: CmsImageValue; field: string; loading?: "eager" | "lazy"; sizes?: string }) {
  const store = useCmsStore();
  const stored = useCmsValue(props.field) as CmsImageValue | undefined;
  const value = stored?.src ? stored : props.fallback;
  if (!value?.src) return store.enabled ? createElement("span", { ...markerAttrs(store, props.field), className: props.className }) : null;
  return createElement("img", {
      ...markerAttrs(store, props.field),
      alt: value.alt,
      className: props.className,
      decoding: "async",
      height: value.height,
      loading: props.loading ?? "lazy",
      sizes: props.sizes,
      src: cmsMediaUrl(value.src, store.mediaBase),
      width: value.width,
  });
}

function CmsLink(props: { children?: (label: string) => ReactNode; className?: string; fallback?: CmsLinkValue; field: string }) {
  const store = useCmsStore();
  const stored = useCmsValue(props.field) as CmsLinkValue | undefined;
  const value = stored?.href ? stored : props.fallback;
  if (!value?.href) return null;
  const external = /^https?:\/\//iu.test(value.href);
  return createElement(
    "a",
    { ...markerAttrs(store, props.field), className: props.className, href: value.href, ...(external ? { rel: "noopener", target: "_blank" } : {}) },
    props.children ? props.children(value.label) : value.label,
  );
}

function useCmsCollection(id: string): CmsItemView[] {
  const store = useCmsStore();
  const document = useCmsDocument();
  const slugs = itemSlugs(store.schema, document, id, store.locale, store.fallbackLocale);
  return (document.collections[id] ?? []).map((item) => ({
        field: (key: string) => fieldAddress(id, item.id, key),
        id: item.id,
        slug: slugs.get(item.id) ?? item.id,
        value: (key: string) => store.read(fieldAddress(id, item.id, key)),
  }));
}

function useCmsItem(id: string, slug: string): CmsItemView | null {
  return useCmsCollection(id).find((item) => item.slug === slug) ?? null;
}

function CmsCollection(props: {
    as?: string;
    className?: string;
    empty?: ReactNode;
    id: string;
    itemAs?: string;
    itemClassName?: string;
    render: (item: CmsItemView, index: number) => ReactNode;
}) {
  const store = useCmsStore();
  const items = useCmsCollection(props.id);
  const attrs = store.enabled ? cmsCollectionAttrs(props.id) : {};
  const children = items.length
  ? items.map((item, index) =>
    createElement(
      props.itemAs ?? "div",
      { ...(store.enabled ? cmsItemAttrs(item.id) : {}), className: props.itemClassName, key: item.id },
      props.render(item, index),
    ),
  )
  : props.empty;
  return createElement(props.as ?? "div", { ...attrs, className: props.className }, children);
}

export {
  CmsCollection,
  CmsImage,
  CmsLink,
  cmsMediaUrl,
  CmsProvider,
  CmsRichText,
  CmsText,
  fieldDefinition,
  useCmsCollection,
  useCmsDocument,
  useCmsItem,
  useCmsStore,
  useCmsValue,
};
export type { CmsItemView, CmsProviderProps };
