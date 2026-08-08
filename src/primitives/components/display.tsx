import { HTMLAttributes, ReactNode } from "react";
import { CanvasPanel as FrontendCanvasPanel } from "#4woymc9xhupl";
import { FullscreenTarget } from "#vbkfq413o3u7";
import { appendClassName, joinClassNames } from "./shared.js";
import { card } from "./controls.js";

type TableProps = HTMLAttributes<HTMLTableElement> & {
  children?: ReactNode;
};

type SummaryStat = {
  label: string;
  note: string;
  value: unknown;
  valueProps?: Record<string, unknown>;
};

type SummaryCardProps = {
  description: ReactNode;
  stats: SummaryStat[];
  title: ReactNode;
};

type CanvasPanelCompatProps = {
  canvasBackground?: boolean;
  children?: ReactNode;
  content?: ReactNode;
  contentClassName?: string;
  extendGroup?: string;
  extendId?: string;
  id?: string;
  panelClassName?: string;
  rootAttrs?: Record<string, unknown>;
  scroll?: boolean;
  title?: ReactNode;
  toolbar?: boolean;
  toolbarContent?: ReactNode;
};

function table(props: TableProps) {
  const { children, className, ...rest } = props;
  return (
    <table {...rest} className={joinClassNames(className)} data-tbf-table="">
      {children}
    </table>
  );
}

function summary_stat_card(stat: SummaryStat) {
  return card({
    className: "column gap-xs",
    children: (
      <>
        <span className="label">{stat.label}</span>
        <strong {...(stat.valueProps || {})}>
          {String(stat.value == null ? "" : stat.value)}
        </strong>
        <span className="text-muted text-small">{stat.note}</span>
      </>
    ),
  });
}

function summary_card(props: SummaryCardProps) {
  const stats = Array.isArray(props.stats) ? props.stats : [];
  return card({
    className: "column gap-sm",
    children: (
      <>
        {titleDescriptionNode(props.title, props.description)}
        <div className="grid auto-sm gap-sm">
          {stats.map((stat) => summary_stat_card(stat))}
        </div>
      </>
    ),
  });
}

function title_description_card(props: { description: ReactNode; title: ReactNode }) {
  return card({
    className: "column gap-sm",
    children: titleDescriptionNode(props.title, props.description),
  });
}

function canvas_panel(props: CanvasPanelCompatProps) {
  const content = props.content == null ? props.children : props.content;
  const rootAttrs = objectAttrs(props.rootAttrs);
  const CanvasPanel = FrontendCanvasPanel as any;
  const panel = (
    <CanvasPanel
      {...rootAttrs}
      {...(props.id ? { id: String(props.id) } : {})}
      actions={props.toolbar === false ? undefined : props.toolbarContent}
      className={panelClassName(props)}
      title={props.toolbar === false ? undefined : props.title}
    >
      <div className={contentClassName(props)}>{content}</div>
    </CanvasPanel>
  );
  if (!props.extendId || !props.extendGroup) return panel;
  return (
    <FullscreenTarget fullscreenId={props.extendId} group={props.extendGroup}>
      {panel}
    </FullscreenTarget>
  );
}

function titleDescriptionNode(title: ReactNode, description: ReactNode) {
  return (
    <div className="title-desc column gap-sm">
      <h3>{title}</h3>
      <p className="text-muted">{description}</p>
    </div>
  );
}

function panelClassName(props: CanvasPanelCompatProps) {
  return appendClassName(
    appendClassName(
      "canvas-panel column overflow-hidden padding-xs",
      String(props.panelClassName || "height-max"),
    ),
    props.canvasBackground === false ? "" : "bg-canvas",
  );
}

function contentClassName(props: CanvasPanelCompatProps) {
  return appendClassName(
    props.contentClassName,
    appendClassName(
      "canvas-panel-content",
      props.scroll === true ? "scroll scroll-min" : "",
    ),
  );
}

function objectAttrs(value: unknown) {
  return value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
}

export {
  canvas_panel,
  summary_card,
  summary_stat_card,
  table,
  title_description_card,
};
export type {
  CanvasPanelCompatProps,
  SummaryCardProps,
  SummaryStat,
  TableProps,
};
