import { FRONTEND_PREFIX, frontendDataAttr } from "#5vbaqj4pirp3";

type LocaleMeta = {
  description?: string;
  title?: string;
};

type LocaleMarkers = {
  end: ChildNode;
  start: ChildNode;
};

const LOCALE_VIEW_ATTR = frontendDataAttr("locale-view");
const LOCALE_META_ATTR = frontendDataAttr("locale-meta");
const LOCALE_RENDERED_ATTR = frontendDataAttr("locale-rendered");
const LOCALE_PENDING_ATTR = frontendDataAttr("locale-pending");
const LOCALE_START_MARK = `${FRONTEND_PREFIX}:locale-start`;
const LOCALE_END_MARK = `${FRONTEND_PREFIX}:locale-end`;
const COMMENT_NODE = 8;

function findLocaleMarkers(body: HTMLElement): LocaleMarkers | null {
  let start: ChildNode | null = null;
  let end: ChildNode | null = null;
  for (const node of Array.from(body.childNodes)) {
    if (node.nodeType !== COMMENT_NODE) continue;
    if (node.nodeValue === LOCALE_START_MARK) start = node;
    if (node.nodeValue === LOCALE_END_MARK) end = node;
  }
  return start && end ? { end, start } : null;
}

function readLocaleMeta(doc: Document): Record<string, LocaleMeta> {
  const node = doc.querySelector(`script[${LOCALE_META_ATTR}]`);
  try {
    const parsed = JSON.parse(node?.textContent || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function applyLocaleMeta(doc: Document, locale: string): void {
  const meta = readLocaleMeta(doc)[locale];
  if (!meta) return;
  if (meta.title) doc.title = meta.title;
  if (meta.description) doc.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
}

function renderedLocale(doc: Document): string {
  const root = doc.documentElement;
  return root.getAttribute(LOCALE_RENDERED_ATTR) || root.lang;
}

function localeTemplate(doc: Document, locale: string): HTMLTemplateElement | null {
  const templates = Array.from(doc.querySelectorAll<HTMLTemplateElement>(`template[${LOCALE_VIEW_ATTR}]`));
  return templates.find((template) => template.getAttribute(LOCALE_VIEW_ATTR) === locale) || null;
}

function applyLocaleView(doc: Document, locale: string): boolean {
  if (!locale || !doc.body || renderedLocale(doc) === locale) return false;
  const markers = findLocaleMarkers(doc.body);
  const template = localeTemplate(doc, locale);
  if (!markers || !template) return false;
  while (markers.start.nextSibling && markers.start.nextSibling !== markers.end) {
    markers.start.nextSibling.remove();
  }
  doc.body.insertBefore(doc.importNode(template.content, true), markers.end);
  doc.documentElement.lang = locale;
  doc.documentElement.setAttribute(LOCALE_RENDERED_ATTR, locale);
  applyLocaleMeta(doc, locale);
  return true;
}

export {
  LOCALE_END_MARK,
  LOCALE_META_ATTR,
  LOCALE_PENDING_ATTR,
  LOCALE_RENDERED_ATTR,
  LOCALE_START_MARK,
  LOCALE_VIEW_ATTR,
  applyLocaleMeta,
  applyLocaleView,
  readLocaleMeta,
};
export type { LocaleMeta };
