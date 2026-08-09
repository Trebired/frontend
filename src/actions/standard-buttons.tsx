import { createElement, type ReactNode } from "react";
import { code_block } from "#c55llzkpl4ob";
import { Icon } from "#lbkpzw8nphru";
import { button } from "#6hfutrhvm6x6";
import { actionLabel, type ActionLabelKey } from "./labels.js";
import { copyTargetId } from "./clipboard.js";

type StandardActionButtonProps = {
  button_attrs?: Record<string, unknown>;
  className?: string;
  disabled?: boolean;
  form?: string;
  id?: string;
  lang?: string;
  label?: string;
  type?: "button" | "submit";
};

type CopyButtonProps = {
  attrs?: Record<string, unknown>;
  children?: ReactNode;
  className?: string;
  lang?: string;
  size?: string;
  target: string;
  title?: string;
  tooltip?: string;
  value?: string;
};

type CopyCodeCardProps = {
  className?: string;
  description?: ReactNode;
  id: string;
  label: ReactNode;
  lang?: string;
  value: string;
};

type SaveIconButtonProps = StandardActionButtonProps & {
  dataAttrs?: Record<string, string>;
  tooltip?: string;
  variant?: "classic" | "icon";
};

type RemoveConfirmationProps = {
  confirmText?: string;
  description?: string;
  lang?: string;
  title?: string;
};

const ACTION_META: Record<string, {
  className?: string;
  icon: string;
  key: ActionLabelKey;
  type: "button" | "submit";
}> = {
  add: { icon: "remixicon add-line", key: "add", type: "submit" },
  cancel: { className: "red", icon: "remixicon close-large-line", key: "cancel", type: "button" },
  create: { icon: "remixicon add-line", key: "create", type: "submit" },
  delete: { className: "red", icon: "remixicon delete-bin-line", key: "delete", type: "submit" },
  drop: { className: "red", icon: "remixicon delete-bin-6-line", key: "drop", type: "submit" },
  forceStop: { className: "red", icon: "remixicon stop-circle-fill", key: "forceStop", type: "submit" },
  insert: { icon: "remixicon add-line", key: "insert", type: "submit" },
  install: { icon: "remixicon download-line", key: "install", type: "submit" },
  remove: { className: "red", icon: "remixicon close-large-line", key: "remove", type: "submit" },
  restart: { className: "red", icon: "remixicon restart-line", key: "restart", type: "submit" },
  show: { icon: "remixicon eye-line", key: "show", type: "submit" },
  start: { icon: "remixicon play-line", key: "start", type: "submit" },
  stop: { className: "red", icon: "remixicon stop-circle-line", key: "stop", type: "submit" },
};

function standardActionButton(
  kind: keyof typeof ACTION_META,
  props: StandardActionButtonProps = {},
) {
  const meta = ACTION_META[kind];
  return button({
    type: props.type || meta.type,
    className: props.className || meta.className,
    ...(props.disabled ? { disabled: true } : {}),
    ...(props.form ? { form: props.form } : {}),
    ...(props.id ? { id: props.id } : {}),
    ...(props.button_attrs && typeof props.button_attrs === "object"
      ? props.button_attrs
      : {}),
    children: (
      <>
        <Icon spec={meta.icon} /> {actionLabel(meta.key, props.lang, props.label)}
      </>
    ),
  });
}

function add_button(props: StandardActionButtonProps = {}) {
  return standardActionButton("add", props);
}

function cancel_button(props: StandardActionButtonProps = {}) {
  return standardActionButton("cancel", props);
}

function create_button(props: StandardActionButtonProps = {}) {
  return standardActionButton("create", props);
}

function delete_button(
  props: StandardActionButtonProps & { color?: "red" | "yellow" } = {},
) {
  return standardActionButton("delete", {
    ...props,
    className: props.className || (props.color === "yellow" ? "yellow" : undefined),
  });
}

function drop_button(props: StandardActionButtonProps = {}) {
  return standardActionButton("drop", props);
}

function force_stop_button(props: StandardActionButtonProps = {}) {
  return standardActionButton("forceStop", props);
}

function insert_button(props: StandardActionButtonProps = {}) {
  return standardActionButton("insert", props);
}

function install_button(props: StandardActionButtonProps = {}) {
  return standardActionButton("install", props);
}

function remove_button(props: StandardActionButtonProps = {}) {
  return standardActionButton("remove", props);
}

function restart_button(props: StandardActionButtonProps = {}) {
  return standardActionButton("restart", props);
}

function show_button(props: StandardActionButtonProps = {}) {
  return standardActionButton("show", props);
}

function start_button(
  props: StandardActionButtonProps & { confetti?: boolean } = {},
) {
  return standardActionButton("start", {
    ...props,
    button_attrs: {
      ...(props.button_attrs || {}),
      ...(props.confetti ? { "data-tbf-confetti": "true" } : {}),
    },
  });
}

function stop_button(props: StandardActionButtonProps = {}) {
  return standardActionButton("stop", props);
}

function save_icon(props: SaveIconButtonProps = {}) {
  const variant = props.variant === "classic" ? "classic" : "icon";
  const label = actionLabel("save", props.lang, props.label);
  const saveIcon = <Icon spec="remixicon save-3-line" />;
  return button({
    type: props.type || "submit",
    ...(props.form ? { form: props.form } : {}),
    ...(props.id ? { id: props.id } : {}),
    ...(props.dataAttrs || {}),
    ...(props.disabled ? { disabled: true } : {}),
    className:
      props.className || (variant === "icon" ? "icon lg has-tooltip" : ""),
    ...(variant === "icon" ? { title: String(props.tooltip || label) } : {}),
    children: variant === "icon" ? saveIcon : <>{saveIcon} {label}</>,
  });
}

function copy_button(props: CopyButtonProps) {
  const target = copyTargetId(props.target);
  const tooltip = String(
    props.tooltip || props.title || actionLabel("copy", props.lang),
  ).trim();
  return createElement(
    "copy-button",
    { className: "copy-button-host", style: { display: "contents" } },
    <script data-tbf-copy-config="" hidden type="application/json">
      {JSON.stringify({
        iconOnly: !props.children,
        target,
        ...(typeof props.value === "string" ? { value: props.value } : {}),
      }).replace(/</g, "\\u003c")}
    </script>,
    button({
      type: "button",
      className: props.className || `icon ${String(props.size || "md").trim()} has-tooltip`,
      "aria-controls": target,
      "aria-label": String(props.title || actionLabel("copy", props.lang)),
      ...(props.attrs || {}),
      ...(typeof props.value === "string" ? { value: props.value } : {}),
      title: tooltip,
      children: props.children || <Icon spec="remixicon clipboard-line" />,
    }),
  );
}

function copy_code_card(props: CopyCodeCardProps) {
  const className = ["card column gap-xs", props.className || ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={className}>
      <div className="inline-row gap-xs between" style={{ flexWrap: "wrap" }}>
        <span className="label">{props.label}</span>
        <div className="right">
          {copy_button({
            lang: props.lang,
            size: "sm",
            target: `#${props.id}`,
            value: props.value,
          })}
        </div>
      </div>
      {props.description ? <p className="text-muted">{props.description}</p> : null}
      {code_block({ id: props.id, value: props.value, wrap: true })}
    </div>
  );
}

function removeConfirmationAttrs(props: RemoveConfirmationProps = {}) {
  return {
    "data-tbf-confirm-confirm-text": actionLabel(
      "remove",
      props.lang,
      props.confirmText,
    ),
    "data-tbf-confirm-description": String(props.description || "").trim(),
    "data-tbf-confirm-mode": "classic",
    "data-tbf-confirm-title": actionLabel("removeItem", props.lang, props.title),
  };
}

export {
  add_button,
  cancel_button,
  copy_button,
  copy_code_card,
  create_button,
  delete_button,
  drop_button,
  force_stop_button,
  insert_button,
  install_button,
  remove_button,
  removeConfirmationAttrs,
  restart_button,
  save_icon,
  show_button,
  standardActionButton,
  start_button,
  stop_button,
};
export type {
  CopyButtonProps,
  CopyCodeCardProps,
  RemoveConfirmationProps,
  SaveIconButtonProps,
  StandardActionButtonProps,
};
