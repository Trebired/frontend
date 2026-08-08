import { createElement, type ReactNode } from "react";

import { stringifyJsonForHtml, toString } from "./_shared.js";

type SearchConfigScriptProps = {
  config: Record<string, unknown>;
  kind: "controls" | "filter" | "item" | "panel";
};
type SearchQueryInputProps = {
  children?: ReactNode;
};

function search_config_script(props: SearchConfigScriptProps) {
  const attrName = `data-search-${props.kind}-config`;
  return (
    <script
      hidden
      type="application/json"
      {...{ [attrName]: "" }}
      dangerouslySetInnerHTML={{ __html: stringifyJsonForHtml(props.config) }}
    />
  );
}

function search_query_input(props: SearchQueryInputProps) {
  return createElement(
    "search-query-input",
    { style: { display: "contents" } },
    props.children,
  );
}

function itemSearchText(item: HTMLElement) {
  const script = item.querySelector(
    'script[type="application/json"][data-search-item-config]',
  );
  try {
    const config = JSON.parse(script?.textContent || "{}");
    return toString(config.text, item.innerText).toLowerCase();
  } catch {
    return toString(item.innerText).toLowerCase();
  }
}

function bindRoot(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement)) return null;
  const input = root.querySelector<HTMLInputElement>("input[type='search'],input[data-search-query]");
  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-search-item]"));
  if (!input || !items.length) return null;
  const render = () => {
    const query = toString(input.value).toLowerCase();
    let visible = 0;
    items.forEach((item) => {
      const matched = !query || itemSearchText(item).includes(query);
      item.hidden = !matched;
      if (matched) visible += 1;
    });
    root.querySelectorAll<HTMLElement>("[data-search-empty-slot]").forEach((slot) => {
      slot.hidden = visible > 0;
    });
  };
  input.addEventListener("input", render);
  render();
  return { input, root };
}

function bind(target: Document | Element = document) {
  const roots: HTMLElement[] = [];
  if (target instanceof HTMLElement && target.matches("[data-search-panel-root]")) {
    roots.push(target);
  }
  target.querySelectorAll?.<HTMLElement>("[data-search-panel-root]").forEach((root) => roots.push(root));
  return roots.map(bindRoot).filter(Boolean);
}

const searchManager = Object.freeze({
  bind,
  bindRoot,
  bindPanel: bindRoot,
  boot() {
    bind(document);
    return searchManager;
  },
  refreshSearchResults: bind,
});

export {
  bind,
  bindRoot,
  search_config_script,
  search_query_input,
  searchManager,
};
export default searchManager;
