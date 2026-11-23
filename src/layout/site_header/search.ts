import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendClassName, frontendDataAttr, frontendDataSelector, frontendElementClass } from "#5vbaqj4pirp3";
import { documentLanguage, normalizeLocale, sourceLanguageMessage } from "./../../language/messages.js";
import { loadSiteSearch } from "./../../search/site/load.js";
import { searchSite, type SiteSearchHit } from "./../../search/site/query.js";

const block = "site-header";
const DEBOUNCE = 90;
const SEARCH_SELECTOR = frontendDataSelector("site-search");
const bound = new WeakSet<Element>();

type SearchParts = { fallback: HTMLElement; host: HTMLElement; input: HTMLInputElement; locale: string; soft: boolean };

function node(tag: string, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function hitLink(hit: SiteSearchHit, soft: boolean) {
  const link = node("a", frontendElementClass(block, "sheet-entry")) as HTMLAnchorElement;
  link.href = hit.href;
  if (soft) link.setAttribute(frontendDataAttr("soft-redirect"), "");
  const title = hit.section && hit.section.title !== hit.title ? `${hit.title} · ${hit.section.title}` : hit.title;
  const description = node("span", frontendElementClass(block, "sheet-description"));
  hit.snippet.forEach((part) => description.append(part.mark ? node("mark", "", part.text) : document.createTextNode(part.text)));
  link.append(node("span", frontendClassName("text-link"), title), description);
  return link;
}

function moveFocus(list: Element | null, input: HTMLInputElement, event: KeyboardEvent) {
  const links = [...(list?.querySelectorAll<HTMLElement>("a[href]") || [])];
  const index = links.indexOf(document.activeElement as HTMLElement);
  if (event.key === "ArrowDown") links[Math.min(links.length - 1, index + 1)]?.focus();
  else if (event.key === "ArrowUp" && index <= 0) input.focus();
  else if (event.key === "ArrowUp") links[index - 1]?.focus();
  else return;
  event.preventDefault();
}

function renderResults(parts: SearchParts, query: string, hits: SiteSearchHit[] | null) {
  const results = node("div", frontendElementClass(block, "search-results"));
  results.setAttribute("aria-live", "polite");
  const say = (key: string) => sourceLanguageMessage(key, parts.locale, { query: query.trim() });
  const note = hits === null ? say("siteSearchFailed") : hits.length ? "" : say("siteSearchEmpty");
  if (note) results.append(node("p", frontendElementClass(block, "sheet-description"), note));
  if (hits?.length) {
    const list = node("ol", frontendElementClass(block, "search-list"));
    hits.forEach((hit) => {
        const item = node("li");
        item.append(hitLink(hit, parts.soft));
        list.append(item);
    });
    list.addEventListener("keydown", (event) => moveFocus(list, parts.input, event));
    results.append(list);
  }
  parts.host.replaceChildren(results);
}

function bindSearch(container: HTMLElement) {
  const input = container.querySelector<HTMLInputElement>("input");
  const host = input ? container.querySelector<HTMLElement>(`[id="${input.getAttribute("aria-controls") || ""}"]`) : null;
  const fallback = host?.nextElementSibling;
  if (!input || !host || !(fallback instanceof HTMLElement)) return;
  const locale = normalizeLocale(container.getAttribute(frontendDataAttr("site-search")) || documentLanguage());
  const parts: SearchParts = { fallback, host, input, locale, soft: container.getAttribute(frontendDataAttr("site-search-soft")) === "true" };
  let timer = 0;
  let run = 0;
  const clear = () => {
    window.clearTimeout(timer);
    run += 1;
    input.value = "";
    host.replaceChildren();
    fallback.hidden = false;
  };
  input.addEventListener("input", () => {
      const query = input.value;
      window.clearTimeout(timer);
      if (!query.trim()) return clear();
      fallback.hidden = true;
      const id = ++run;
      timer = window.setTimeout(() => {
          loadSiteSearch(locale).then(
            (pages) => id === run && renderResults(parts, query, searchSite(pages, query.trim())),
            () => id === run && renderResults(parts, query, null),
          );
        }, DEBOUNCE);
  });
  input.addEventListener("focus", () => void loadSiteSearch(locale).catch (() => undefined));
  input.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && input.value) {
        event.stopPropagation();
        clear();
      } else if (event.key === "Enter") host.querySelector<HTMLElement>("a[href]")?.click();
      else if (event.key === "ArrowDown") moveFocus(host, input, event);
  });
  host.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a[href]")) clear();
  });
}

function bindSiteHeaderSearches(root: BindRoot = document) {
  queryAll<HTMLElement>(root, SEARCH_SELECTOR).forEach((container) => {
      if (bound.has(container)) return;
      bound.add(container);
      bindSearch(container);
  });
}

export { bindSiteHeaderSearches };
