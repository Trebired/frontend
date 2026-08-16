import { ActionForm } from "#gknmswavy1t3";
import { Button as FrontendButton, Card as FrontendCard } from "#4woymc9xhupl";
import type {
  ActionFormProps,
  AvatarProps,
  ButtonProps,
  CardProps,
  CsrfInputProps,
  PillProps,
  SeparatorProps,
  StatusDotProps,
  bar_props,
  circle_props,
  list_props,
  masonry_props,
} from "./types.js";
import {
  primitiveButtonClassName,
  primitiveCardClassName,
  primitiveGridClassName,
  primitiveInlineRowClassName,
  primitiveStackClassName,
  primitiveStatusDotClassName,
  primitiveTextClassName,
} from "./classes.js";
import { actionButtonAttrs, joinClassNames, toText, wrapTriggerHostNode } from "./shared.js";
import { frontendDataAttrs } from "#5vbaqj4pirp3";

function primitiveButton(props: ButtonProps) {
  const {
    actionButton,
    actionTrigger,
    active,
    children,
    className,
    icon,
    size,
    tone,
    tooltip,
    transparent,
    variant,
    ...rest
  } = props;
  return wrapTriggerHostNode(
    <FrontendButton
    className={primitiveButtonClassName({
          active,
          className,
          icon,
          size,
          tone,
          tooltip,
          transparent,
          variant,
    })}
    {...frontendDataAttrs({ "active": active ? "true" : undefined })}
    {...actionButtonAttrs(actionButton)}
    {...rest}
    >
    {children}
    </FrontendButton>,
    actionTrigger,
  );
}

function primitiveCard(props: CardProps) {
  const { actionTrigger, children, className, gap, layout, padding, scroll, ...rest } = props;
  return wrapTriggerHostNode(
    <FrontendCard className={primitiveCardClassName({ className, gap, layout, padding, scroll })} {...rest}>
    {children}
    </FrontendCard>,
    actionTrigger,
  );
}

function action_form(props: ActionFormProps) {
  const {
    action,
    body,
    children,
    ignoreResponseAction,
    lifecycle,
    method = "post",
    success,
    successTab,
    ...rest
  } = props;
  return (
    <ActionForm
    {...rest}
    action={action}
    body={body}
    ignoreResponseAction={ignoreResponseAction}
    lifecycle={lifecycle}
    method={method}
    success={success}
    successTab={successTab}
    >
    {children}
    </ActionForm>
  );
}

function csrfInput(props: CsrfInputProps) {
  const value = toText(props.token);
  if (props.optional === true && !value) return null;
  return <input type="hidden" name="_csrf" value={value} />;
}

function avatar(props: AvatarProps) {
  const sizeClass = props.size ? ` ${props.size}` : "";
  if (props.src) {
    return (
      <img
      alt={props.alt}
      className={joinClassNames(`avatar${sizeClass}`, props.className)}
      height={props.height}
      referrerPolicy="no-referrer"
      src={props.src}
      style={props.style}
      width={props.width}
      />
    );
  }
  return (
    <div
    aria-hidden="true"
    className={joinClassNames(`avatar${sizeClass} unknown`, props.className)}
    style={props.style}
    />
  );
}

function pill(props: PillProps) {
  const { children, className, ...rest } = props;
  return (
    <span className={joinClassNames("pill", className)} {...rest}>
    {children}
    </span>
  );
}

function separator(props: SeparatorProps = {}) {
  const orientation = props.orientation === "vertical" ? "vertical" : "horizontal";
  const classNameText = toText(props.className);
  const visible =
  orientation === "vertical" ||
    props.visible === true ||
    /\bui-separator-visible\b/u.test(classNameText);
  if (!visible) return null;
  return (
    <div
    aria-orientation={orientation}
    className={joinClassNames(
        "ui-separator",
        orientation === "vertical" ? "ui-separator-vertical" : "ui-separator-horizontal",
        classNameText,
    )}
    role="separator"
    />
  );
}

function list<T = unknown>(props: list_props<T>) {
  const items = Array.isArray(props.items) ? props.items : [];
  const className = props.className
  ? toText(props.className)
  : primitiveStackClassName({ className: "list", gap: "xs" });
  const itemClassName = toText(props.itemClassName);
  return (
    <div className={className} style={props.style}>
    {items.map((item, index) => (
          <div
          {...((props.getItemProps ? props.getItemProps(item, index) : {}) as any)}
          className={itemClassName || undefined}
          key={props.getKey ? props.getKey(item, index) : `list_item_${index}`}
          >
          {props.renderItem(item, index)}
          </div>
    ))}
    </div>
  );
}

function masonry(props: masonry_props) {
  const { columns, gap, ...attrs } = props;
  const safeColumns = Array.isArray(columns)
  ? columns.filter((column) => column != null && column !== false)
  : [];
  return (
    <div {...attrs} className={primitiveGridClassName({ auto: "lg", className: attrs.className, gap: gap || "sm" })}>
    {safeColumns.map((column, index) => (
          <div className={primitiveStackClassName({ gap: gap || "sm" })} key={`masonry_column_${index}`}>
          {column}
          </div>
    ))}
    </div>
  );
}

function parse_wrapper_attributes(value?: string) {
  const raw = toText(value);
  if (!raw) return {};
  return raw.split(/\s+/).filter(Boolean).reduce((attrs, key) => {
      attrs[key] = "";
      return attrs;
    }, {} as Record<string, string>);
}

function bar(props: bar_props) {
  const percent = Number.isFinite(Number(props.percent))
  ? Math.max(0, Math.min(100, Number(props.percent)))
  : 0;
  const className = props.card === true
  ? primitiveCardClassName({ gap: props.gap || "xs" })
  : primitiveStackClassName({ gap: props.gap || "xs" });
  return (
    <div className={className} hidden={props.hidden === true} {...parse_wrapper_attributes(props.wrapperAttributes)}>
    <div className={primitiveInlineRowClassName({ gap: "xs" })}>
    <span className={primitiveTextClassName({ size: "sm" })} data-progress-meta="">
    {String(props.meta || "")}
    </span>
    <span className={primitiveTextClassName({ muted: true, right: true, size: "sm" })} data-progress-label="">
    {String(props.label || "")}
    </span>
    </div>
    <div
    className="progress"
    data-progress=""
    style={{ ["--progress-percent" as any]: `${percent}%` }}
    >
    <div data-progress-mount="">
    <span data-progress-fill="" style={{ width: `${percent}%` }} />
    </div>
    </div>
    </div>
  );
}

function circle(props: circle_props) {
  return (
    <div
    aria-hidden="true"
    className={`loader-circle ${String(props.size || "md")}`}
    />
  );
}

function status_dot(props: StatusDotProps) {
  return (
    <span
    className={primitiveStatusDotClassName({
          className: props.className,
          size: props.size,
          tone: props.tone,
    })}
    {...(props.ariaHidden !== false ? { "aria-hidden": "true" } : {})}
    {...(props.title ? { title: props.title } : {})}
    />
  );
}

export {
  action_form,
  avatar,
  bar,
  primitiveButton as button,
  primitiveCard as card,
  circle,
  csrfInput,
  list,
  masonry,
  pill,
  separator,
  status_dot,
};
