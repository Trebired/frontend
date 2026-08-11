import {
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import type { BindActionTriggerOptions } from "#2qlqsnwrvrgx";
import {
  readHostJsonConfig,
  stringifyJsonForHtml,
  toString,
} from "#dqy2d22qyujv";
import {
  documentLanguageTag as documentLang,
  setTextContent,
} from "#er0dlx1gtbzh";
import { createTranslatorFactory, defineValue, objectRecord as toObject } from "#ndsvdqv80epr";

type BindActionOptions = BindActionTriggerOptions;

const EN_MESSAGES: Record<string, string> = {
  addMarker: "Add marker",
  all: "all",
  clickOpenDetails: "Click to open details",
  connectingLogs: "Connecting logs...",
  connectionErrorRetrying: "Connection error, retrying...",
  copyLogEntry: "Copy log entry",
  copyLogs: "Copy logs",
  copyMessage: "Copy message",
  copyMetadata: "Copy metadata",
  copyRawLog: "Copy raw log",
  copyStats: "Copy stats",
  "display.exitFullscreen": "Exit fullscreen",
  "display.fullscreen": "Fullscreen",
  disconnectedRetrying: "Disconnected, retrying...",
  exportLogs: "Export logs",
  fancyMode: "Fancy mode",
  followLiveLogs: "Follow live logs",
  group: "Group",
  groups: "Groups",
  groupsTotalLabel: "Groups total",
  hideMetadata: "Hide metadata",
  level: "Level",
  levels: "Levels",
  loadedSuffix: "loaded",
  loadedTab: "Loaded",
  loadingLogs: "Loading logs...",
  logEntry: "Log entry",
  logEntryDescription: "Review the exact log message, metadata, and raw payload for this entry.",
  marker: "Marker",
  message: "Message",
  metadata: "Metadata",
  noLogsAvailable: "No logs available.",
  noMatchingLogs: "No matching logs",
  nothingRecorded: "Nothing recorded",
  productFallback: "Product",
  productLogs: "{product} logs",
  raw: "Raw",
  rawMode: "Raw mode",
  removeMarker: "Remove marker",
  searchLogs: "Search logs...",
  searchLogsAction: "Search logs",
  showMetadata: "Show metadata",
  source: "Source",
  timestamp: "Timestamp",
  title: "Logs",
  totalLabel: "Total",
  totalTab: "Total",
  visibleLabel: "Visible",
  waitingForLogs: "Waiting for logs...",
};

const CS_MESSAGES: Record<string, string> = {
  addMarker: "Pridat znacku",
  all: "vse",
  clickOpenDetails: "Kliknutim otevrite podrobnosti",
  connectingLogs: "Pripojuji logy...",
  connectionErrorRetrying: "Chyba pripojeni, zkousim znovu...",
  copyLogEntry: "Kopirovat zaznam logu",
  copyLogs: "Kopirovat logy",
  copyMessage: "Kopirovat zpravu",
  copyMetadata: "Kopirovat metadata",
  copyRawLog: "Kopirovat raw log",
  copyStats: "Kopirovat statistiky",
  "display.exitFullscreen": "Ukoncit celou obrazovku",
  "display.fullscreen": "Cela obrazovka",
  disconnectedRetrying: "Odpojeno, zkousim znovu...",
  exportLogs: "Exportovat logy",
  fancyMode: "Prehledny rezim",
  followLiveLogs: "Sledovat zive logy",
  group: "Skupina",
  groups: "Skupiny",
  groupsTotalLabel: "Skupin celkem",
  hideMetadata: "Skryt metadata",
  level: "Uroven",
  levels: "Urovne",
  loadedSuffix: "nacteno",
  loadedTab: "Nactene",
  loadingLogs: "Nacitam logy...",
  logEntry: "Zaznam logu",
  logEntryDescription: "Zkontrolujte presnou zpravu logu, metadata a raw payload tohoto zaznamu.",
  marker: "Znacka",
  message: "Zprava",
  metadata: "Metadata",
  noLogsAvailable: "Nejsou dostupne zadne logy.",
  noMatchingLogs: "Zadne logy neodpovidaji hledani",
  nothingRecorded: "Nic zaznamenano",
  productFallback: "Produkt",
  productLogs: "Logy {product}",
  raw: "Raw",
  rawMode: "Raw rezim",
  removeMarker: "Odebrat znacku",
  searchLogs: "Hledat v logach...",
  searchLogsAction: "Hledat v logach",
  showMetadata: "Zobrazit metadata",
  source: "Zdroj",
  timestamp: "Cas",
  title: "Logy",
  totalLabel: "Celkem",
  totalTab: "Celkem",
  visibleLabel: "Viditelne",
  waitingForLogs: "Cekam na logy...",
};

const defineMessages = defineValue as <T extends Record<string, unknown>>(messages: T) => T;
const createLocalTranslator = createTranslatorFactory((key, lang) => {
    const table = messageTable(lang || documentLang());
    return table[key] || key;
});

function messageTable(lang?: string) {
  return String(lang || "").toLowerCase().startsWith("cs")
  ? CS_MESSAGES
  : EN_MESSAGES;
}

function toArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function formatTimestampLabel(value: unknown, fallback = "") {
  const raw = toString(value);
  if (!raw) return fallback;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  try {
    return date.toLocaleString(documentLang() || undefined, {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
        second: "2-digit",
        year: "numeric",
    }) || raw;
  } catch {
    return raw;
  }
}

const time = (
  input: unknown,
  style = "rel_short",
  opts: Record<string, unknown> = {},
) => style === "abs_datetime"
? formatTimestampLabel(input, toString(opts.fallback, "unknown"))
: formatTimestampLabel(input, toString(opts.fallback, "unknown"));

async function fetchJson(url: string, query: Record<string, unknown> = {}, init: RequestInit = {}) {
  const target = new URL(String(url || ""), window.location.origin);
  Object.entries(query || {}).forEach(([key, value]) => {
      if (value == null || value === "") return;
      target.searchParams.set(key, String(value));
  });
  const response = await fetch(target.toString(), {
      credentials: "same-origin",
      ...init,
      headers: { Accept: "application/json", ...(init.headers || {}) },
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const message = toString((json as any)?.message, "Request failed");
    throw new Error(message);
  }
  return json && typeof json === "object" && "data" in json ? (json as any).data : json;
}

function triggerAttrs(options: BindActionOptions = {}) {
  return {
    "data-tbf-action-trigger": options.action || undefined,
    "data-tbf-external-href": options.externalHref || undefined,
    "data-tbf-href": options.href || undefined,
  };
}

function logActionTrigger(children: ReactNode, options: BindActionOptions = {}) {
  const attrs = triggerAttrs(options);
  if (isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, attrs);
  }
  return createElement(
    "span",
    { className: "action-trigger-host", style: { display: "contents" }, ...attrs },
    children,
  );
}

export {
  createLocalTranslator,
  defineMessages,
  documentLang,
  fetchJson,
  logActionTrigger,
  readHostJsonConfig,
  setTextContent,
  stringifyJsonForHtml,
  time,
  toArray,
  toObject,
  toString,
};
export type { BindActionOptions };
