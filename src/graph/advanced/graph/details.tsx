import { toString } from "#4fte8m1x62rd";
import type { key_value_group, key_value_row } from "./types.js";

function keyValueRowValueProps(row: key_value_row) {
  return row.value_attrs && typeof row.value_attrs === "object"
  ? row.value_attrs
  : {};
}

function formatKeyValueRowValue(row: key_value_row) {
  const value = row.value;
  if (value === null || value === undefined) return "";
  const formatted = String(value);
  return row.unit ? `${formatted} ${row.unit}` : formatted;
}

function renderDetailValue(row: key_value_row, index: number) {
  const valueHtml = typeof row.value_html === "string" ? row.value_html : "";

  if (valueHtml) {
    return (
      <div
      key={`graph_detail_value_html_${index}`}
      className="text-break"
      {...keyValueRowValueProps(row)}
      dangerouslySetInnerHTML={{ __html: valueHtml }}
      />
    );
  }

  return (
    <div
    key={`graph_detail_value_${index}`}
    className="text-break"
    {...keyValueRowValueProps(row)}
    >
    {formatKeyValueRowValue(row)}
    </div>
  );
}

function safeGroupedDetails(groups: key_value_group[]) {
  return groups
  .map((group) => ({
        title: toString(group && group.title),
        rows: Array.isArray(group && group.rows)
        ? group.rows.filter(
          (row) => row && typeof row === "object" && row.label,
        )
        : [],
  }))
  .filter((group) => group.rows.length);
}

function renderGroupedDetails(groups: key_value_group[]) {
  const safeGroups = safeGroupedDetails(groups);
  if (!safeGroups.length) return null;

  return (
    <div className="column gap-sm">
    {safeGroups.map((group, groupIndex) => (
          <div
          className="card column gap-sm padding-sm"
          key={`graph_group_${group.title || "group"}_${groupIndex}`}
          >
          {group.title ? <h4>{group.title}</h4> : null}
          <div className="grid gap-sm">
          {group.rows.map((row, rowIndex) => (
                <div
                className="column gap-xs"
                key={`graph_group_row_${String(row.label || "row")}_${rowIndex}`}
                >
                <span className="label lh-xs">{String(row.label || "")}</span>
                {renderDetailValue(row, rowIndex)}
                </div>
          ))}
          </div>
          </div>
    ))}
    </div>
  );
}

function renderRowDetails(rows: key_value_row[]) {
  const safeRows = rows.filter(
    (row) => row && typeof row === "object" && row.label,
  );
  if (!safeRows.length) return null;

  return (
    <div className="column gap-sm">
    <div className="grid gap-sm">
    {safeRows.map((row, rowIndex) => (
          <div
          className="card column gap-xs padding-sm"
          key={`graph_row_${String(row.label || "row")}_${rowIndex}`}
          >
          <span className="label lh-xs">{String(row.label || "")}</span>
          {renderDetailValue(row, rowIndex)}
          </div>
    ))}
    </div>
    </div>
  );
}

export { renderGroupedDetails, renderRowDetails };
