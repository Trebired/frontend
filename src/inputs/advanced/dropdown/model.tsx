import { createLocalTranslator } from "#dqy2d22qyujv";
import { toString } from "#dqy2d22qyujv";
import type { ReactNode } from "react";
import { icon } from "#dqy2d22qyujv";

type attr_map = Record<string, string | number | boolean | null | undefined>;
type dropdown_option = {
  attrs?: attr_map;
  html?: ReactNode;
  label: string;
  search?: string;
  section?: string;
  unselect?: boolean;
  value: string;
};
type dropdown_props = {
  className?: string;
  disabled?: boolean;
  emptyOptionLabel?: string;
  emptyText?: string;
  hideChecks?: boolean;
  id?: string;
  inputId?: string;
  inputProps?: attr_map;
  label?: string;
  lang?: string;
  listId?: string;
  multiple?: boolean;
  name?: string;
  options?: dropdown_option[];
  optionsTop?: ReactNode;
  placeholder?: string;
  rootProps?: attr_map;
  search?: boolean;
  searchPlaceholder?: string;
  selectedHtml?: ReactNode;
  unselect?: boolean;
  value?: string | string[];
  wrapperClassName?: string;
};

function mapAttrs(attrs?: attr_map) {
  const out: Record<string, string | number | boolean> = {};
  const source = attrs && typeof attrs === "object" ? attrs : {};
  for (const [key, value] of Object.entries(source)) {
    if (value == null || value === false) continue;
    out[key] = value;
  }
  return out;
}

function selectedValues(props: dropdown_props, isMultiple: boolean) {
  return isMultiple
  ? Array.isArray(props.value)
  ? props.value.filter(Boolean).map(String)
  : []
  : [
    typeof props.value === "string" || typeof props.value === "number"
    ? String(props.value).trim()
    : "",
  ].filter(Boolean);
}

function initialLabel(
  props: dropdown_props,
  optionsList: dropdown_option[],
  selectedSet: Set<string>,
  isMultiple: boolean,
) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const placeholderText = toString(props.placeholder, localT("actions.select"));
  const selectedLabels = optionsList
  .filter((option) => selectedSet.has(toString(option && option.value)))
  .map((option) =>
    toString(option && option.label, toString(option && option.value)),
  );
  if (!isMultiple) return selectedLabels[0] || placeholderText;
  if (!selectedLabels.length) return placeholderText;
  return (
    selectedLabels.slice(0, 3).join(", ") +
      (selectedLabels.length > 3 ? ` +${String(selectedLabels.length - 3)}` : "")
  );
}

function optionsList(props: dropdown_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const list = Array.isArray(props.options) ? props.options : [];
  if (props.multiple === true || props.unselect !== true) return list;
  const unselectOption: dropdown_option = {
    html: (
      <span className="text-muted inline-row gap-xs">
      {icon({ spec: "remixicon close-large-line" })}
      <span>{localT("actions.unselect")}</span>
      </span>
    ),
    label: localT("actions.unselect"),
    search: localT("actions.unselect"),
    unselect: true,
    value: "",
  };
  return [unselectOption, ...list];
}

function stableIdPart(value: string) {
  return toString(value)
  .toLowerCase()
  .replace(/[^a-z0-9_-]+/g, "_")
  .replace(/^_+|_+$/g, "")
  .slice(0, 48);
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function fallbackDropdownId(props: dropdown_props) {
  const options = (Array.isArray(props.options) ? props.options : [])
  .map(
    (option) =>
    `${toString(option && option.value)}:${toString(option && option.label)}`,
  )
  .join("|");
  const base =
  stableIdPart(
    [props.name, props.label, props.placeholder, props.className]
    .map((entry) => toString(entry))
    .filter(Boolean)
    .join("_"),
  ) || "dropdown";
  const signature = [
    props.name,
    props.label,
    props.placeholder,
    props.multiple === true ? "multiple" : "single",
    options,
  ]
  .map((entry) => toString(entry))
  .join("|");
  return `dd_${base}_${stableHash(signature)}`;
}

function dropdownSelectionState(
  props: dropdown_props,
  options: dropdown_option[],
  isMultiple: boolean,
) {
  const values = selectedValues(props, isMultiple);
  const selectedSet = new Set(values);
  const selectedOption = !isMultiple
  ? options.find((option) =>
    selectedSet.has(toString(option && option.value)),
  ) || null
  : null;
  return { selectedOption, selectedSet, values };
}

function dropdownInitialHtml(props: dropdown_props, selection, isMultiple) {
  return (
    props.selectedHtml ??
    (!isMultiple && selection.selectedOption && selection.selectedOption.html
      ? selection.selectedOption.html
      : null)
  );
}

function dropdownModel(props: dropdown_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const fieldName = toString(props.name, "value");
  const ddId = toString(props.id) || fallbackDropdownId(props);
  const normalizedOptionsList = optionsList(props);
  const isMultiple = props.multiple === true;
  const selection = dropdownSelectionState(
    props,
    normalizedOptionsList,
    isMultiple,
  );
  return {
    ddId,
    emptyMessage: toString(props.emptyText, localT("empty.noMatchesFound")),
    emptyOptionText: toString(
      props.emptyOptionLabel,
      localT("empty.nothingHere"),
    ),
    fieldName,
    hiddenId: toString(props.inputId),
    initialHtml: dropdownInitialHtml(props, selection, isMultiple),
    initialLabel: initialLabel(
      props,
      normalizedOptionsList,
      selection.selectedSet,
      isMultiple,
    ),
    isDisabled: props.disabled === true,
    isMultiple,
    isSearchable: props.search === true,
    labelText: toString(props.label),
    listElementId: toString(props.listId),
    optionsId: `${ddId}_options`,
    optionsList: normalizedOptionsList,
    placeholderText: toString(props.placeholder, localT("actions.select")),
    rootClass: toString(props.className),
    searchPlaceholderText: toString(
      props.searchPlaceholder,
      `${localT("actions.search")}...`,
    ),
    selectedSet: selection.selectedSet,
    selectedValues: selection.values,
    shouldHideChecks: props.hideChecks === true,
    topNode: props.optionsTop ?? null,
    unselectAllText: localT("actions.unselectAll"),
    wrapperClass: toString(props.wrapperClassName, "column gap-xs"),
  };
}

export type { attr_map, dropdown_option, dropdown_props };
export { dropdownModel, mapAttrs };
