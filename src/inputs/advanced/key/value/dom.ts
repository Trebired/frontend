import { toString } from "#dqy2d22qyujv";
import iconRuntime from "#e55z7pkijewq";
import {
  primitiveGridClassName,
  primitiveStackClassName,
} from "#hzrmwbvgt2ax";
import {
  applyAttrs,
  controlRow,
  fieldClassName,
  gridColumns,
  removeButtonProps,
} from "./shared.js";
import type {
  key_value_input_dom_field,
  key_value_input_dom_props,
} from "./shared.js";
import { frontendCssVar } from "#5vbaqj4pirp3";

function appendDomField(
  controls: HTMLElement,
  doc: Document,
  field: key_value_input_dom_field,
  columnIndex: number,
  rowIndex: number,
) {
  const column = doc.createElement("div");
  column.className = fieldClassName(field);
  column.style.gridColumn = String(columnIndex);
  column.style.gridRow = String(rowIndex);
  applyAttrs(column, field && field.controlAttrs);
  controls.appendChild(column);
  column.appendChild(field.control);
}

function appendDomLabel(
  controls: HTMLElement,
  doc: Document,
  field: key_value_input_dom_field,
  columnIndex: number,
) {
  if (!field || !field.label) return;
  const label = doc.createElement("span");
  label.className = "label";
  label.textContent = toString(field.label);
  label.style.gridColumn = String(columnIndex);
  label.style.gridRow = "1";
  applyAttrs(label, field.labelAttrs);
  controls.appendChild(label);
}

function appendDomRemoveButton(
  controls: HTMLElement,
  doc: Document,
  props: key_value_input_dom_props,
  column: number,
  row: number,
) {
  const { removeClassName, removeLabel } = removeButtonProps(props);
  const button = doc.createElement("button");
  button.type = "button";
  button.className = removeClassName;
  button.style.gridColumn = String(column);
  button.style.gridRow = String(row);
  button.setAttribute("aria-label", removeLabel);
  button.setAttribute("title", toString((props.removeAttrs as any)?.title, removeLabel));
  applyAttrs(button, props.removeAttrs);
  if (!button.getAttribute("type")) button.type = "button";
  iconRuntime.append(button, "remixicon close-line", {
      "aria-hidden": "true",
  });
  controls.appendChild(button);
}

function domFields(props: key_value_input_dom_props) {
  return Array.isArray(props.fields) ? props.fields.filter(Boolean) : [];
}

function createKeyValueInputElement(
  doc: Document,
  props: key_value_input_dom_props,
) {
  const root = doc.createElement("div");
  const fields = domFields(props);
  root.className = rootClassName(props);
  root.setAttribute("data-key-value-input", "");
  applyAttrs(root, props.rootAttrs);
  const controls = createControls(doc, fields, props.remove !== false);
  const labels = fields.some((field) => field && field.label !== undefined && field.label !== null && field.label !== false);
  const row = controlRow(labels);
  if (labels) fields.forEach((field, index) => appendDomLabel(controls, doc, field, index + 1));
  fields.forEach((field, index) => appendDomField(controls, doc, field, index + 1, row));
  if (!fields.length && Array.isArray(props.children)) {
    props.children.forEach((child) => controls.appendChild(child));
  }
  if (props.remove !== false) {
    appendDomRemoveButton(controls, doc, props, fields.length + 1, row);
  }
  root.appendChild(controls);
  return root;
}

function rootClassName(props: key_value_input_dom_props) {
  return primitiveStackClassName({
      className: [
        "key-value-input",
        toString(props.className),
        toString((props.rootAttrs as any)?.className),
      ],
      gap: "xs",
  });
}

function createControls(
  doc: Document,
  fields: key_value_input_dom_field[],
  removable: boolean,
) {
  const controls = doc.createElement("div");
  controls.className = primitiveGridClassName({ gap: "xs" });
  controls.style.setProperty(frontendCssVar("grid-template-columns"), gridColumns(fields, removable));
  controls.style.alignItems = "center";
  controls.setAttribute("data-key-value-input-controls", "");
  return controls;
}

export { createKeyValueInputElement };
