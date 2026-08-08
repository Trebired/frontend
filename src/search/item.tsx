import { createElement, type ReactNode } from "react";
import type {
  search_filter_config,
  search_item_config,
  search_panel_config,
} from "./model.js";
import { search_config_json, toText } from "./model.js";

type SearchConfigScriptProps = {
  kind: "controls" | "filter" | "item" | "panel";
  config: search_filter_config | search_item_config | search_panel_config;
};

type SearchItemProps = {
  children?: ReactNode;
  config?: search_item_config;
};

type SearchFilterProps = {
  attr: string;
  children?: ReactNode;
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
    dangerouslySetInnerHTML={{ __html: search_config_json(props.config) }}
    />
  );
}

function search_item(props: SearchItemProps) {
  return createElement(
    "search-item",
    { style: { display: "contents" } },
    search_config_script({
        kind: "item",
        config: props.config || {},
    }),
    props.children,
  );
}

function search_filter(props: SearchFilterProps) {
  return createElement(
    "search-filter",
    { style: { display: "contents" } },
    search_config_script({
        kind: "filter",
        config: { attr: toText(props.attr) },
    }),
    props.children,
  );
}

function search_query_input(props: SearchQueryInputProps) {
  return createElement(
    "search-query-input",
    { style: { display: "contents" } },
    props.children,
  );
}

export { search_config_script, search_filter, search_item, search_query_input };
export type { SearchFilterProps, SearchItemProps, SearchQueryInputProps };
