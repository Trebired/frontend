import { createElement, Fragment, type ReactNode } from "react";
import {
  search_config_script,
  search_filter,
  search_item,
  search_query_input,
} from "./item.js";
import {
  InlineRow,
  Text,
  primitiveCardClassName,
  primitiveInlineRowClassName,
} from "#hzrmwbvgt2ax";
import { toText } from "./model.js";

type search_filter_node = ReactNode | null | undefined | false;

type search_props = {
  description?: ReactNode;
  familyKey: string;
  filters?: search_filter_node[];
  inputId?: string;
  inputAttrs?: Record<string, unknown>;
  placeholder: string;
};

type search_panel_props = {
  children?: ReactNode;
  className?: string;
  emptyText?: ReactNode;
  familyKey: string;
  id?: string;
};

function controlsRow(props: search_props) {
  const filters = Array.isArray(props.filters)
  ? props.filters.filter(Boolean)
  : [];
  const inputId = toText(props.inputId);
  return (
    <>
    {search_query_input({
          children: (
            <input
            {...(inputId ? { id: inputId } : {})}
            className="input classic width-lg"
            type="search"
            placeholder={toText(props.placeholder)}
            autoComplete="off"
            {...((props.inputAttrs || {}) as any)}
            />
          ),
    })}
    {filters.map((filter, index) => (
          <Fragment key={`search_filter_${index}`}>{filter}</Fragment>
    ))}
    </>
  );
}

function searchControls(props: search_props) {
  const familyKey = toText(props.familyKey);
  const description = props.description;
  const attrs = {
    style: { display: "contents" },
  };
  const config = search_config_script({
      kind: "controls",
      config: { familyKey },
  });

  if (description) {
    return createElement(
      "search-controls",
      attrs,
      config,
      <div className={primitiveCardClassName({ gap: "xs" })}>
      <InlineRow className="content-filter-bar" gap="xs">
      {controlsRow(props)}
      </InlineRow>
      <Text as="p" muted size="sm">{description}</Text>
      </div>,
    );
  }

  return createElement(
    "search-controls",
    attrs,
    config,
    <div className={primitiveCardClassName({
          className: primitiveInlineRowClassName({ className: "content-filter-bar", gap: "xs" }),
          layout: "none",
    })}>
    {controlsRow(props)}
    </div>,
  );
}

function search_panel(props: search_panel_props) {
  const familyKey = toText(props.familyKey);
  const id = toText(props.id);
  return createElement(
    "search-panel",
    { style: { display: "contents" } },
    search_config_script({
        kind: "panel",
        config: { familyKey },
    }),
    <div
    {...(id ? { id } : {})}
    className={toText(props.className) || undefined}
    >
    {props.children}
    {props.emptyText
      ? createElement(
        "search-empty",
        { hidden: true, style: { display: "contents" } },
        <Text as="p" muted>{props.emptyText}</Text>,
      )
      : null}
    </div>,
  );
}

export { search_panel };
export { search_config_script, search_filter, search_item, search_query_input };
export {
  bind,
  bindRoot,
  bindSearchControls,
  bindSearchPanel,
  boot,
  refreshSearchResults,
  searchManager,
} from "./client.js";
export type { search_filter_node, search_panel_props, search_props };
export type { SearchPanelBinding } from "./client.js";
export type {
  SearchFilterProps,
  SearchItemProps,
  SearchQueryInputProps,
} from "./item.js";
export default searchControls;
