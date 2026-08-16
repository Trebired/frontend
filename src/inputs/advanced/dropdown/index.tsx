import { Fragment } from "react";
import { button, icon, stringifyJsonForHtml, toString } from "#dqy2d22qyujv";
import input from "#8y47rueq20kg";
import {
  InlineRow,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
import type { dropdown_option, dropdown_props } from "./model.js";
import { dropdownModel, mapAttrs } from "./model.js";
import { search_config_script, search_query_input } from "#f1earyowcgbb";
import type { DropdownOptionConfig, DropdownRootConfig } from "./registry.js";
import "./index.client.js";

function dropdownConfigScript(
  attrName: "data-dropdown-option-config" | "data-dropdown-root-config",
  config: DropdownOptionConfig | DropdownRootConfig,
) {
  return (
    <script
    hidden
    type="application/json"
    {...{ [attrName]: "" }}
    dangerouslySetInnerHTML={{ __html: stringifyJsonForHtml(config) }}
    />
  );
}

function dropdownRootConfigPayload(model: ReturnType<typeof dropdownModel>) {
  return {
    defaultPlaceholder: model.placeholderText,
    emptyLabel: model.placeholderText,
    emptyOptionLabel: model.emptyOptionText,
    hasLabel: true,
    hideChecks: model.shouldHideChecks,
    multiple: model.isMultiple,
    optionsId: model.optionsId,
    placeholder: model.initialLabel,
    selectionLabel: "selected",
  };
}

function searchTop(model: ReturnType<typeof dropdownModel>) {
  if (!model.isSearchable) {
    return null;
  }
  return (
    <div className="dropdown-top" data-dropdown-ignore="">
    <InlineRow gap="xs">
    {search_query_input({
          children: input({
              type: "search",
              placeholder: model.searchPlaceholderText,
              autoComplete: "off",
          }),
    })}
    {model.isMultiple
      ? button({
          type: "button",
          title: model.unselectAllText,
          "aria-label": model.unselectAllText,
          icon: true,
          size: "sm",
          tooltip: true,
          "data-dropdown-clear": "",
          ...(!model.selectedValues.length
            ? { style: { display: "none" } }
            : {}),
          children: icon({ spec: "remixicon close-line" }),
      })
      : null}
    </InlineRow>
    </div>
  );
}

function optionNode(
  model: ReturnType<typeof dropdownModel>,
  option: dropdown_option,
  currentSection: string,
) {
  const optValue = toString(option && option.value);
  const optLabel = toString(option && option.label, optValue);
  const optHtml = option && option.html ? option.html : null;
  const optSearch = toString(option && option.search, optLabel).toLowerCase();
  const optAttrs = mapAttrs(option && option.attrs ? option.attrs : {});
  const optSection = toString(option && option.section);
  const allowEmptyValue = option?.unselect === true;
  if ((!optValue && !allowEmptyValue) || !optLabel)
  return { node: null, section: currentSection };
  const hasSections = model.optionsList.some((entry) =>
    toString(entry && entry.section),
  );
  const sectionNode =
  hasSections && optSection && optSection !== currentSection ? (
    <li
    key={`section_${optSection}`}
    className="dropdown-section"
    data-dropdown-section-heading={optSection}
    >
    {optSection}
    </li>
  ) : null;
  const optionContent = (
    <>
    {model.isMultiple && !model.shouldHideChecks ? (
        <span className="dropdown-check" aria-hidden="true">
        {icon({ spec: "remixicon check-line" })}
        </span>
      ) : null}
    {optHtml || <span>{optLabel}</span>}
    </>
  );
  return {
    section: optSection || currentSection,
    node: (
      <Fragment key={optSection ? `${optSection}_${optValue}` : optValue}>
      {sectionNode}
      <li
      className={undefined}
      aria-selected={model.selectedSet.has(optValue) ? "true" : "false"}
      data-dropdown-option=""
      data-dropdown-selected={
        model.selectedSet.has(optValue) ? "true" : "false"
      }
      {...(model.isSearchable ? { "data-search-item": "" } : {})}
      {...(option?.unselect === true
          ? { "data-dropdown-unselect": "true" }
          : {})}
      {...optAttrs}
      >
      {dropdownConfigScript("data-dropdown-option-config", {
            label: optLabel,
            section: optSection,
            selected: model.selectedSet.has(optValue),
            unselect: option?.unselect === true,
            value: optValue,
      })}
      {model.isSearchable
        ? search_config_script({
            kind: "item",
            config: { text: optSearch },
        })
        : null}
      {optionContent}
      </li>
      </Fragment>
    ),
  };
}

function optionNodes(model: ReturnType<typeof dropdownModel>) {
  let currentSection = "";
  return model.optionsList.map((option) => {
      const result = optionNode(model, option, currentSection);
      currentSection = result.section;
      return result.node;
  });
}

function optionsPanel(model: ReturnType<typeof dropdownModel>) {
  return (
    <div
    id={model.optionsId}
    className="options"
    data-dropdown-options=""
    data-dropdown-portaled="true"
    {...(model.isSearchable ? { "data-search-panel-root": "" } : {})}
    >
    {model.isSearchable
      ? search_config_script({
          kind: "panel",
          config: {},
      })
      : null}
    {model.topNode}
    {searchTop(model)}
    <ul
    className="dropdown-list"
    data-dropdown-list=""
    id={model.listElementId || undefined}
    >
    <li
    className={undefined}
    data-dropdown-placeholder-option=""
    hidden={model.optionsList.length > 0}
    >
    {model.emptyOptionText}
    </li>
    {optionNodes(model)}
    </ul>
    {model.isSearchable ? (
        <div
        className={primitiveTextClassName({
              className: "dropdown-empty",
              muted: true,
              size: "sm",
        })}
        data-search-empty-slot=""
        hidden
        >
        {model.emptyMessage}
        </div>
      ) : null}
    </div>
  );
}

function dropdownNode(
  props: dropdown_props,
  model: ReturnType<typeof dropdownModel>,
) {
  return (
    <div
    id={model.ddId}
    className={["dropdown-field-root", model.rootClass || ""]
      .filter(Boolean)
      .join(" ")}
    data-dropdown-root=""
    data-dropdown-has-label="true"
    {...(model.isDisabled ? { "aria-disabled": "true" } : {})}
    {...mapAttrs(props.rootProps)}
    >
    {dropdownConfigScript(
        "data-dropdown-root-config",
        dropdownRootConfigPayload(model),
    )}
    <input
    type="hidden"
    id={model.hiddenId || undefined}
    name={model.fieldName}
    value={
      model.isMultiple
      ? JSON.stringify(model.selectedValues)
      : model.selectedValues[0] || ""
    }
    {...mapAttrs(props.inputProps)}
    />
    <div className="dropdown-label" data-dropdown-label="">
    {model.initialHtml || model.initialLabel}
    </div>
    {optionsPanel(model)}
    </div>
  );
}

function advancedDropdown(props: dropdown_props) {
  const model = dropdownModel(props);
  const node = dropdownNode(props, model);
  if (!model.labelText) return node;
  return (
    <div className={model.wrapperClass}>
    <span className="label">{model.labelText}</span>
    {node}
    </div>
  );
}

export type { dropdown_option, dropdown_props };
export default advancedDropdown;
