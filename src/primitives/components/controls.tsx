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
import { actionButtonAttrs, appendClassName, joinClassNames, toText, wrapTriggerHostNode } from "./shared.js";

function buttonClassName(className: unknown, variant?: ButtonProps["variant"]) {
  return appendClassName("btn", variant === "solid" ? "solid" : "", className);
}

function button(props: ButtonProps) {
  const { actionButton, actionTrigger, children, className, variant, ...rest } = props;
  return wrapTriggerHostNode(
    <FrontendButton className={buttonClassName(className, variant)} {...actionButtonAttrs(actionButton)} {...rest}>
      {children}
    </FrontendButton>,
    { action: actionTrigger },
  );
}

function card(props: CardProps) {
  const { actionTrigger, children, className, ...rest } = props;
  return wrapTriggerHostNode(
    <FrontendCard className={className} {...rest}>
      {children}
    </FrontendCard>,
    { action: actionTrigger },
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
  const className = toText(props.className, "list column gap-xs");
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
  const { columns, ...attrs } = props;
  const safeColumns = Array.isArray(columns)
    ? columns.filter((column) => column != null && column !== false)
    : [];
  return (
    <div {...attrs} className="grid gap-sm auto-lg">
      {safeColumns.map((column, index) => (
        <div className="column gap-sm" key={`masonry_column_${index}`}>
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
  const className = props.card === true ? "card column gap-xs" : "column gap-xs";
  return (
    <div className={className} hidden={props.hidden === true} {...parse_wrapper_attributes(props.wrapperAttributes)}>
      <div className="inline-row gap-xs">
        <span className="text-sm" data-progress-meta="">
          {String(props.meta || "")}
        </span>
        <span className="text-sm text-muted right" data-progress-label="">
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
  const tone = toText(props.tone, "gray").toLowerCase() || "gray";
  const size = toText(props.size, "md").toLowerCase() || "md";
  return (
    <span
      className={joinClassNames("dot", `dot-${size}`, tone, props.className)}
      {...(props.ariaHidden !== false ? { "aria-hidden": "true" } : {})}
      {...(props.title ? { title: props.title } : {})}
    />
  );
}

export {
  action_form,
  avatar,
  bar,
  button,
  card,
  circle,
  csrfInput,
  list,
  masonry,
  pill,
  separator,
  status_dot,
};
