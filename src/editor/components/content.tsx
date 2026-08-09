import { createElement, type ReactNode } from "react";
import { card } from "#6hfutrhvm6x6";
import { Text, primitiveStackClassName } from "#hzrmwbvgt2ax";
import type { EditorContentProps, EditorSidebarProps } from "./types.js";

function editor_content(props: EditorContentProps) {
  const className = String(props.className || primitiveStackClassName({ gap: "sm", grow: true })).trim();
  const minHeight = resolvedMinHeight(props.minHeight);
  const surfaceClassName = String(
    props.surfaceClassName || "border radius-md overflow-hidden bg-canvas grow",
  ).trim();
  return (
    <div className={className}>
      {cardHeader(props.title, props.description)}
      <div className={surfaceClassName} style={surfaceStyle(props, minHeight)}>
        {editor_content_body(props, minHeight)}
      </div>
    </div>
  );
}

function editor_content_body(props: EditorContentProps, minHeight: number) {
  if (props.body !== undefined) return props.body;
  const value = props.value == null ? props.defaultValue || "" : props.value;
  return createElement(
    "editor-content-field",
    { "data-tbf-editor-content-field": "" },
    <>
      <script data-tbf-editor-content-config="" hidden type="application/json">
        {JSON.stringify({
          language: props.language || "json",
          path: props.path || `${props.name || "value"}.json`,
          placeholder: props.placeholder || "",
          readOnly: props.readonly || props.disabled ? true : false,
        })}
      </script>
      <textarea
        defaultValue={value}
        disabled={props.disabled}
        hidden
        name={props.name || undefined}
      />
      <div className="width-max" style={{ minHeight }} />
    </>,
  );
}

function editor_sidebar(props: EditorSidebarProps) {
  const className = String(props.className || primitiveStackClassName({ gap: "sm", noShrink: true })).trim();
  return (
    <div className={className} style={props.style}>
      {cardHeader(props.title, props.description)}
      {props.children}
    </div>
  );
}

function cardHeader(title: ReactNode, description?: ReactNode) {
  return card({
    gap: "xs",
    children: (
      <>
        <strong>{title}</strong>
        {description ? (
          <Text breakWord muted size="sm">{description}</Text>
        ) : null}
      </>
    ),
  });
}

function surfaceStyle(props: EditorContentProps, minHeight: number) {
  return props.body === undefined
    ? { minHeight, ...(props.surfaceStyle || {}) }
    : props.surfaceStyle;
}

function resolvedMinHeight(value: unknown) {
  return Number.isFinite(value) ? Number(value) : 260;
}

export { cardHeader, editor_content, editor_content_body, editor_sidebar };
