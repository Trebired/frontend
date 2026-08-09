import { createLocalTranslator } from "#dqy2d22qyujv";
import { toString } from "#dqy2d22qyujv";
import type { ReactNode } from "react";
import { icon } from "#dqy2d22qyujv";
import iconRuntime from "#e55z7pkijewq";
import { documentLang } from "#dqy2d22qyujv";
import { button } from "#dqy2d22qyujv";
import {
  primitiveButtonClassName,
  primitiveGridClassName,
  primitiveStackClassName,
} from "#hzrmwbvgt2ax";

type AttrMap = Record<string, unknown>;

type key_value_input_field = {
  className?: string;
  control: ReactNode;
  controlAttrs?: AttrMap;
  label?: ReactNode;
  labelAttrs?: AttrMap;
};

type key_value_input_props = {
  children?: ReactNode;
  className?: string;
  fields?: key_value_input_field[];
  remove?: boolean;
  removeAttrs?: AttrMap;
  removeClassName?: string;
  removeLabel?: string;
  rootAttrs?: AttrMap;
  rowKey?: string;
  lang?: string;
};

type key_value_input_dom_field = {
  className?: string;
  control: Node;
  controlAttrs?: AttrMap;
  label?: unknown;
  labelAttrs?: AttrMap;
};

type key_value_input_dom_props = {
  children?: Node[];
  className?: string;
  fields?: key_value_input_dom_field[];
  remove?: boolean;
  removeAttrs?: AttrMap;
  removeClassName?: string;
  removeLabel?: string;
  rootAttrs?: AttrMap;
  lang?: string;
};

function attrs(input: unknown) {
  const out: Record<string, unknown> = {};
  const source = input && typeof input === "object" ? (input as AttrMap) : {};

  for (const [key, value] of Object.entries(source)) {
    if (
      !key ||
        key === "className" ||
        key === "style" ||
        value == null ||
        value === false
    )
    continue;
    out[key] = value;
  }

  return out;
}

function applyAttrs(element: HTMLElement, input: unknown) {
  const source = input && typeof input === "object" ? (input as AttrMap) : {};

  for (const [key, value] of Object.entries(source)) {
    if (!key || key === "className" || value == null || value === false)
    continue;
    if (key === "style" && value && typeof value === "object") {
      Object.assign(element.style, value);
      continue;
    }
    element.setAttribute(key, value === true ? "" : String(value));
  }
}

function fieldClassName(field: { className?: unknown }) {
  return primitiveStackClassName({
    className: [
      "key-value-input-field",
      toString(field && field.className, "grow"),
    ],
    gap: "xs",
  });
}

function hasLabels(fields: key_value_input_field[]) {
  return fields.some(
    (field) =>
    field &&
      field.label !== undefined &&
      field.label !== null &&
      field.label !== false,
  );
}

function attrStyle(input: unknown, base: Record<string, unknown> = {}) {
  const source = input && typeof input === "object" ? (input as AttrMap) : {};
  const style =
  source.style && typeof source.style === "object"
  ? (source.style as Record<string, unknown>)
  : {};
  return { ...style, ...base };
}

function fieldTrack(field: { className?: unknown }): string {
  const className = ` ${toString(field && field.className)} `;
  if (className.includes(" width-xs2 ")) return "minmax(0, 100px)";
  if (className.includes(" width-xs ")) return "minmax(0, 150px)";
  if (className.includes(" width-sm ")) return "minmax(0, 200px)";
  if (className.includes(" width-md ")) return "minmax(0, 300px)";
  return "minmax(0, 1fr)";
}

function gridColumns(fields: Array<{ className?: unknown }>, remove: boolean) {
  return fields
  .map(fieldTrack)
  .concat(remove ? ["max-content"] : [])
  .join(" ");
}

function gridStyle(fields: Array<{ className?: unknown }>, remove: boolean) {
  return {
    "--tbf-grid-template-columns": gridColumns(fields, remove),
    alignItems: "center",
  } as Record<string, unknown>;
}

function keyValueGridCellStyle(column: number, row: number) {
  return { gridColumn: String(column), gridRow: String(row) };
}

function controlRow(labels: boolean) {
  return labels ? 2 : 1;
}

function renderLabels(fields: key_value_input_field[]) {
  return fields.map((field, index) =>
    field && field.label ? (
      <span
      {...attrs(field.labelAttrs)}
      key={`label_${index}`}
      className="label"
      style={attrStyle(field.labelAttrs, keyValueGridCellStyle(index + 1, 1))}
      >
      {field.label}
      </span>
    ) : null,
  );
}

function renderFields(fields: key_value_input_field[], labels: boolean) {
  const row = controlRow(labels);
  return fields.map((field, index) => (
      <div
      {...attrs(field && field.controlAttrs)}
      key={`field_${index}`}
      className={fieldClassName(field)}
      style={attrStyle(
          field && field.controlAttrs,
          keyValueGridCellStyle(index + 1, row),
      )}
      >
      {field && field.control}
      </div>
  ));
}

function removeButtonProps(
  props: key_value_input_props | key_value_input_dom_props,
) {
  const localT = createLocalTranslator(
    import.meta.url,
    props.lang || documentLang(),
  );
  const removeLabel = toString(
    props.removeLabel,
    toString(
      (props.removeAttrs as any)?.["aria-label"],
      localT("actions.remove"),
    ),
  );
  const removeClassName = primitiveButtonClassName({
    className: [
      "no-shrink",
      toString(props.removeClassName),
      toString((props.removeAttrs as any)?.className),
    ],
    icon: true,
    size: "lg",
    tone: "red",
  });
  return { removeClassName, removeLabel };
}

function key_value_input(props: key_value_input_props) {
  const rootAttrs = attrs(props.rootAttrs);
  const removeAttrs = attrs(props.removeAttrs);
  const fields = Array.isArray(props.fields)
  ? props.fields.filter(Boolean)
  : [];
  const rootClassName = primitiveStackClassName({
    className: [
      "key-value-input",
      toString(props.className),
      toString((props.rootAttrs as any)?.className),
    ],
    gap: "xs",
  });
  const { removeClassName, removeLabel } = removeButtonProps(props);
  const labels = hasLabels(fields);
  const removeColumn = fields.length + 1;
  const removeRow = controlRow(labels);
  return (
    <div
    {...rootAttrs}
    key={toString(props.rowKey) || undefined}
    className={rootClassName}
    data-key-value-input=""
    >
    <div
    className={primitiveGridClassName({ gap: "xs" })}
    style={gridStyle(fields, props.remove !== false)}
    data-key-value-input-controls=""
    >
    {labels ? renderLabels(fields) : null}
    {fields.length ? renderFields(fields, labels) : props.children}
    {props.remove === false
      ? null
      : button({
          ...removeAttrs,
          type: "button",
          className: removeClassName,
          "aria-label": removeLabel,
          title: toString((props.removeAttrs as any)?.title, removeLabel),
          style: keyValueGridCellStyle(removeColumn, removeRow),
          children: icon({ spec: "remixicon close-line" }),
    })}
    </div>
    </div>
  );
}

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
  button.setAttribute(
    "title",
    toString((props.removeAttrs as any)?.title, removeLabel),
  );
  applyAttrs(button, props.removeAttrs);
  if (!button.getAttribute("type")) button.type = "button";
  iconRuntime.append(button, "remixicon close-line", {
      "aria-hidden": "true",
  });
  controls.appendChild(button);
}

function createKeyValueInputElement(
  doc: Document,
  props: key_value_input_dom_props,
) {
  const root = doc.createElement("div");
  const fields = Array.isArray(props.fields)
  ? props.fields.filter(Boolean)
  : [];
  const rootClassName = primitiveStackClassName({
    className: [
      "key-value-input",
      toString(props.className),
      toString((props.rootAttrs as any)?.className),
    ],
    gap: "xs",
  });
  root.className = rootClassName;
  root.setAttribute("data-key-value-input", "");
  applyAttrs(root, props.rootAttrs);
  const controls = doc.createElement("div");
  controls.className = primitiveGridClassName({ gap: "xs" });
  controls.style.setProperty(
    "--tbf-grid-template-columns",
    gridColumns(fields, props.remove !== false),
  );
  controls.style.alignItems = "center";
  controls.setAttribute("data-key-value-input-controls", "");
  const labels = fields.some(
    (field) =>
    field &&
      field.label !== undefined &&
      field.label !== null &&
      field.label !== false,
  );
  const row = controlRow(labels);
  if (labels)
  fields.forEach((field, index) =>
    appendDomLabel(controls, doc, field, index + 1),
  );
  fields.forEach((field, index) =>
    appendDomField(controls, doc, field, index + 1, row),
  );
  if (!fields.length && Array.isArray(props.children)) {
    props.children.forEach((child) => controls.appendChild(child));
  }
  if (props.remove !== false) {
    appendDomRemoveButton(controls, doc, props, fields.length + 1, row);
  }
  root.appendChild(controls);
  return root;
}

export type {
  key_value_input_dom_field,
  key_value_input_dom_props,
  key_value_input_field,
  key_value_input_props,
};
export { createKeyValueInputElement };
export default key_value_input;
