import type { ReactNode } from "react";
import { useId } from "react";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { normalizeLocale, sourceLanguageMessage } from "./../../../../language/messages.js";

type SiteHeaderSearchProps = {
  children?: ReactNode;
  lang?: string;
  softRedirect?: boolean;
};

const block = "site-header";

function SiteHeaderSearch(props: SiteHeaderSearchProps) {
  const locale = normalizeLocale(props.lang || "");
  const resultsId = `${useId().replace(/:/gu, "")}_site_search`;
  return (
    <div
    className={frontendElementClass(block, "search")}
    {...frontendDataAttrs({ "site-search": locale, "site-search-soft": props.softRedirect ? "true" : undefined })}
    >
    <input
    aria-controls={resultsId}
    aria-label={sourceLanguageMessage("siteSearchLabel", locale)}
    autoComplete="off"
    className={`${frontendClassName("input")} ${frontendElementClass(block, "search-input")}`}
    placeholder={sourceLanguageMessage("siteSearchPlaceholder", locale)}
    spellCheck={false}
    type="search"
    />
    <div id={resultsId} />
    <div>{props.children}</div>
    </div>
  );
}

export { SiteHeaderSearch };
export type { SiteHeaderSearchProps };
