import type { CanvasHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames, jsonScript } from "#ndsvdqv80epr";
import type { GraphConfig, GraphSeries } from "#9wjes84tjrfc";

type GraphPanelProps = HTMLAttributes<HTMLDivElement> & {
  config: GraphConfig;
  details?: ReactNode;
  legend?: boolean;
};

type GraphCanvasProps = CanvasHTMLAttributes<HTMLCanvasElement>;
type RoadmapItemModel = {
  description?: ReactNode;
  key?: string;
  label: ReactNode;
  meta?: ReactNode;
  state?: string;
};
type CalendarHeatmapDay = {
  date: string;
  label?: string;
  value: number;
};

function GraphPanel(props: GraphPanelProps) {
  const { children, className, config, details, legend = true, ...rest } = props;
  return (
    <div {...rest} className={classNames("tbf-graph", className)} data-tbf-graph="">
      <script
        data-tbf-graph-config=""
        hidden
        type="application/json"
        dangerouslySetInnerHTML={{ __html: jsonScript(config) }}
      />
      <div className="tbf-graph__canvas-shell">
        {children || <GraphCanvas />}
      </div>
      {legend ? <GraphLegend series={config.series} /> : null}
      {details ? <div className="tbf-graph__details">{details}</div> : null}
    </div>
  );
}

function GraphCanvas(props: GraphCanvasProps) {
  const { className, height = 260, width = 640, ...rest } = props;
  return (
    <canvas
      {...rest}
      className={classNames("tbf-graph__canvas", className)}
      data-tbf-graph-canvas=""
      height={height}
      width={width}
    />
  );
}

function GraphLegend(props: { series: GraphSeries[] }) {
  if (!props.series.length) return null;
  return (
    <ul className="tbf-graph__legend">
      {props.series.map((series) => (
        <li key={series.key} style={{ "--tbf-graph-series-color": series.color } as Record<string, string | undefined>}>
          <span />
          {series.label || series.key}
        </li>
      ))}
    </ul>
  );
}

function KeyValueList(props: HTMLAttributes<HTMLDListElement>) {
  const { children, className, ...rest } = props;
  return <dl {...rest} className={classNames("tbf-key-values", className)}>{children}</dl>;
}

function KeyValueItem(props: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="tbf-key-values__item">
      <dt>{props.label}</dt>
      <dd>{props.value}</dd>
    </div>
  );
}

function Roadmap(props: HTMLAttributes<HTMLOListElement> & { items: RoadmapItemModel[] }) {
  const { className, items, ...rest } = props;
  return (
    <ol {...rest} className={classNames("tbf-roadmap", className)}>
      {items.map((item, index) => <RoadmapItem item={item} key={item.key || index} />)}
    </ol>
  );
}

function RoadmapItem(props: { item: RoadmapItemModel }) {
  return (
    <li className="tbf-roadmap__item" data-tbf-roadmap-state={props.item.state}>
      <span className="tbf-roadmap__marker" />
      <div className="tbf-roadmap__body">
        <div className="tbf-roadmap__header">
          <strong>{props.item.label}</strong>
          {props.item.meta ? <span>{props.item.meta}</span> : null}
        </div>
        {props.item.description ? <p>{props.item.description}</p> : null}
      </div>
    </li>
  );
}

function CalendarHeatmap(props: HTMLAttributes<HTMLDivElement> & { days: CalendarHeatmapDay[]; max?: number }) {
  const { className, days, max, ...rest } = props;
  const ceiling = max || Math.max(1, ...days.map((day) => day.value));
  return (
    <div {...rest} className={classNames("tbf-heatmap", className)} data-tbf-heatmap="">
      {days.map((day) => (
        <span
          aria-label={day.label || `${day.date}: ${day.value}`}
          data-tbf-heatmap-cell=""
          data-tbf-heatmap-date={day.date}
          key={day.date}
          style={{ "--tbf-heatmap-level": String(Math.max(0, Math.min(1, day.value / ceiling))) } as Record<string, string>}
          title={day.label || `${day.date}: ${day.value}`}
        />
      ))}
    </div>
  );
}

export {
  CalendarHeatmap,
  GraphCanvas,
  GraphLegend,
  GraphPanel,
  KeyValueItem,
  KeyValueList,
  Roadmap,
  RoadmapItem,
};
export type { CalendarHeatmapDay, GraphCanvasProps, GraphPanelProps, RoadmapItemModel };
