import { createContext, isValidElement, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { FRONTEND_PREFIX } from "./../namespace/index.js";
import { titleFitVars } from "./glyphs.js";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type TitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children?: ReactNode;
  fit?: boolean;
  level?: HeadingLevel;
  text?: string;
};

type HeadingScopeProps = {
  children?: ReactNode;
  depth?: number;
};

const PAGE_DEPTH = 0;
const MIN_LEVEL = 2;
const MAX_LEVEL = 6;

const HeadingDepthContext = createContext<number>(PAGE_DEPTH);

function headingLevelForDepth(depth: number): HeadingLevel {
  const level = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, 1 + Math.max(0, Math.floor(depth))));
  return level as HeadingLevel;
}

function explicitLevel(value: unknown): HeadingLevel | null {
  const level = Number(value);
  return Number.isInteger(level) && level >= 1 && level <= MAX_LEVEL ? level as HeadingLevel : null;
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function renderHeading(level: HeadingLevel, props: TitleProps) {
  const { children, className, fit = true, level: _level, style, text, ...rest } = props;
  const Tag = `h${level}` as const;
  const vars = fit ? titleFitVars(text ?? textOf(children)) : null;
  if (!vars) return <Tag className={className} style={style} {...rest}>{children}</Tag>;
  const classes = [`${FRONTEND_PREFIX}-title`, className].filter(Boolean).join(" ");
  return (
    <Tag className={classes} style={{ ...style, ...vars } as CSSProperties} {...rest}>
    <span className={`${FRONTEND_PREFIX}-title__fit`}>{children}</span>
    </Tag>
  );
}

function Title(props: TitleProps) {
  const fixed = explicitLevel(props.level);
  if (fixed) return renderHeading(fixed, props);
  return (
    <HeadingDepthContext.Consumer>
    {(depth) => renderHeading(headingLevelForDepth(depth), props)}
    </HeadingDepthContext.Consumer>
  );
}

function HeadingScope(props: HeadingScopeProps) {
  if (typeof props.depth === "number") {
    return <HeadingDepthContext.Provider value={props.depth}>{props.children}</HeadingDepthContext.Provider>;
  }
  return (
    <HeadingDepthContext.Consumer>
    {(depth) => <HeadingDepthContext.Provider value={depth + 1}>{props.children}</HeadingDepthContext.Provider>}
    </HeadingDepthContext.Consumer>
  );
}

function HeadingDepth(props: { children: (depth: number) => ReactNode }) {
  return <HeadingDepthContext.Consumer>{props.children}</HeadingDepthContext.Consumer>;
}

export { HeadingDepth, HeadingScope, Title, headingLevelForDepth };
export type { HeadingLevel, HeadingScopeProps, TitleProps };
