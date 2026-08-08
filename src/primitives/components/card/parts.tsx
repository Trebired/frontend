import type { ReactNode } from "react";
import type {
  CardItemProps,
  CardSegment,
  CardSegmentRow,
  CardSegmentsProps,
  attr_map,
} from "#xb7hv37sq5h5";
import { card } from "#6hfutrhvm6x6";
import { card_body } from "./body.js";
import { toText } from "#6mupcizo1mwq";

function segmentSpan(entry: CardSegment | undefined, rowIndex: number, segmentIndex: number) {
  const className = toText(entry?.className, "text-muted");
  const text = entry?.value != null ? String(entry.value) : "";
  if (entry?.kind === "html") {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: segmentIndex > 0 ? `• ${text}` : text }}
        key={`segment_${rowIndex}_${segmentIndex}`}
      />
    );
  }
  return (
    <span className={className} key={`segment_${rowIndex}_${segmentIndex}`}>
      {segmentIndex > 0 ? "• " : ""}
      {entry?.value != null ? entry.value : ""}
    </span>
  );
}

function segmentRow(row: CardSegmentRow | undefined, rowIndex: number) {
  const segments = Array.isArray(row?.segments) ? row.segments.filter(Boolean) : [];
  return (
    <div
      className={`inline-row gap-xs2 wrap text-muted ${toText(row?.className)}`.trim()}
      key={`segments_${rowIndex}`}
      {...((row?.dataAttrs || {}) as attr_map)}
    >
      {segments.map((entry, segmentIndex) => segmentSpan(entry, rowIndex, segmentIndex))}
    </div>
  );
}

function card_segments(props: CardSegmentsProps) {
  const rows = Array.isArray(props.rows) ? props.rows : [];
  if (!rows.length) return null;
  return (
    <div className="column gap-xs2 text-sm card-segments text-muted">
      {rows.map(segmentRow)}
    </div>
  );
}

function card_item(props: CardItemProps) {
  const metaParts = [props.statusHtml, props.titleMetaHtml].filter(
    (part) => typeof part === "string" && part.trim(),
  );
  const meta = metaParts.length ? (
    <span dangerouslySetInnerHTML={{ __html: metaParts.join("") }} />
  ) : null;
  return card_body({
    actionTrigger: props.actionTrigger,
    className: props.className,
    dataAttrs: props.dataAttrs,
    extra: props.extraHtml ? <div dangerouslySetInnerHTML={{ __html: props.extraHtml }} /> : null,
    meta,
    search: props.search,
    segments:
      Array.isArray(props.segmentRows) && props.segmentRows.length
        ? card_segments({ rows: props.segmentRows })
        : null,
    title: props.title || "",
  });
}

function titleDescriptionCard(props: { description: ReactNode; title: ReactNode }) {
  return card({
    children: (
      <>
        <div className="title-desc column gap-sm">
          <h3>{props.title}</h3>
          <p className="text-muted">{props.description}</p>
        </div>
      </>
    ),
    className: "column gap-sm",
  });
}

export { card_item, card_segments, titleDescriptionCard };
