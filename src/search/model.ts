import { jsonScript as search_config_json, toText } from "#ndsvdqv80epr";

type search_value =
|string
|number
|boolean
|null
|undefined
|Array<string|number|boolean|null|undefined>;

type search_filters = Record<string, search_value>;

type search_item_config = {
  exclude?: boolean;
  filters?: search_filters;
  text?: search_value;
};

type search_panel_config = {
  familyKey?: string;
};

type search_filter_config = {
  attr?: string;
};

function searchText(value: unknown) {
  return toText(value)
  .normalize("NFD")
  .replace(/\p{Diacritic}/gu, "")
  .toLowerCase();
}

export type {
  search_filter_config,
  search_filters,
  search_item_config,
  search_panel_config,
  search_value,
};
export { searchText, search_config_json, toText };
