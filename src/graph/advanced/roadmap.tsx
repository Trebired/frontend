import type { ReactNode } from "react";
import {
  Stack,
  Text,
  primitiveStackClassName,
} from "#hzrmwbvgt2ax";
import { frontendClassName, frontendElementClass } from "#5vbaqj4pirp3";

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

function renderAdvancedRoadmapItem(
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
    <Stack gap="xs" {...dataAttrs}>
    {item && item.title ? (
        <strong className={item.titleClassName || undefined}>
        {item.title}
        </strong>
      ) : null}
    {item && item.meta ? (
        <Text muted size="sm">{item.meta}</Text>
      ) : null}
    {item && item.segments ? <div>{item.segments}</div> : null}
    {item && item.extra ? <div>{item.extra}</div> : null}
    </Stack>
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
    className={`${frontendElementClass("roadmap", "item")} roadmap-item`}
    key={
      item && item.id != null
      ? String(item.id)
      : `roadmap_item_${groupIndex}_${itemIndex}`
    }
    {...dataAttrs}
    >
    <span className={`${frontendElementClass("roadmap", "marker")} roadmap-marker`}>
    {item && item.icon ? item.icon : null}
    </span>
    <div className={frontendElementClass("roadmap", "body")}>{content}</div>
    </li>
  );
}

function roadmapGroup(group: roadmap_group, groupIndex: number) {
  const items = Array.isArray(group && group.items)
  ? group.items.filter(Boolean)
  : [];
  if (!items.length) return null;

  return (
    <Stack
    gap="sm"
    key={
      group && group.id != null
      ? String(group.id)
      : `roadmap_group_${groupIndex}`
    }
    >
    {group && group.title ? <div>{group.title}</div> : null}
    <ol className={primitiveStackClassName({ className: `${frontendClassName("roadmap")} roadmap-items`, gap: "sm" })}>
    {items.map((item, itemIndex) =>
        renderAdvancedRoadmapItem(item, groupIndex, itemIndex),
    )}
    </ol>
    </Stack>
  );
}

function advancedRoadmap(props: roadmap_props) {
  const groups = Array.isArray(props.groups) ? props.groups : [];
  const className = primitiveStackClassName({
      className: props.className,
      gap: "sm",
  });

  return (
    <div className={className}>{groups.map(roadmapGroup)}</div>
  );
}

export type { roadmap_group, roadmap_item, roadmap_props };
export default advancedRoadmap;
