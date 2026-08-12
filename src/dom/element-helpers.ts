function dataSelector(attr: unknown): string {
  return `[${String(attr || "").trim()}]`;
}

function elementById(id: unknown) {
  return typeof document === "undefined"
  ? null
  : document.getElementById(String(id || ""));
}

function simpleDataSelector(selector: unknown) {
  const value = String(selector || "").trim();
  return value.startsWith("[data-") && !/[\s,>+~]/u.test(value) ? value : "";
}

function scopedElementById(root: ParentNode | null | undefined, id: unknown) {
  const safeId = String(id || "").trim();
  if (!safeId || !root || !("querySelector"in root)) return null;
  if (root instanceof Document) return root.getElementById(safeId);
  const matches = root.querySelectorAll("[id]");
  return Array.from(matches).find((element) => element.id === safeId) || null;
}

function scopedSelectorElements(root: ParentNode | null | undefined, selector: string) {
  const value = String(selector || "").trim();
  if (!root || !("querySelectorAll"in root)) return [];
  if (value.startsWith("#")) {
    const element = scopedElementById(root, value.slice(1));
    return element ? [element] : [];
  }
  if (!simpleDataSelector(value)) return [];
  return Array.from(root.querySelectorAll(value));
}

function textContentValue(value: unknown, fallback: unknown = "") {
  return value == null
  ? String(fallback == null ? "" : fallback)
  : String(value);
}

function setTextContent(
  element: Element | null | undefined,
  value: unknown,
  options: { fallback?: unknown } = {},
) {
  if (!element) return;
  element.textContent = textContentValue(value, options.fallback);
}

function setSelectorText(
  root: ParentNode | null | undefined,
  selector: string,
  value: unknown,
  options: { fallback?: unknown } = {},
) {
  setTextContent(scopedSelectorElements(root, selector)[0] || null, value, options);
}

function setDocumentText(
  selector: string,
  value: unknown,
  options: { fallback?: unknown } = {},
) {
  if (typeof document !== "undefined") setSelectorText(document, selector, value, options);
}

function setDocumentIdText(
  id: unknown,
  value: unknown,
  options: { fallback?: unknown } = {},
) {
  setTextContent(elementById(id), value, options);
}

function setDocumentTexts(
  selectors: string[] | null | undefined,
  value: unknown,
  options: { fallback?: unknown } = {},
) {
  if (typeof document === "undefined") return;
  (Array.isArray(selectors) ? selectors : []).forEach((selector) => {
      scopedSelectorElements(document, selector).forEach((element) => {
          setTextContent(element, value, options);
      });
  });
}

function clearChildren(element: Element | null | undefined) {
  if (!element) return;
  while (element.firstChild) element.removeChild(element.firstChild);
}

function setFormControlsDisabled(root: ParentNode | null | undefined, disabled: boolean) {
  root?.querySelectorAll?.("input, select, textarea, button").forEach((control) => {
      if ("disabled"in control)(control as HTMLButtonElement).disabled = disabled;
  });
}

function cloneTemplateElement(
  template: HTMLTemplateElement | null | undefined,
  options: { enableControls?: boolean } = {},
) {
  if (!(template instanceof HTMLTemplateElement)) return null;
  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const row = fragment.firstElementChild || null;
  if (row && options.enableControls === true) setFormControlsDisabled(row, false);
  return row;
}

function cloneTemplateElementById(id: unknown, options: { enableControls?: boolean } = {}) {
  const template = elementById(id);
  return cloneTemplateElement(
    template instanceof HTMLTemplateElement ? template : null,
    options,
  );
}

function syncListEmptyState(
  empty: HTMLElement | null | undefined,
  list: ParentNode | null | undefined,
  itemSelector: string,
) {
  if (empty && list) empty.hidden = list.querySelectorAll(itemSelector).length > 0;
}

function replaceHtml(target: HTMLElement | null | undefined, html: unknown) {
  if (!(target instanceof HTMLElement)) return;
  const nextHtml = String(html || "");
  if (!nextHtml) return;
  target.innerHTML = nextHtml;
}

function readHostJsonConfig<T>(
  host: ParentNode | null | undefined,
  selector: string,
  fallback: T,
): T {
  const element = host?.querySelector?.(selector) || null;
  if (!(element instanceof HTMLScriptElement)) return fallback;
  try {
    const parsed = JSON.parse(element.textContent || "{}");
    return parsed && typeof parsed === "object" ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export {
  clearChildren,
  cloneTemplateElement,
  cloneTemplateElementById,
  dataSelector,
  elementById,
  readHostJsonConfig,
  replaceHtml,
  scopedElementById,
  scopedSelectorElements,
  setDocumentIdText,
  setDocumentText,
  setDocumentTexts,
  setFormControlsDisabled,
  setSelectorText,
  setTextContent,
  syncListEmptyState,
  textContentValue,
};
