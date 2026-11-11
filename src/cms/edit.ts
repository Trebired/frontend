import { frontendDataAttr, frontendToken } from "./../namespace/index.js";
import { normalizeCmsDocument } from "./document.js";
import { cmsAttrNames, cmsSelectors } from "./markers.js";
import { CMS_EDIT_PARAM, cmsEnvelope, isCmsMessage, type CmsSiteMessage } from "./protocol.js";
import { readCmsRuntime } from "./runtime.js";
import type { CmsStore } from "./store.js";

const REPORT_DELAY_MS = 120;
const ACCENT = "#3f5bd9";

type EditSession = {
  editing: HTMLElement | null;
  nonce: string;
  origin: string;
  origins: string[];
  store: CmsStore;
  timer: ReturnType<typeof setTimeout>|null;
};

function editNames() {
  return {
    outlineAll: frontendDataAttr("cms-outline-all"),
    selected: frontendDataAttr("cms-selected"),
    styleId: frontendToken("cms-edit-style"),
  };
}

function editStyle(): string {
  const { field, item } = cmsSelectors();
  const { outlineAll, selected } = editNames();
  return [
    `${field},${item}{cursor:pointer;outline-offset:3px;transition:outline-color .15s}`,
    `${field}:hover,${item}:hover,html[${outlineAll}] ${field}{outline:1px dashed ${ACCENT}}`,
    `html[${outlineAll}] ${item}{outline:1px dotted ${ACCENT}}`,
    `[${selected}]{outline:2px solid ${ACCENT} !important}`,
    `${field}[contenteditable]{cursor:text}`,
  ].join("\n");
}

function injectStyle(): void {
  const { styleId } = editNames();
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = editStyle();
  document.head.append(style);
}

function limitsOf(element: Element): Record<string, unknown> {
  try {
    return JSON.parse(element.getAttribute(cmsAttrNames().limits) || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function readyMessage(session: EditSession): CmsSiteMessage {
  const names = cmsAttrNames();
  const selectors = cmsSelectors();
  return {
    collections: [...document.querySelectorAll(selectors.collection)].map((element) => ({
          id: element.getAttribute(names.collection) || "",
          items: [...element.querySelectorAll(selectors.item)].map((item) => item.getAttribute(names.item) || ""),
    })),
    fields: [...document.querySelectorAll(selectors.field)].map((element) => ({
          address: element.getAttribute(names.field) || "",
          kind: element.getAttribute(names.kind) || "",
          limits: limitsOf(element),
    })),
    locale: session.store.locale,
    nonce: session.nonce,
    path: window.location.pathname,
    type: "ready",
  };
}

function post(session: EditSession, message: CmsSiteMessage): void {
  if (session.origin && window.parent) window.parent.postMessage(cmsEnvelope(message), session.origin);
}

function scheduleReport(session: EditSession): void {
  if (session.timer) clearTimeout(session.timer);
  session.timer = setTimeout(() => post(session, readyMessage(session)), REPORT_DELAY_MS);
}

function selectElement(element: Element | null): void {
  const { selected } = editNames();
  for (const current of document.querySelectorAll(`[${selected}]`)) current.removeAttribute(selected);
  element?.setAttribute(selected, "");
}

function startInlineText(session: EditSession, element: HTMLElement): void {
  const address = element.getAttribute(cmsAttrNames().field) || "";
  const limits = limitsOf(element);
  const maxLength = typeof limits.maxLength === "number" ? limits.maxLength : Infinity;
  session.editing = element;
  element.contentEditable = "plaintext-only";
  element.focus();
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") element.blur();
    if (event.key === "Enter" && limits.multiline !== true) event.preventDefault();
  };
  const onInput = () => {
    const text = element.innerText.slice(0, maxLength);
    if (text !== element.innerText) element.innerText = text;
    post(session, { address, type: "change", value: text });
  };
  element.addEventListener("keydown", onKey);
  element.addEventListener("input", onInput);
  element.addEventListener("blur", () => {
      element.removeAttribute("contenteditable");
      element.removeEventListener("keydown", onKey);
      element.removeEventListener("input", onInput);
      session.editing = null;
      session.store.setValue(address, element.innerText.slice(0, maxLength));
    }, { once: true });
}

function focusField(address: string): void {
  const element = document.querySelector(`[${cmsAttrNames().field}="${CSS.escape(address)}"]`);
  selectElement(element);
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function handleParent(session: EditSession, event: MessageEvent): void {
  if (!session.origins.includes(event.origin) || !isCmsMessage(event.data)) return;
  const data = event.data as Record<string, unknown>;
  if (data.type === "hello" && data.nonce === session.nonce) {
    session.origin = event.origin;
    injectStyle();
    scheduleReport(session);
    return;
  }
  if (event.origin !== session.origin) return;
  if (data.type === "document" && !session.editing) session.store.replace(normalizeCmsDocument(data.document));
  if (data.type === "outline") document.documentElement.toggleAttribute(editNames().outlineAll, data.all === true);
  if (data.type === "focus") focusField(String(data.address || ""));
}

function selectItem(session: EditSession, element: HTMLElement): void {
  const names = cmsAttrNames();
  const collection = element.closest(cmsSelectors().collection)?.getAttribute(names.collection) || "";
  post(session, { address: `${collection}/${element.getAttribute(names.item) || ""}`, kind: "item", limits: {}, type: "select" });
}

function handleClick(session: EditSession, event: MouseEvent): void {
  const target = event.target instanceof Element ? event.target : null;
  const selectors = cmsSelectors();
  const element = (target?.closest(selectors.field) ?? target?.closest(selectors.item)) as HTMLElement | null;
  if (!session.origin || !element || element === session.editing) return;
  event.preventDefault();
  event.stopPropagation();
  selectElement(element);
  const names = cmsAttrNames();
  const field = element.getAttribute(names.field);
  if (!field) return selectItem(session, element);
  const kind = element.getAttribute(names.kind) || "";
  post(session, { address: field, kind, limits: limitsOf(element), type: "select" });
  if (kind === "text") startInlineText(session, element);
}

function startCmsEditMode(store: CmsStore): () => void {
  const nonce = new URL(window.location.href).searchParams.get(CMS_EDIT_PARAM) || "";
  const origins = [...new Set([...store.editorOrigins, ...readCmsRuntime().editorOrigins])];
  if (!nonce || !origins.length) return () => undefined;
  const session: EditSession = { editing: null, nonce, origin: "", origins, store, timer: null };
  const onMessage = (event: MessageEvent) => handleParent(session, event);
  const onClick = (event: MouseEvent) => handleClick(session, event);
  const observer = new MutationObserver(() => scheduleReport(session));
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("message", onMessage);
  document.addEventListener("click", onClick, true);
  return () => {
    if (session.timer) clearTimeout(session.timer);
    session.origin = "";
    observer.disconnect();
    window.removeEventListener("message", onMessage);
    document.removeEventListener("click", onClick, true);
    document.documentElement.removeAttribute(editNames().outlineAll);
  };
}

export { editNames, startCmsEditMode };
