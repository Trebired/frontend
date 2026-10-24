import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendCssVar, frontendModifierClass } from "#5vbaqj4pirp3";
import { bindHollowBitmaps } from "./bitmap.js";
import { hollowPrint, type HollowPrint } from "./print.js";

type HollowTag = "h1" | "h2" | "h3" | "h4" | "li" | "p" | "span" | "strong";

type HollowTextProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  as?: HollowTag;
  children: number | string;
  dark?: boolean;
  inks?: readonly [string, string];
};

const PaletteContext = createContext<readonly string[]>([]);

function HollowPalette({ children, tones }: { children: ReactNode; tones: readonly string[] }) {
  return <PaletteContext.Provider value={tones}>{children}</PaletteContext.Provider>;
}

function urlsOf(print: HollowPrint, ink: 0 | 1, images?: readonly string[]): string {
  return print.layers
  .map((layer, index) => (layer.ink === ink ? `url("${images?.[index] ?? layer.image.slice(5, -2)}")` : ""))
  .filter(Boolean)
  .join(", ");
}

function positionsOf(print: HollowPrint, ink: 0 | 1): string {
  return print.layers.filter((layer) => layer.ink === ink).map((layer) => `${layer.offset[0]}em ${layer.offset[1]}em`).join(", ");
}

function hollowStyle(print: HollowPrint): CSSProperties {
  const [first, second] = print.inks;
  return {
    [frontendCssVar("hollow-a")]: urlsOf(print, 0),
    [frontendCssVar("hollow-a-at")]: positionsOf(print, 0),
    [frontendCssVar("hollow-a-dark")]: first.dark,
    [frontendCssVar("hollow-a-light")]: first.light,
    [frontendCssVar("hollow-b")]: urlsOf(print, 1),
    [frontendCssVar("hollow-b-at")]: positionsOf(print, 1),
    [frontendCssVar("hollow-b-dark")]: second.dark,
    [frontendCssVar("hollow-b-light")]: second.light,
    [frontendCssVar("hollow-size")]: `${print.width}em 1lh`,
  } as CSSProperties;
}

function HollowText(props: HollowTextProps) {
  const { as: Tag = "span", children, className, dark, inks, style, ...rest } = props;
  const text = String(children);
  const palette = useContext(PaletteContext);
  const print = useMemo(() => hollowPrint(text, inks, palette), [inks?.[0], inks?.[1], palette, text]);
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => (ref.current ? bindHollowBitmaps(ref.current, print, (images, ink) => urlsOf(print, ink, images)) : undefined), [print]);
  return (
    <Tag
    {...rest}
    className={classNames(
        frontendClassName("hollow"),
        frontendClassName("text-outline"),
        dark ? frontendModifierClass("hollow", "dark") : "",
        className,
    )}
    data-hollow={text}
    ref={ref as never}
    style={{ ...hollowStyle(print), ...style }}
    >
    {text}
    </Tag>
  );
}

export { HollowPalette, HollowText, hollowStyle };
export type { HollowTag, HollowTextProps };
