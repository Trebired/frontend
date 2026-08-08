import type { ReactNode } from "react";
import type { key_value_props, key_value_row } from "./types.js";
import { toText } from "./shared.js";
import { separator } from "./controls.js";

function formatAbsoluteDateTimeLabel(value: unknown) {
  const raw = toText(value);
  if (!raw) return "";
  const date = new Date(raw);
  if (!Number.isFinite(date.getTime())) return raw;
  return date.toLocaleString();
}

function formatKeyValueRowValue(row: key_value_row) {
  if (row.format === "time") return formatAbsoluteDateTimeLabel(row.value);
  return row.value == null ? "" : String(row.value);
}

function unavailableLabel(t?: unknown) {
  if (typeof t === "function") return toText(t("state.unavailable"), "Unavailable");
  return "Unavailable";
}

function keyValueRow(
  label: string,
  value: unknown,
  id = "",
  t?: unknown,
): key_value_row {
  const text = toText(value);
  return {
    ...(id ? { id } : {}),
    label,
    value: text || unavailableLabel(t),
  };
}

function keyValueTimeRow(
  label: string,
  value: unknown,
  id = "",
  t?: unknown,
): key_value_row {
  const text = toText(value);
  if (!text) return keyValueRow(label, unavailableLabel(t), id, t);
  return {
    ...(id ? { id } : {}),
    format: "time",
    label,
    value: text,
  };
}

function isRenderableValueNode(value: unknown) {
  if (Array.isArray(value)) return true;
  if (!value || typeof value !== "object") return false;
  return Object.prototype.hasOwnProperty.call(value, "$$typeof");
}

function keyValueRowValueProps(row: key_value_row) {
  return {
    ...(row.id ? { id: String(row.id) } : {}),
    ...(row.attributes ? { "data-attrs-html": row.attributes } : {}),
    ...(row.value_attributes ? { "data-value-attrs-html": row.value_attributes } : {}),
  };
}

function row_value_content(row: key_value_row, valueClassName: string) {
  const valueHtml = typeof row.value_html === "string" ? row.value_html : "";
  const valueNode =
    row.value_node != null ? row.value_node : isRenderableValueNode(row.value) ? row.value : null;
  const sharedProps = keyValueRowValueProps(row);
  if (valueHtml) {
    return (
      <div
        className={valueClassName}
        {...sharedProps}
        dangerouslySetInnerHTML={{ __html: valueHtml }}
      />
    );
  }
  if (valueNode != null) {
    return (
      <div className={valueClassName} {...sharedProps}>
        {valueNode as ReactNode}
      </div>
    );
  }
  return (
    <span className={valueClassName} {...sharedProps}>
      {formatKeyValueRowValue(row)}
    </span>
  );
}

function key_value_row_item(
  row: key_value_row,
  index: number,
  layout: "column" | "inline",
  rowClassName: string,
  valueClassName: string,
) {
  return (
    <div
      className={`${layout === "inline" ? "inline-row gap-xs2 lh-xs fit-content" : "inline-row gap-xs2 lh-xs"} ${rowClassName}`.trim()}
      key={`${String(row.label || "row")}_${index}`}
    >
      {layout === "inline" && index > 0 ? (
        <span className="text-muted lh-xs">•</span>
      ) : null}
      <span
        className="text-muted lh-xs"
        {...(row.label_attributes ? { "data-label-attrs-html": row.label_attributes } : {})}
      >
        {String(row.label || "")}:
      </span>
      {row_value_content(row, valueClassName)}
    </div>
  );
}

function key_value_rows(
  rows: key_value_row[],
  props?: { layout?: "column" | "inline"; rowClassName?: string },
) {
  const layout = props?.layout === "inline" ? "inline" : "column";
  const rowClassName = toText(props?.rowClassName);
  const valueClassName = layout === "inline" ? "text-muted text-break lh-xs" : "text-break lh-xs";
  return rows
    .filter((row) => row && typeof row === "object" && row.label)
    .map((row, index) => key_value_row_item(row, index, layout, rowClassName, valueClassName));
}

function keyValueModel(props: key_value_props) {
  const groups = Array.isArray(props.groups) ? props.groups.filter(Boolean) : [];
  const rows = Array.isArray(props.rows) ? props.rows.filter(Boolean) : [];
  const layout: "column" | "inline" =
    props.layout === "inline" ? "inline" : "column";
  const separated = props.separated === true || groups.length > 0;
  const wrapInCard = props.card === true || (props.card !== false && separated);
  const className = toText(props.className);
  const rowsClassName = toText(props.rowsClassName);
  const isInlineList = layout === "inline" && !wrapInCard;
  return {
    bodyClassName: isInlineList
      ? `inline-row gap-xs2 wrap text-muted ${rowsClassName}`.trim()
      : layout === "inline"
      ? `inline-row gap-xs2 wrap ${rowsClassName}`.trim()
      : `column gap-xs ${rowsClassName}`.trim(),
    groups,
    layout,
    rowClassName: toText(props.rowClassName),
    rows,
    separated,
    wrapperClassName: isInlineList
      ? `text-sm card-segments ${className}`.trim()
      : wrapInCard
      ? "card column gap-xs"
      : `column gap-xs ${className}`.trim(),
  };
}

function key_value(props: key_value_props) {
  const model = keyValueModel(props);
  if (model.groups.length) {
    return (
      <div className="grid gap-sm">
        {model.groups.map((group, index) => (
          <div className={model.wrapperClassName} key={`${String(group.title || "group")}_${index}`}>
            {group.title ? <div className="label lh-xs">{String(group.title)}</div> : null}
            {model.separated ? separator({}) : null}
            <div className={model.bodyClassName}>
              {key_value_rows(Array.isArray(group.rows) ? group.rows : [], {
                layout: model.layout,
                rowClassName: model.rowClassName,
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={model.wrapperClassName}>
      {model.separated ? separator({}) : null}
      <div className={model.bodyClassName}>
        {key_value_rows(model.rows, {
          layout: model.layout,
          rowClassName: model.rowClassName,
        })}
      </div>
    </div>
  );
}

export { keyValueRow, keyValueTimeRow, key_value, key_value_rows };
