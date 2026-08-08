import type { ReactNode } from "react";

type BindActionOptions = {
  href?: string;
  [key: string]: unknown;
};

type roadmap_item = {
  actionTrigger?: BindActionOptions;
  body?: ReactNode;
  dataAttrs?: Record<string, string>;
  extra?: ReactNode;
  href?: string;
  icon?: ReactNode;
  id?: string | number;
  meta?: ReactNode;
  segments?: ReactNode;
  title?: ReactNode;
  titleClassName?: string;
};

type roadmap_group = {
  id?: string | number;
  items?: roadmap_item[];
  title?: ReactNode;
};

type roadmap_props = {
  className?: string;
  groups?: roadmap_group[];
  orientation?: "horizontal" | "vertical";
};

function roadmapItem(
  item: roadmap_item,
  groupIndex: number,
  itemIndex: number,
) {
  const href = typeof item.href === "string" ? item.href : "";
  const dataAttrs =
  item && item.dataAttrs && typeof item.dataAttrs === "object"
  ? item.dataAttrs
  : {};
  const actionTrigger = item.actionTrigger || (href ? { href } : undefined);
  const defaultBody = (
    <div className="column gap-xs" {...dataAttrs}>
    {item && item.title ? (
        <strong className={item.titleClassName || undefined}>
        {item.title}
        </strong>
      ) : null}
    {item && item.meta ? (
        <span className="text-muted text-sm">{item.meta}</span>
      ) : null}
    {item && item.segments ? <div>{item.segments}</div> : null}
    {item && item.extra ? <div>{item.extra}</div> : null}
    </div>
  );
  const body =
  item && item.body
  ? item.body
  : defaultBody;
  const content =
  actionTrigger && typeof actionTrigger.href === "string"
  ? (
    <a className="unstyled-link" href={actionTrigger.href}>
    {body}
    </a>
  )
  : body;

  return (
    <li
    className="tbf-roadmap__item roadmap-item"
    key={
      item && item.id != null
      ? String(item.id)
      : `roadmap_item_${groupIndex}_${itemIndex}`
    }
    {...dataAttrs}
    >
    <span className="tbf-roadmap__marker roadmap-marker">
    {item && item.icon ? item.icon : null}
    </span>
    <div className="tbf-roadmap__body">{content}</div>
    </li>
  );
}

function roadmapGroup(group: roadmap_group, groupIndex: number) {
  const items = Array.isArray(group && group.items)
  ? group.items.filter(Boolean)
  : [];
  if (!items.length) return null;

  return (
    <div
    className="column gap-sm"
    key={
      group && group.id != null
      ? String(group.id)
      : `roadmap_group_${groupIndex}`
    }
    >
    {group && group.title ? <div>{group.title}</div> : null}
    <ol className="tbf-roadmap column gap-sm roadmap-items">
    {items.map((item, itemIndex) =>
        roadmapItem(item, groupIndex, itemIndex),
    )}
    </ol>
    </div>
  );
}

function roadmap(props: roadmap_props) {
  const groups = Array.isArray(props.groups) ? props.groups : [];
  const className = ["column", "gap-sm", String(props.className || "").trim()]
  .filter(Boolean)
  .join(" ");

  return (
    <div className={className}>{groups.map(roadmapGroup)}</div>
  );
}

export type { roadmap_group, roadmap_item, roadmap_props };
export default roadmap;
