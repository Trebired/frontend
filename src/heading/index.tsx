import { createContext, type HTMLAttributes, type ReactNode } from "react";

type HeadingLevel = 2 | 3 | 4 | 5 | 6;

type TitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children?: ReactNode;
  level?: HeadingLevel;
};

type HeadingScopeProps = {
  children?: ReactNode;
  depth?: number;
};

const PAGE_DEPTH = 0;
const MIN_LEVEL = 3;
const MAX_LEVEL = 6;

const HeadingDepthContext = createContext<number>(PAGE_DEPTH);

function headingLevelForDepth(depth: number): HeadingLevel {
  const level = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, 2 + Math.max(0, Math.floor(depth))));
  return level as HeadingLevel;
}

function explicitLevel(value: unknown): HeadingLevel | null {
  const level = Number(value);
  return Number.isInteger(level) && level >= 2 && level <= MAX_LEVEL ? level as HeadingLevel : null;
}

function renderHeading(level: HeadingLevel, props: TitleProps) {
  const { children, level: _level, ...rest } = props;
  const Tag = `h${level}` as const;
  return <Tag {...rest}>{children}</Tag>;
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
