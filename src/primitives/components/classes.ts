import { frontendClassName, frontendClassName as ns, frontendClassNames } from "#5vbaqj4pirp3";

import { appendClassName, joinClassNames, toText } from "./shared.js";

type PrimitiveGap = "2xs" | "lg" | "md" | "sm" | "xs" | "xs2";
type PrimitiveButtonSize = "lg" | "md" | "sm";
type PrimitiveStatusTone = "green" | "highlight" | "red" | "yellow";
type PrimitiveButtonTone = PrimitiveStatusTone | "inverse";
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

type PrimitiveInputSize = "lg" | "md" | "sm";
type PrimitiveInputTone = PrimitiveStatusTone;

type PrimitiveInputClassOptions = {
  className?: unknown;
  size?: PrimitiveInputSize;
  tone?: PrimitiveInputTone;
};

type PrimitiveTextareaClassOptions = {
  className?: unknown;
  tone?: PrimitiveInputTone;
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
  return gap ? ns(`gap-${gap}`) : "";
}

function primitivePaddingClass(padding?: PrimitivePadding) {
  return padding ? ns(`padding-${padding}`) : "";
}

function primitiveButtonTone(options: PrimitiveButtonClassOptions) {
  const tone = options.tone || options.variant;
  if (tone === "classic" || tone === "default") return "";
  return tone ? ns(tone) : "";
}

function primitiveButtonClassName(options: PrimitiveButtonClassOptions = {}) {
  return appendClassName(
    frontendClassName("btn"),
    options.icon ? frontendClassName("icon") : "",
    options.size ? ns(options.size) : "",
    primitiveButtonTone(options),
    options.active ? frontendClassName("active") : "",
    options.icon && options.tooltip ? frontendClassName("has-tooltip") : "",
    options.transparent ? frontendClassName("transparent") : "",
    options.className,
  );
}

function primitiveInputClassName(options: PrimitiveInputClassOptions = {}) {
  return appendClassName(
    frontendClassNames("input", "classic"),
    options.size ? ns(options.size) : "",
    options.tone ? ns(options.tone) : "",
    options.className,
  );
}

function primitiveTextareaClassName(options: PrimitiveTextareaClassOptions = {}) {
  return appendClassName(
    frontendClassNames("textarea", "classic"),
    options.tone ? ns(options.tone) : "",
    options.className,
  );
}

function primitiveStackClassName(options: PrimitiveStackClassOptions = {}) {
  return joinClassNames(
    frontendClassName("column"),
    primitiveGapClass(options.gap),
    options.center ? frontendClassName("center") : "",
    options.horizontalCenter ? frontendClassName("hor-center") : "",
    options.verticalCenter ? frontendClassName("ver-center") : "",
    options.grow ? frontendClassName("grow") : "",
    options.noShrink ? frontendClassName("no-shrink") : "",
    options.className,
  );
}

function primitiveInlineRowClassName(options: PrimitiveInlineRowClassOptions = {}) {
  return joinClassNames(
    frontendClassName("inline-row"),
    primitiveGapClass(options.gap),
    options.apart ? frontendClassName("apart") : "",
    options.between ? frontendClassName("between") : "",
    options.fit ? frontendClassName("fit-content") : "",
    options.noShrink ? frontendClassName("no-shrink") : "",
    options.noStretch ? frontendClassName("no-stretch") : "",
    options.top ? frontendClassName("top") : "",
    options.verticalCenter ? frontendClassName("ver-center") : "",
    options.wrap ? frontendClassName("wrap") : "",
    options.className,
  );
}

function primitiveGridClassName(options: PrimitiveGridClassOptions = {}) {
  return joinClassNames(
    frontendClassName("grid"),
    options.auto ? ns(`auto-${options.auto}`) : "",
    options.columns ? ns(`cols-${options.columns}`) : "",
    primitiveGapClass(options.gap),
    options.className,
  );
}

function primitiveCardClassName(options: PrimitiveCardClassOptions = {}) {
  const { className, ...stackOptions } = options;
  const usesStackLayout = options.layout === "column" ||
    Boolean(options.gap || options.center || options.horizontalCenter || options.verticalCenter || options.grow || options.noShrink);
  return joinClassNames(
    frontendClassName("card"),
    options.layout === "none" || !usesStackLayout ? "" : primitiveStackClassName(stackOptions),
    primitivePaddingClass(options.padding),
    options.scroll ? frontendClassNames("scroll", "scroll-min") : "",
    className,
  );
}

function primitiveCardRowClassName(options: PrimitiveCardRowClassOptions = {}) {
  return joinClassNames(
    frontendClassName("card-row"),
    options.selected ? frontendClassName("selected") : "",
    options.excluded ? frontendClassName("excluded") : "",
    options.className,
  );
}

function primitiveTextClassName(options: PrimitiveTextClassOptions = {}) {
  return joinClassNames(
    options.muted ? frontendClassName("text-muted") : "",
    options.size ? ns(`text-${options.size}`) : "",
    options.breakWord ? frontendClassName("text-break") : "",
    options.truncate ? frontendClassName("truncate-1") : "",
    options.widthFit ? frontendClassName("width-fit") : "",
    options.right ? frontendClassName("right") : "",
    options.className,
  );
}

function primitiveStatusDotClassName(options: {
    className?: unknown;
    size?: string;
    tone?: string;
  } = {}) {
  return joinClassNames(
    frontendClassName("dot"),
    ns(`dot-${toText(options.size, "md").toLowerCase()}`),
    ns(toText(options.tone, "gray").toLowerCase()),
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
  primitiveInputClassName,
  primitivePaddingClass,
  primitiveStackClassName,
  primitiveStatusDotClassName,
  primitiveTextareaClassName,
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
  PrimitiveInputClassOptions,
  PrimitiveInputSize,
  PrimitiveInputTone,
  PrimitivePadding,
  PrimitiveStackClassOptions,
  PrimitiveTextareaClassOptions,
  PrimitiveTextClassOptions,
  PrimitiveTextSize,
};
