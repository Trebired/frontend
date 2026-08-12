import { toString } from "#dqy2d22qyujv";
import { icon } from "#dqy2d22qyujv";
import { button } from "#dqy2d22qyujv";
import {
  primitiveGridClassName,
  primitiveStackClassName,
} from "#hzrmwbvgt2ax";
import { createKeyValueInputElement } from "./dom.js";
import {
  attrStyle,
  attrs,
  controlRow,
  fieldClassName,
  gridStyle,
  hasLabels,
  keyValueGridCellStyle,
  removeButtonProps,
} from "./shared.js";
import type {
  key_value_input_dom_field,
  key_value_input_dom_props,
  key_value_input_field,
  key_value_input_props,
} from "./shared.js";

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

export type {
  key_value_input_dom_field,
  key_value_input_dom_props,
  key_value_input_field,
  key_value_input_props,
};
export { createKeyValueInputElement };
export default key_value_input;
