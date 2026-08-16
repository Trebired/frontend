import { createLocalTranslator } from "#dqy2d22qyujv";
import { toString } from "#dqy2d22qyujv";
import type { ReactNode } from "react";
import { documentLang } from "#dqy2d22qyujv";
import {
  primitiveButtonClassName,
  primitiveStackClassName,
} from "#hzrmwbvgt2ax";
import { frontendCssVar } from "#5vbaqj4pirp3";

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
    if (!key || key === "className" || key === "style" || value == null || value === false) continue;
    out[key] = value;
  }

  return out;
}

function applyAttrs(element: HTMLElement, input: unknown) {
  const source = input && typeof input === "object" ? (input as AttrMap) : {};

  for (const [key, value] of Object.entries(source)) {
    if (!key || key === "className" || value == null || value === false) continue;
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

function gridColumns(fields: Array<{className?:unknown}>, remove: boolean) {
  return fields
  .map(fieldTrack)
  .concat(remove ? ["max-content"] : [])
  .join(" ");
}

function gridStyle(fields: Array<{className?:unknown}>, remove: boolean) {
  return {
    [frontendCssVar("grid-template-columns")]: gridColumns(fields, remove),
    alignItems: "center",
  } as Record<string, unknown>;
}

function keyValueGridCellStyle(column: number, row: number) {
  return { gridColumn: String(column), gridRow: String(row) };
}

function controlRow(labels: boolean) {
  return labels ? 2 : 1;
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

export {
  applyAttrs,
  attrStyle,
  attrs,
  controlRow,
  fieldClassName,
  gridColumns,
  gridStyle,
  hasLabels,
  keyValueGridCellStyle,
  removeButtonProps,
};

export type {
  AttrMap,
  key_value_input_dom_field,
  key_value_input_dom_props,
  key_value_input_field,
  key_value_input_props,
};
