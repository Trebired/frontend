import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { frontendClassName, frontendElementClass } from "#5vbaqj4pirp3";
import { normalizeLocale, sourceLanguageMessage } from "./../../../../language/messages.js";
import { loadSiteSearch } from "./../../../../search/site/load.js";
import { searchSite, type SiteSearchHit } from "./../../../../search/site/query.js";
import { SiteLinkAnchor } from "./../link.js";

type SearchStatus = "failed" | "idle" | "loading" | "ready";

type SearchState = { hits: SiteSearchHit[]; status: SearchStatus };

type SiteHeaderSearchProps = {
  children?: ReactNode;
  lang?: string;
  onNavigate?: () => void;
  softRedirect?: boolean;
};

const block = "site-header";
const DEBOUNCE = 90;

function useSiteSearch(query: string, locale: string): SearchState {
  const [state, setState] = useState<SearchState>({ hits: [], status: "idle" });
  useEffect(() => {
      const value = query.trim();
      if (!value) {
        setState({ hits: [], status: "idle" });
        return undefined;
      }
      let live = true;
      const timer = window.setTimeout(() => {
          setState((current) => (current.status === "ready" ? current : { ...current, status: "loading" }));
          loadSiteSearch(locale).then(
            (pages) => live && setState({ hits: searchSite(pages, value), status: "ready" }),
            () => live && setState({ hits: [], status: "failed" }),
          );
        }, DEBOUNCE);
      return () => {
        live = false;
        window.clearTimeout(timer);
      };
    }, [locale, query]);
  return state;
}

function moveFocus(list: HTMLElement | null, input: HTMLInputElement | null, event: KeyboardEvent<HTMLElement>) {
  const links = [...(list?.querySelectorAll<HTMLElement>("a[href]") || [])];
  const index = links.indexOf(document.activeElement as HTMLElement);
  if (event.key === "ArrowDown") links[Math.min(links.length - 1, index + 1)]?.focus();
  else if (event.key === "ArrowUp" && index <= 0) input?.focus();
  else if (event.key === "ArrowUp") links[index - 1]?.focus();
  else return;
  event.preventDefault();
}

function HitLink(props: { hit: SiteSearchHit; onNavigate?: () => void; softRedirect?: boolean }) {
  const { hit } = props;
  const title = hit.section && hit.section.title !== hit.title ? `${hit.title} · ${hit.section.title}` : hit.title;
  const label = (
    <>
    <span className={frontendClassName("text-link")}>{title}</span>
    <span className={frontendElementClass(block, "sheet-description")}>
    {hit.snippet.map((part, index) => (part.mark ? <mark key={index}>{part.text}</mark> : part.text))}
    </span>
    </>
  );
  return (
    <SiteLinkAnchor
    className={frontendElementClass(block, "sheet-entry")}
    link={{ href: hit.href, label }}
    onNavigate={props.onNavigate}
    plain
    softRedirect={props.softRedirect}
    />
  );
}

function SearchResults(props: SiteHeaderSearchProps & { input: HTMLInputElement | null; locale: string; state: SearchState; query: string }) {
  const listRef = useRef<HTMLOListElement | null>(null);
  const { hits, status } = props.state;
  const say = (key: string) => sourceLanguageMessage(key, props.locale, { query: props.query.trim() });
  const note = status === "failed" ? say("siteSearchFailed") : status === "ready" && !hits.length ? say("siteSearchEmpty") : "";
  return (
    <div aria-live="polite" className={frontendElementClass(block, "search-results")}>
    {note ? <p className={frontendElementClass(block, "sheet-description")}>{note}</p> : null}
    {hits.length ? (
        <ol
        className={frontendElementClass(block, "search-list")}
        onKeyDown={(event) => moveFocus(listRef.current, props.input, event)}
        ref={listRef}
        >
        {hits.map((hit) => (
              <li key={hit.href}>
              <HitLink hit={hit} onNavigate={props.onNavigate} softRedirect={props.softRedirect} />
              </li>
        ))}
        </ol>
      ) : null}
    </div>
  );
}

function SiteHeaderSearch(props: SiteHeaderSearchProps) {
  const locale = normalizeLocale(props.lang || (typeof document === "undefined" ? "" : document.documentElement.lang));
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultsId = `${useId().replace(/:/gu, "")}_site_search`;
  const state = useSiteSearch(query, locale);
  const searching = Boolean(query.trim());
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const results = document.getElementById(resultsId);
    if (event.key === "Escape" && query) {
      event.stopPropagation();
      setQuery("");
    } else if (event.key === "Enter") results?.querySelector<HTMLElement>("a[href]")?.click();
    else if (event.key === "ArrowDown") moveFocus(results, inputRef.current, event);
  };
  const navigate = () => {
    setQuery("");
    props.onNavigate?.();
  };
  return (
    <div className={frontendElementClass(block, "search")}>
    <input
    aria-controls={resultsId}
    aria-label={sourceLanguageMessage("siteSearchLabel", locale)}
    autoComplete="off"
    className={`${frontendClassName("input")} ${frontendElementClass(block, "search-input")}`}
    onChange={(event) => setQuery(event.target.value)}
    onFocus={() => void loadSiteSearch(locale).catch(() => undefined)}
    onKeyDown={onKeyDown}
    placeholder={sourceLanguageMessage("siteSearchPlaceholder", locale)}
    ref={inputRef}
    spellCheck={false}
    type="search"
    value={query}
    />
    <div id={resultsId}>
    {searching ? <SearchResults {...props} input={inputRef.current} locale={locale} onNavigate={navigate} query={query} state={state} /> : null}
    </div>
    <div hidden={searching}>{props.children}</div>
    </div>
  );
}

export { SiteHeaderSearch };
export type { SiteHeaderSearchProps };
