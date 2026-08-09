import type { HTMLAttributes, ReactNode } from "react";
import {
  primitiveGridClassName,
  primitiveInlineRowClassName,
  primitiveStackClassName,
  primitiveTextClassName,
  type PrimitiveGridClassOptions,
  type PrimitiveInlineRowClassOptions,
  type PrimitiveStackClassOptions,
  type PrimitiveTextClassOptions,
  type PrimitiveTextSize,
} from "./classes.js";

type StackProps = HTMLAttributes<HTMLDivElement> &
  Omit<PrimitiveStackClassOptions, "className">;

type InlineRowProps = HTMLAttributes<HTMLDivElement> &
  Omit<PrimitiveInlineRowClassOptions, "className">;

type GridProps = HTMLAttributes<HTMLDivElement> &
  Omit<PrimitiveGridClassOptions, "className">;

type TextProps = HTMLAttributes<HTMLSpanElement> &
  Omit<PrimitiveTextClassOptions, "className"> & {
    as?: "p" | "span" | "strong";
  };

type TitleDescriptionProps = Omit<StackProps, "title"> & {
  description?: ReactNode;
  descriptionSize?: PrimitiveTextSize;
  level?: 2 | 3 | 4;
  title: ReactNode;
};

function Stack(props: StackProps) {
  const { center, children, className, gap, grow, horizontalCenter, noShrink, verticalCenter, ...rest } = props;
  return (
    <div
      {...rest}
      className={primitiveStackClassName({
        center,
        className,
        gap,
        grow,
        horizontalCenter,
        noShrink,
        verticalCenter,
      })}
    >
      {children}
    </div>
  );
}

function InlineRow(props: InlineRowProps) {
  const { apart, between, children, className, fit, gap, noShrink, noStretch, top, verticalCenter, wrap, ...rest } = props;
  return (
    <div
      {...rest}
      className={primitiveInlineRowClassName({
        apart,
        between,
        className,
        fit,
        gap,
        noShrink,
        noStretch,
        top,
        verticalCenter,
        wrap,
      })}
    >
      {children}
    </div>
  );
}

function Grid(props: GridProps) {
  const { auto, children, className, columns, gap, ...rest } = props;
  return (
    <div {...rest} className={primitiveGridClassName({ auto, className, columns, gap })}>
      {children}
    </div>
  );
}

function Text(props: TextProps) {
  const {
    as = "span",
    breakWord,
    children,
    className,
    muted,
    right,
    size,
    truncate,
    widthFit,
    ...rest
  } = props;
  const classNameText = primitiveTextClassName({
    breakWord,
    className,
    muted,
    right,
    size,
    truncate,
    widthFit,
  });
  if (as === "p") return <p {...(rest as HTMLAttributes<HTMLParagraphElement>)} className={classNameText}>{children}</p>;
  if (as === "strong") return <strong {...(rest as HTMLAttributes<HTMLElement>)} className={classNameText}>{children}</strong>;
  return <span {...rest} className={classNameText}>{children}</span>;
}

function TitleDescription(props: TitleDescriptionProps) {
  const { children, className, description, descriptionSize, gap = "sm", level = 3, title, ...rest } = props;
  const Heading = `h${level}` as "h2" | "h3" | "h4";
  return (
    <Stack {...rest} className={className} gap={gap}>
      <Heading>{title}</Heading>
      {description ? <Text as="p" muted size={descriptionSize}>{description}</Text> : null}
      {children}
    </Stack>
  );
}

export { Grid, InlineRow, Stack, Text, TitleDescription };
export type {
  GridProps,
  InlineRowProps,
  StackProps,
  TextProps,
  TitleDescriptionProps,
};
