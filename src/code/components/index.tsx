import { createElement, type ReactNode } from "react";
import { appendClassName, joinClassNames } from "#6mupcizo1mwq";

type CodeBlockProps = {
  children?: ReactNode;
  className?: string;
  codeClassName?: string;
  codeProps?: Record<string, unknown>;
  id?: string;
  language?: string;
  preProps?: Record<string, unknown>;
  scroll?: boolean;
  value?: ReactNode;
  wrap?: boolean;
};

type CodeTextProps = {
  children?: ReactNode;
  className?: string;
  tag?: "pre" | "span";
  [key: string]: unknown;
};

function code_block(props: CodeBlockProps) {
  const scroll = props.scroll !== false;
  const wrap = props.wrap === true;
  const content = props.value != null ? props.value : props.children;
  const preProps = objectProps(props.preProps);
  const codeProps = objectProps(props.codeProps);
  return createElement(
    "code-block",
    {
      "data-tbf-code-block": "",
      "data-tbf-code-lang": props.language || undefined,
      style: { display: "contents" },
    },
    <pre
      className={joinClassNames(
        "code-block card padding-xs bg-canvas",
        scroll ? "scroll scroll-min" : "",
        props.className,
      )}
      data-code=""
      {...preProps}
    >
      <code
        {...(props.id ? { id: String(props.id) } : {})}
        className={joinClassNames(wrap ? "pre-wrap" : "", props.codeClassName)}
        data-tbf-code-content=""
        {...codeProps}
      >
        {content}
      </code>
    </pre>,
  );
}

function CodeBlock(props: CodeBlockProps) {
  return code_block(props);
}

function code_text(props: CodeTextProps) {
  const { children, className, tag = "pre", ...rest } = props;
  return createElement(
    tag,
    { className: appendClassName("code", className), ...rest },
    children,
  );
}

function CodeText(props: CodeTextProps) {
  return code_text(props);
}

function objectProps(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export { CodeBlock, CodeText, code_block, code_text };
export type { CodeBlockProps, CodeTextProps };
