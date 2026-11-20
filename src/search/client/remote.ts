import { connectChannel, QUERY_CHANGED_EVENT } from "@trebired/sockets/client";
import { frontendClassName, frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";
import { createInfiniteObserver } from "#hgcb4f0scz84";
import { registerPageCleanup } from "#o9lroe7t0ma6";
import type { search_remote_config } from "#yrscdg72qcm6";
import { toText } from "#yrscdg72qcm6";
import { filterDetails, getCombinedQuery, getFilterInputs, panelCache } from "./cache.js";
import type { SearchPanelBinding } from "./state.js";

type RemoteReply = {
  cursor?: string;
  hasMore?: boolean;
  items?: unknown[];
  keys?: unknown[];
  nextOffset?: number;
  total?: number;
};

type RemotePanel = {
  config: search_remote_config;
  cursor: string;
  generation: number;
  hasMore: boolean;
  loaded: number;
  loading: number;
  nextOffset: number;
  panel: SearchPanelBinding;
  timer: number;
};

const SEARCH_DEBOUNCE_MS = 200;
const ROW_KEY = "search-key";
const remotePanels = new WeakMap<HTMLElement, RemotePanel>();
const rowHtml = new WeakMap<Element, string>();

function part(remote: RemotePanel, name: string) {
  const node = remote.panel.root.querySelector(frontendDataSelector(name));
  return node instanceof HTMLElement ? node : null;
}

function queryFilters(remote: RemotePanel) {
  const filters: Record<string, string> = {};
  filterDetails(getFilterInputs(remote.panel)).forEach((filter) => {
      if (filter.key) filters[filter.key] = toText(filter.value, "all");
  });
  return filters;
}

function syncRemoteChrome(remote: RemotePanel, total: number | null) {
  const loading = part(remote, "search-loading");
  const sentinel = part(remote, "search-sentinel");
  if (loading) loading.hidden = remote.loading === 0;
  if (sentinel) sentinel.hidden = !remote.hasMore;
  if (total === null) return;
  panelCache(remote.panel).emptyNodes.forEach((node) => {
      node.hidden = total > 0;
  });
}

function rebindResults(results: HTMLElement) {
  results.dispatchEvent(
    new CustomEvent(frontendEventName("rebind"), { bubbles: true, detail: { root: results } }),
  );
}

function keyedRow(html: string, key: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const node = template.content.firstElementChild;
  if (!node || template.content.childElementCount !== 1) return null;
  node.setAttribute(frontendDataAttr(ROW_KEY), key);
  rowHtml.set(node, html);
  return node;
}

function keyedRows(rows: string[], keys: string[]) {
  if (keys.length !== rows.length) return null;
  const nodes: Element[] = [];
  for (let index = 0; index < rows.length; index += 1) {
    const node = keyedRow(rows[index], keys[index]);
    if (!node) return null;
    nodes.push(node);
  }
  return nodes;
}

function patchRows(results: HTMLElement, rows: string[], keys: string[], fresh: Element[]) {
  const current = new Map<string, Element>();
  Array.from(results.children).forEach((node) => {
      const key = node.getAttribute(frontendDataAttr(ROW_KEY));
      if (key !== null) current.set(key, node);
  });
  let changed = false;
  const wanted = fresh.map((node, index) => {
      const kept = current.get(keys[index]);
      if (kept && rowHtml.get(kept) === rows[index]) return kept;
      changed = true;
      return node;
  });
  const keep = new Set(wanted);
  Array.from(results.children).forEach((node) => {
      if (keep.has(node)) return;
      node.remove();
  });
  wanted.forEach((node, index) => {
      const at = results.children[index];
      if (at !== node) results.insertBefore(node, at || null);
  });
  return changed;
}

function placeRows(remote: RemotePanel, rows: string[], keys: string[], replace: boolean) {
  const results = part(remote, "search-results");
  if (!results) return;
  const fresh = keyedRows(rows, keys);
  if (fresh && replace) {
    if (patchRows(results, rows, keys, fresh)) rebindResults(results);
    return;
  }
  if (fresh) results.append(...fresh);
  else if (replace) results.innerHTML = rows.join("");
  else results.insertAdjacentHTML("beforeend", rows.join(""));
  rebindResults(results);
}

function applyReply(remote: RemotePanel, reply: RemoteReply, replace: boolean) {
  const rows = (Array.isArray(reply.items) ? reply.items : []).map((row) => toText(row));
  const keys = (Array.isArray(reply.keys) ? reply.keys : []).map((key) => toText(key));
  placeRows(remote, rows, keys, replace);
  remote.cursor = toText(reply.cursor);
  remote.hasMore = reply.hasMore === true;
  remote.nextOffset = Number(reply.nextOffset) || 0;
  remote.loaded = replace ? rows.length : remote.loaded + rows.length;
  const total = Number(reply.total) || 0;
  syncRemoteChrome(remote, total);
  remote.panel.root.dispatchEvent(
    new CustomEvent("search:updated", {
        bubbles: true,
        detail: { query: getCombinedQuery(remote.panel), total, visible: remote.loaded },
    }),
  );
}

async function requestPage(remote: RemotePanel, replace: boolean, quiet = false) {
  const generation = replace ? remote.generation + 1 : remote.generation;
  if (replace) remote.generation = generation;
  const counted = !quiet;
  if (counted) remote.loading += 1;
  syncRemoteChrome(remote, null);
  const limit = replace ? Math.max(Number(remote.config.pageSize) || 0, remote.loaded) || undefined : remote.config.pageSize;
  try {
    const reply = await connectChannel(remote.config.channel).request<RemoteReply>(remote.config.room, "query", {
        cursor: replace ? "" : remote.cursor,
        filters: queryFilters(remote),
        lang: document.documentElement.lang || "",
        limit,
        offset: replace ? 0 : remote.nextOffset,
        search: getCombinedQuery(remote.panel),
    });
    if (generation !== remote.generation || !remote.panel.host.isConnected) return;
    if (reply.ok && reply.data) applyReply(remote, reply.data, replace);
    else if (replace) remote.hasMore = false;
  } finally {
    if (counted) remote.loading = Math.max(0, remote.loading - 1);
    syncRemoteChrome(remote, null);
  }
}

function scheduleRemoteQuery(remote: RemotePanel, delayMs: number) {
  if (remote.timer) window.clearTimeout(remote.timer);
  remote.timer = window.setTimeout(() => {
      remote.timer = 0;
      void requestPage(remote, true);
    }, delayMs);
}

function refreshRemotePanel(remote: RemotePanel) {
  if (remote.timer) return;
  void requestPage(remote, true, true);
}

function loadNextPage(remote: RemotePanel) {
  if (!remote.hasMore || remote.loading > 0) return undefined;
  return requestPage(remote, false);
}

function scrollRootFor(remote: RemotePanel) {
  const scroller = remote.panel.root.closest(`.${frontendClassName("scroll")}`);
  return scroller instanceof Element ? scroller : null;
}

function connectRemotePanel(remote: RemotePanel) {
  const client = connectChannel(remote.config.channel);
  const unsubscribe = client.subscribe(remote.config.room, (change) => {
      if (change.event === QUERY_CHANGED_EVENT) refreshRemotePanel(remote);
  });
  const sentinel = part(remote, "search-sentinel");
  const observer = createInfiniteObserver(scrollRootFor(remote), sentinel, () => loadNextPage(remote), {
      recheckAfterLoad: true,
      recheckOnInit: true,
  });
  registerPageCleanup(remote.panel.host, () => {
      if (remote.timer) window.clearTimeout(remote.timer);
      observer?.disconnect();
      unsubscribe();
  });
}

function bindRemotePanel(panel: SearchPanelBinding, config: search_remote_config) {
  const existing = remotePanels.get(panel.host);
  if (existing) return existing;
  const remote: RemotePanel = {
    config,
    cursor: "",
    generation: 0,
    hasMore: config.hasMore === true,
    loaded: panelCache(panel).items.length,
    loading: 0,
    nextOffset: Number(config.nextOffset) || 0,
    panel,
    timer: 0,
  };
  remotePanels.set(panel.host, remote);
  connectRemotePanel(remote);
  return remote;
}

function remotePanelFor(panel: SearchPanelBinding) {
  return remotePanels.get(panel.host) || null;
}

function onRemoteInput(panel: SearchPanelBinding, eventName: string) {
  const remote = remotePanelFor(panel);
  if (!remote) return false;
  scheduleRemoteQuery(remote, eventName === "input" ? SEARCH_DEBOUNCE_MS : 0);
  return true;
}

export { bindRemotePanel, onRemoteInput, remotePanelFor };
