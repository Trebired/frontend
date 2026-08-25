import { appendClassName, joinClassNames, toText } from "./shared.js";

type PrimitiveGap = "2xs" | "lg" | "md" | "sm" | "xs" | "xs2";
type PrimitiveButtonSize = "lg" | "md" | "sm";
type PrimitiveButtonTone = "green" | "highlight" | "red" | "yellow";
type PrimitiveTextSize = "lg" | "md" | "sm" | "xs";
type PrimitiveGridAuto = "lg" | "md" | "sm";
type PrimitivePadding = "lg" | "md" | "sm" | "xs";

type PrimitiveButtonClassOptions = {
  active?: boolean;
  className?: unknown;
  icon?: boolean;
  size?: PrimitiveButtonSize;
  tone?: PrimitiveButtonTone;
  tooltip?: boolean | string;
  transparent?: boolean;
  variant?: PrimitiveButtonTone | "classic" | "default";
};

type PrimitiveStackClassOptions = {
  center?: boolean;
  className?: unknown;
  gap?: PrimitiveGap;
  grow?: boolean;
  horizontalCenter?: boolean;
  noShrink?: boolean;
  verticalCenter?: boolean;
};

type PrimitiveInlineRowClassOptions = {
  apart?: boolean;
  between?: boolean;
  className?: unknown;
  fit?: boolean;
  gap?: PrimitiveGap;
  noShrink?: boolean;
  noStretch?: boolean;
  top?: boolean;
  verticalCenter?: boolean;
  wrap?: boolean;
};

type PrimitiveGridClassOptions = {
  auto?: PrimitiveGridAuto;
  className?: unknown;
  columns?: 2;
  gap?: PrimitiveGap;
};

type PrimitiveCardClassOptions = PrimitiveStackClassOptions& {
  layout?: "column" | "none";
  padding?: PrimitivePadding;
  scroll?: boolean;
};

type PrimitiveCardRowClassOptions = {
  className?: unknown;
  excluded?: boolean;
  selected?: boolean;
};

type PrimitiveTextClassOptions = {
  breakWord?: boolean;
  className?: unknown;
  muted?: boolean;
  right?: boolean;
  size?: PrimitiveTextSize;
  truncate?: boolean;
  widthFit?: boolean;
};

function primitiveGapClass(gap?: PrimitiveGap) {
  return gap ? `gap-${gap}` : "";
}

function primitivePaddingClass(padding?: PrimitivePadding) {
  return padding ? `padding-${padding}` : "";
}

function primitiveButtonTone(options: PrimitiveButtonClassOptions) {
  const tone = options.tone || options.variant;
  if (tone === "classic" || tone === "default") return "";
  return tone || "";
}

function primitiveButtonClassName(options: PrimitiveButtonClassOptions = {}) {
  return appendClassName(
    "btn",
    options.icon ? "icon" : "",
    options.size,
    primitiveButtonTone(options),
    options.active ? "active" : "",
    options.icon && options.tooltip ? "has-tooltip" : "",
    options.transparent ? "transparent" : "",
    options.className,
  );
}

function primitiveStackClassName(options: PrimitiveStackClassOptions = {}) {
  return joinClassNames(
    "column",
    primitiveGapClass(options.gap),
    options.center ? "center" : "",
    options.horizontalCenter ? "hor-center" : "",
    options.verticalCenter ? "ver-center" : "",
    options.grow ? "grow" : "",
    options.noShrink ? "no-shrink" : "",
    options.className,
  );
}

function primitiveInlineRowClassName(options: PrimitiveInlineRowClassOptions = {}) {
  return joinClassNames(
    "inline-row",
    primitiveGapClass(options.gap),
    options.apart ? "apart" : "",
    options.between ? "between" : "",
    options.fit ? "fit-content" : "",
    options.noShrink ? "no-shrink" : "",
    options.noStretch ? "no-stretch" : "",
    options.top ? "top" : "",
    options.verticalCenter ? "ver-center" : "",
    options.wrap ? "wrap" : "",
    options.className,
  );
}

function primitiveGridClassName(options: PrimitiveGridClassOptions = {}) {
  return joinClassNames(
    "grid",
    options.auto ? `auto-${options.auto}` : "",
    options.columns ? `cols-${options.columns}` : "",
    primitiveGapClass(options.gap),
    options.className,
  );
}

function primitiveCardClassName(options: PrimitiveCardClassOptions = {}) {
  const { className, ...stackOptions } = options;
  const usesStackLayout = options.layout === "column" ||
    Boolean(options.gap || options.center || options.horizontalCenter || options.verticalCenter || options.grow || options.noShrink);
  return joinClassNames(
    "card",
    options.layout === "none" || !usesStackLayout ? "" : primitiveStackClassName(stackOptions),
    primitivePaddingClass(options.padding),
    options.scroll ? "scroll scroll-min" : "",
    className,
  );
}

function primitiveCardRowClassName(options: PrimitiveCardRowClassOptions = {}) {
  return joinClassNames(
    "card-row",
    options.selected ? "selected" : "",
    options.excluded ? "excluded" : "",
    options.className,
  );
}

function primitiveTextClassName(options: PrimitiveTextClassOptions = {}) {
  return joinClassNames(
    options.muted ? "text-muted" : "",
    options.size ? `text-${options.size}` : "",
    options.breakWord ? "text-break" : "",
    options.truncate ? "truncate-1" : "",
    options.widthFit ? "width-fit" : "",
    options.right ? "right" : "",
    options.className,
  );
}

function primitiveStatusDotClassName(options: {
    className?: unknown;
    size?: string;
    tone?: string;
  } = {}) {
  return joinClassNames(
    "dot",
    `dot-${toText(options.size, "md").toLowerCase()}`,
    toText(options.tone, "gray").toLowerCase(),
    options.className,
  );
}

export {
  primitiveButtonClassName,
  primitiveCardClassName,
  primitiveCardRowClassName,
  primitiveGapClass,
  primitiveGridClassName,
  primitiveInlineRowClassName,
  primitivePaddingClass,
  primitiveStackClassName,
  primitiveStatusDotClassName,
  primitiveTextClassName,
};
export type {
  PrimitiveButtonClassOptions,
  PrimitiveButtonSize,
  PrimitiveButtonTone,
  PrimitiveCardClassOptions,
  PrimitiveCardRowClassOptions,
  PrimitiveGap,
  PrimitiveGridAuto,
  PrimitiveGridClassOptions,
  PrimitiveInlineRowClassOptions,
  PrimitivePadding,
  PrimitiveStackClassOptions,
  PrimitiveTextClassOptions,
  PrimitiveTextSize,
};
