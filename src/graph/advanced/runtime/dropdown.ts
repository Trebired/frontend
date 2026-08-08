import {
  cssEscapeIdent,
  describeGraphNode,
  graphOptionValues,
} from "./utils.js";
import {
  dropdownOptionSelected,
  dropdownOptionValue,
  getDropdownOptions,
} from "#z2c0jqmjqds4";

function cloneTemplateRoot(templateId) {
  const template =
  typeof document !== "undefined"
  ? document.getElementById(String(templateId || ""))
  : null;
  if (!(template instanceof HTMLTemplateElement)) return null;
  const fragment = template.content.cloneNode(true);
  return fragment;
}

function findGraphUnitInput(root, graphId) {
  if (!root || typeof root.querySelector !== "function") return null;
  const id = String(graphId || "");
  const inputs = Array.from(
    root.querySelectorAll("[data-graph-unit-input]"),
  ) as Element[];
  const byAttr = inputs.find(
    (input) => String(input.getAttribute("data-graph-unit-input") || "") === id,
  );
  if (byAttr) return byAttr;

  return root.querySelector(`#${cssEscapeIdent(id)}_unit_scale`);
}

function findGraphUnitDropdown(root, graphId) {
  if (!root || typeof root.querySelector !== "function") return null;
  const id = String(graphId || "");
  const dropdowns = Array.from(
    root.querySelectorAll("[data-graph-unit-dropdown]"),
  ) as Element[];
  const byAttr = dropdowns.find(
    (dropdown) =>
    String(dropdown.getAttribute("data-graph-unit-dropdown") || "") === id,
  );
  if (byAttr) return byAttr;

  return root.querySelector(`#${cssEscapeIdent(id)}_unit_dropdown`);
}

function getGraphUnitDropdownOptions(dropdown) {
  return dropdown instanceof HTMLElement ? getDropdownOptions(dropdown) : null;
}

function markGraphUnitDropdown(root, graphId) {
  const dropdown = findGraphUnitDropdown(root, graphId);
  const input = findGraphUnitInput(root, graphId);
  if (dropdown && typeof dropdown.setAttribute === "function") {
    dropdown.setAttribute("data-graph-unit-dropdown", String(graphId || ""));
  }
  if (input && typeof input.setAttribute === "function") {
    input.setAttribute("data-graph-unit-input", String(graphId || ""));
  }
  return {
    dropdown,
    input,
    options: getGraphUnitDropdownOptions(dropdown),
  };
}

function inspectGraphUnitDropdown(root, graphId) {
  const dropdown = findGraphUnitDropdown(root, graphId);
  const input = findGraphUnitInput(root, graphId);
  const options = getGraphUnitDropdownOptions(dropdown);
  const selected =
  options && typeof options.querySelectorAll === "function"
  ? Array.from(options.querySelectorAll("[data-dropdown-option]"))
  .filter((item) =>
    item instanceof HTMLElement ? dropdownOptionSelected(item) : false,
  )
  .map((item) =>
    item instanceof HTMLElement ? dropdownOptionValue(item) : "",
  )
  .filter(Boolean)
  : [];

  return {
    graph_id: graphId,
    dropdown_found: Boolean(dropdown),
    dropdown_node: describeGraphNode(dropdown),
    input_found: Boolean(input),
    input_value: input && typeof input.value === "string" ? input.value : "",
    options_found: Boolean(options),
    options_node: describeGraphNode(options),
    options_portaled:
    options instanceof HTMLElement &&
      options.getAttribute("data-dropdown-portaled") === "true"
    ? "true"
    : "",
    options_parent: describeGraphNode(options && options.parentNode),
    option_values: graphOptionValues(options),
    selected_values: selected,
  };
}

function readGraphUnitDropdownSelection(root, graphId) {
  const input = findGraphUnitInput(root, graphId);
  const inputValue =
  input && typeof input.value === "string" ? input.value : "";

  const dropdown = findGraphUnitDropdown(root, graphId);
  const options = getGraphUnitDropdownOptions(dropdown);
  const selected =
  options && typeof options.querySelector === "function"
  ? options.querySelector(
    '[data-dropdown-option][data-dropdown-selected="true"]',
  )
  : null;
  const selectedValue =
  selected instanceof HTMLElement ? dropdownOptionValue(selected) : "";

  if (selectedValue) {
    return {
      value: selectedValue,
      source: "selected-option",
      inputValue,
      selectedValue,
    };
  }

  if (inputValue) {
    return {
      value: inputValue,
      source: "hidden-input",
      inputValue,
      selectedValue,
    };
  }

  return {
    value: "",
    source: "empty",
    inputValue,
    selectedValue,
  };
}

export {
  cloneTemplateRoot,
  findGraphUnitDropdown,
  findGraphUnitInput,
  inspectGraphUnitDropdown,
  markGraphUnitDropdown,
  readGraphUnitDropdownSelection,
};
