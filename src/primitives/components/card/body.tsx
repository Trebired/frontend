import type { ReactNode } from "react";
import { Icon } from "#lbkpzw8nphru";
import { search_config_script } from "#f1earyowcgbb";
import type {
  BodyProps,
  SelectCardItem,
  SelectCardsProps,
  attr_map,
} from "#xb7hv37sq5h5";
import { joinClassNames, toText, wrapTriggerHostNode } from "#6mupcizo1mwq";

function stripGapClasses(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !/^gap(?:-[a-z0-9]+)?$/iu.test(token))
    .join(" ");
}

function liveCardNode(props: BodyProps, node: ReactNode) {
  const kind = toText(props.live?.kind);
  const id = toText(props.live?.id);
  if (!kind || !id) return node;
  return (
    <span
      data-tbf-live-card=""
      data-tbf-live-id={id}
      data-tbf-live-kind={kind}
      style={{ display: "contents" }}
    >
      {node}
    </span>
  );
}

function resolveWidth(props: BodyProps) {
  if (props.width === "full") return "full";
  if (props.width === "fit") return "fit";
  return props.titleWidthFit !== false ? "fit" : "full";
}

function resolvedTitleClassName(props: BodyProps) {
  return joinClassNames(
    "text-break",
    resolveWidth(props) === "fit" ? "width-fit" : "",
    props.titleClassName,
  );
}

function resolvedSubtitleClassName(props: BodyProps) {
  return joinClassNames("text-muted", "text-sm", "text-break", props.subtitleClassName);
}

function titleStyle(titleClassName: string) {
  const usesWidthFit = titleClassName.split(/\s+/).includes("width-fit");
  return { flex: usesWidthFit ? "0 1 auto" : "1 1 auto" };
}

function card_icon(props: { children?: ReactNode; className?: string }) {
  if (!props.children) return null;
  return (
    <div
      aria-hidden="true"
      className={joinClassNames("inline-row", "gap-xs", "no-stretch", "ver-center", "card-icon", props.className)}
    >
      {props.children}
    </div>
  );
}

function iconBlock(props: BodyProps, showDivider: boolean) {
  if (!props.icon) return null;
  return (
    <>
      {card_icon({ children: props.icon })}
      {showDivider ? <span aria-hidden="true" className="card-body-divider" /> : null}
    </>
  );
}

function titleSpan(props: BodyProps, titleClassName: string) {
  return (
    <span
      className={titleClassName}
      style={titleStyle(titleClassName)}
      {...((props.titleAttrs || {}) as attr_map)}
    >
      {props.title}
    </span>
  );
}

function titleRow(
  props: BodyProps,
  titleClassName: string,
  showTitleMeta: boolean,
  showActions: boolean,
) {
  const hasAside = Boolean((showTitleMeta && props.meta) || (showActions && props.actions));
  if (!props.title && !hasAside) return null;
  if (!hasAside) return titleSpan(props, titleClassName);
  const actionsClassName = toText(props.actionsClassName, "inline-row fit-content gap-xs2");
  return (
    <div className="inline-row gap-xs">
      {titleSpan(props, titleClassName)}
      {showTitleMeta && props.meta ? props.meta : null}
      {showActions && props.actions ? (
        <div className="right">
          <div className={actionsClassName}>{props.actions}</div>
        </div>
      ) : null}
    </div>
  );
}

function contentColumn(
  props: BodyProps,
  showTitleMeta: boolean,
  showActions: boolean,
  showSegments: boolean,
) {
  const titleClassName = resolvedTitleClassName(props);
  return (
    <div className="column gap-xs">
      {titleRow(props, titleClassName, showTitleMeta, showActions)}
      {props.subtitle ? <div className={resolvedSubtitleClassName(props)}>{props.subtitle}</div> : null}
      {showSegments ? props.segments : null}
      {props.extra}
    </div>
  );
}

function contentBlock(
  props: BodyProps,
  bodyClassName: string,
  options: {
    hasIcon: boolean;
    showActions: boolean;
    showDivider: boolean;
    showSegments: boolean;
    showTitleMeta: boolean;
  },
) {
  return (
    <div className={`inline-row gap-xs card-body ${bodyClassName}`.trim()}>
      {options.hasIcon ? iconBlock(props, options.showDivider) : null}
      {contentColumn(props, options.showTitleMeta, options.showActions, options.showSegments)}
    </div>
  );
}

function selectButton(
  props: BodyProps,
  className: string,
  content: ReactNode,
  selected: boolean,
  disabled: boolean,
) {
  return (
    <button
      {...((props.dataAttrs || {}) as attr_map)}
      aria-disabled={disabled ? "true" : undefined}
      aria-selected={selected ? "true" : "false"}
      className={className}
      data-card-excluded={props.select && !selected ? "true" : undefined}
      data-card-row=""
      data-card-selected={selected ? "true" : undefined}
      data-select-card=""
      data-value={toText(props.select?.value) || undefined}
      disabled={disabled}
      style={{ textAlign: "left", width: "100%" }}
      type={props.select?.buttonType || "button"}
      value={toText(props.select?.value) || undefined}
    >
      {content}
    </button>
  );
}

function searchableBodyNode(props: BodyProps, node: ReactNode) {
  return props.search ? (
    <span data-search-item="" style={{ display: "contents" }}>
      {search_config_script({ config: props.search, kind: "item" })}
      {node}
    </span>
  ) : node;
}

function bodyState(props: BodyProps) {
  const typeConfig = props.type && typeof props.type === "object" ? props.type : {};
  const showIcon = typeConfig.icon !== false;
  const selected = props.select && props.select.selected === true;
  return {
    baseClassName: joinClassNames(
      "card-row",
      selected ? "selected" : "",
      props.select && !selected ? "excluded" : "",
      props.className,
    ),
    bodyClassName: stripGapClasses(toText(props.bodyClassName)),
    disabled: props.select && props.select.disabled === true,
    options: {
      hasIcon: Boolean(showIcon && props.icon),
      showActions: typeConfig.actions !== false,
      showDivider: props.showDivider !== false && typeConfig.divider !== false,
      showSegments: typeConfig.segments !== false,
      showTitleMeta: typeConfig.titleMeta !== false,
    },
    selected,
  };
}

function plainBodyNode(props: BodyProps, baseClassName: string, content: ReactNode) {
  const rendered = (
    <div
      {...((props.dataAttrs || {}) as attr_map)}
      className={baseClassName}
      data-card-row=""
    >
      {content}
    </div>
  );
  return liveCardNode(props, wrapTriggerHostNode(rendered, { action: props.actionTrigger }));
}

function card_body(props: BodyProps) {
  const state = bodyState(props);
  const content = contentBlock(props, state.bodyClassName, state.options);
  if (props.select) {
    return searchableBodyNode(
      props,
      wrapTriggerHostNode(
        selectButton(props, state.baseClassName, content, state.selected, Boolean(state.disabled)),
        { action: props.actionTrigger },
      ),
    );
  }
  return searchableBodyNode(props, plainBodyNode(props, state.baseClassName, content));
}

function selectLayoutClassName(props: SelectCardsProps) {
  return joinClassNames(props.layout === "column" ? "column" : "grid auto-md", "gap-sm", props.className);
}

function selectExtra(item: SelectCardItem): ReactNode {
  if (!item.details && !item.content) return null;
  return (
    <>
      {item.details ? <div className="text-muted text-sm">{item.details}</div> : null}
      {item.content ? <div>{item.content}</div> : null}
    </>
  );
}

function select(props: SelectCardsProps) {
  const items = Array.isArray(props.items) ? props.items.filter(Boolean) : [];
  const showIcon = props.icon === true;
  return (
    <div className={selectLayoutClassName(props)} {...((props.attrs || {}) as attr_map)}>
      {items.map((item, index) => {
        const value = toText(item.value);
        const key = toText(item.id, value || `select-card-${index}`);
        const selected = item.selected === true;
        const disabled = item.disabled === true;
        return (
          <span key={key} style={{ display: "contents" }}>
            {card_body({
              className: joinClassNames("height-max", item.className),
              dataAttrs: item.attrs,
              extra: selectExtra(item),
              icon: showIcon && item.iconSpec ? <Icon spec={item.iconSpec} /> : null,
              meta: item.titleMeta,
              select: {
                buttonType: item.buttonType,
                disabled,
                selected,
                value,
              },
              showDivider: showIcon,
              subtitle: item.description,
              title: item.title || "",
              titleWidthFit: false,
              width: "full",
            })}
          </span>
        );
      })}
    </div>
  );
}

export { card_body, card_icon, select, selectExtra };
