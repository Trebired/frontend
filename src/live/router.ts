import type { BindRoot } from "#er0dlx1gtbzh";
import { rehydrate, type LiveOptions } from "./regions.js";
import {
  captureFormState,
  captureWizardSteps,
  importChildNodes,
  restoreFormState,
  restoreWizardSteps,
} from "./state.js";

type LiveNavigationOptions = LiveOptions& {
  history?: "none" | "push" | "replace";
  preserveState?: boolean;
  push?: boolean;
  updateUrl?: boolean;
  url?: string;
};

const DEFAULT_CONTENT_SELECTOR = "[data-tbf-live-content],#live_content";
const DEFAULT_FULL_RELOAD_SELECTOR = "[data-tbf-full-reload]";
const loadedScriptSrcs = new Set<string>();
let navigationInflight = false;

function seedLoadedScripts() {
  document
  .querySelectorAll<HTMLScriptElement>("script[src]")
  .forEach((script) => {
      loadedScriptSrcs.add(script.src);
  });
}

function injectNewScripts(doc: Document) {
  doc.querySelectorAll<HTMLScriptElement>("script[src]").forEach((script) => {
      const src = script.src;
      if (!src || loadedScriptSrcs.has(src)) return;
      loadedScriptSrcs.add(src);
      const fresh = document.createElement("script");
      fresh.type = script.type ||"module";
      fresh.src = src;
      document.body.appendChild(fresh);
  });
}

function contentRoot(root: Document, selector = DEFAULT_CONTENT_SELECTOR) {
  const element = root.querySelector(selector);
  return element instanceof HTMLElement ? element : null;
}

function swapChrome(doc: Document, options: LiveNavigationOptions) {
  (options.chromeIds || []).forEach((id) => {
      const current = document.getElementById(id);
      const next = doc.getElementById(id);
      if (!current && !next) return;
      if (current && next) {
        current.replaceWith(document.importNode(next, true));
      } else if (current) {
        current.remove();
      } else if (next) {
        document.body.insertBefore(
          document.importNode(next, true),
          document.body.firstChild,
        );
      }
  });
}

function updateDocumentMeta(doc: Document) {
  const title = doc.querySelector("title");
  if (title?.textContent) document.title = title.textContent;
  const nextLang = doc.documentElement.lang;
  if (nextLang && nextLang !== document.documentElement.lang) {
    document.documentElement.lang = nextLang;
  }
}

function replaceLiveContent(
  doc: Document,
  url: string,
  options: LiveNavigationOptions,
) {
  const currentRoot = contentRoot(document, options.contentSelector);
  const nextRoot = contentRoot(doc, options.contentSelector);
  if (!currentRoot || !nextRoot) return false;
  const formState = options.preserveState
  ? captureFormState(currentRoot)
  : null;
  const wizardState = options.preserveState
  ? captureWizardSteps(currentRoot)
  : null;
  options.closeOverlays?.();
  currentRoot.replaceChildren(...importChildNodes(nextRoot));
  swapChrome(doc, options);
  if (wizardState) restoreWizardSteps(currentRoot, wizardState);
  if (formState) restoreFormState(currentRoot, formState);
  updateDocumentMeta(doc);
  injectNewScripts(doc);
  if (!options.preserveState) window.scrollTo(0, 0);
  rehydrate(document, options);
  document.dispatchEvent(
    new CustomEvent("tbf:live-content-updated", {
        detail: { root: currentRoot, url },
    }),
  );
  return true;
}

function applyHistoryMode(
  mode: "none" | "push" | "replace",
  resolvedUrl: string,
) {
  if (mode === "none") return;
  const parsed = new URL(resolvedUrl, window.location.href);
  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  if (mode === "replace") history.replaceState({ tbfRouter: true }, "", path);
  else history.pushState({ tbfRouter: true }, "", path);
}

function fallbackNavigate(url: string, updateUrl = true) {
  if (updateUrl && url) {
    window.location.assign(url);
    return false;
  }
  window.location.reload();
  return false;
}

async function softVisit(url: string, options: LiveNavigationOptions = {}) {
  if (navigationInflight) return false;
  navigationInflight = true;
  const targetUrl = String(url || window.location.href).trim();
  const historyMode =
  options.history || (options.push === false ? "none" : "push");
  try {
    const response = await fetch(targetUrl, {
        credentials: "same-origin",
        headers: { Accept: "text/html", "X-Requested-With": "tbf-router" },
    });
    if (!response.ok) return fallbackNavigate(targetUrl, historyMode !== "none");
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const resolvedUrl = response.url || targetUrl;
    if (!replaceLiveContent(doc, resolvedUrl, options)) {
      return fallbackNavigate(targetUrl, historyMode !== "none");
    }
    applyHistoryMode(historyMode, resolvedUrl);
    document.dispatchEvent(
      new CustomEvent("tbf:live-navigation", {
          detail: { historyMode, url: resolvedUrl },
      }),
    );
    return true;
  } catch {
    return fallbackNavigate(targetUrl, historyMode !== "none");
  } finally {
    navigationInflight = false;
  }
}

function softReload(options: LiveNavigationOptions = {}) {
  return softVisit(window.location.href, {
      ...options,
      history: options.history || "none",
  });
}

function isFullReloadOptOut(
  element: Element | null,
  selector = DEFAULT_FULL_RELOAD_SELECTOR,
) {
  return Boolean(element?.closest(selector));
}

function createLiveNavigationAdapter(options: LiveNavigationOptions = {}) {
  seedLoadedScripts();
  return {
    navigate(url: string) {
      return softVisit(url, options);
    },
    shouldFullReload(trigger: HTMLElement) {
      return isFullReloadOptOut(trigger, options.fullReloadSelector);
    },
  };
}

function bindLiveRouter(options: LiveNavigationOptions = {}) {
  seedLoadedScripts();
  window.addEventListener("popstate", () => {
      void softVisit(window.location.href, { ...options, history: "none" });
  });
}

export {
  DEFAULT_CONTENT_SELECTOR,
  DEFAULT_FULL_RELOAD_SELECTOR,
  bindLiveRouter,
  contentRoot,
  createLiveNavigationAdapter,
  injectNewScripts,
  isFullReloadOptOut,
  replaceLiveContent,
  seedLoadedScripts,
  softReload,
  softVisit,
};
export type { BindRoot, LiveNavigationOptions };
