import type { BindRoot } from "#er0dlx1gtbzh";
import { bindRoot, queryAll } from "#er0dlx1gtbzh";
import { activateLanguage } from "./language.js";
import {
  defineMonacoThemes,
  ensureMonaco,
  getPreferredMonacoColorizeThemeName,
  getPreferredMonacoThemeName,
} from "./monaco.js";
import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";

const CODE_BLOCK_TAG = "code-block";
const CODE_SELECTOR = `${CODE_BLOCK_TAG},${frontendDataSelector("code-block")}`;
const DATA_CODE_BLOCK_ATTR = frontendDataAttr("code-block");
const DATA_CODE_CONTENT_ATTR = frontendDataAttr("code-content");
const DATA_CODE_LANG_ATTR = frontendDataAttr("code-lang");
const DATA_CODE_RENDERED_ATTR = frontendDataAttr("code-rendered");

const codeState = new WeakMap<Element, {
  languageId: string;
  source: string;
  themeName: string;
}> ();

const codeHosts = new Set<Element>();
let themeRefreshBound = false;

function normalizeCodeText(value: unknown) {
  return String(value == null ? "" : value).replace(/\r\n?/g, "\n");
}

function codeRenderTarget(host: Element) {
  if (String(host.tagName || "").toLowerCase() === "code") return host;
  return host.querySelector("code") || host;
}

function readSource(host: Element, target: Element) {
  const prev = codeState.get(host);
  if (prev && host.getAttribute(DATA_CODE_RENDERED_ATTR) === "1") {
    return prev.source;
  }
  return normalizeCodeText(target.textContent);
}

function resolveLanguage(host: Element) {
  const requested = normalizeCodeText(
    host.getAttribute(DATA_CODE_LANG_ATTR) ||
      host.getAttribute("data-code-lang") ||
      "",
  ).trim().toLowerCase();
  return requested || "plaintext";
}

function markSnippet(host: Element, target: Element) {
  host.setAttribute(DATA_CODE_BLOCK_ATTR, "");
  target.setAttribute(DATA_CODE_CONTENT_ATTR, "");
}

async function renderCodeHost(host: Element, monacoRef: any, themeName: string) {
  const target = codeRenderTarget(host);
  if (!(target instanceof Element)) return false;
  markSnippet(host, target);
  const source = readSource(host, target);
  const languageId = resolveLanguage(host);
  const prev = codeState.get(host);
  if (isRendered(host, prev, source, languageId, themeName)) return true;
  await activateLanguage(monacoRef, languageId);
  target.textContent = source;
  await monacoRef.editor.colorizeElement(target, {
      mimeType: languageId,
      tabSize: 2,
      theme: themeName,
  });
  host.setAttribute(DATA_CODE_RENDERED_ATTR, "1");
  codeState.set(host, { languageId, source, themeName });
  return true;
}

function isRendered(
  host: Element,
  prev: { languageId: string; source: string; themeName: string } | undefined,
  source: string,
  languageId: string,
  themeName: string,
) {
  return Boolean(
    prev &&
      prev.source === source &&
      prev.languageId === languageId &&
      prev.themeName === themeName &&
      host.getAttribute(DATA_CODE_RENDERED_ATTR) === "1",
  );
}

async function renderCodeWithin(root: BindRoot = document) {
  const hosts = queryAll<Element>(root, CODE_SELECTOR);
  if (!hosts.length) return [];
  const monacoRef = await ensureMonaco();
  if (!monacoRef?.editor) return [];
  const themeName = getPreferredMonacoColorizeThemeName();
  defineMonacoThemes(monacoRef);
  monacoRef.editor.setTheme(themeName);
  const results = [];
  for (const host of hosts) {
    codeHosts.add(host);
    results.push(await renderCodeHost(host, monacoRef, themeName));
  }
  monacoRef.editor.setTheme(getPreferredMonacoThemeName());
  return results;
}

function bindCodeThemeRefresh() {
  if (themeRefreshBound) return;
  themeRefreshBound = true;
  window.addEventListener(frontendEventName("themechange"), () => {
      window.requestAnimationFrame(() => {
          void renderConnectedCodeHosts();
      });
  });
}

function renderConnectedCodeHosts() {
  for (const host of Array.from(codeHosts)) {
    if (!host.isConnected) codeHosts.delete(host);
  }
  return renderCodeWithin(document);
}

function bindCodeBlocks(root: BindRoot = document) {
  bindRoot(root);
  bindCodeThemeRefresh();
  void renderCodeWithin(root).catch (() => {});
}

export { bindCodeBlocks, renderCodeHost, renderCodeWithin };
