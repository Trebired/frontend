import { createElement } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

import {
  classNames,
  normalizeSpace,
  parseIconSpec,
  text,
} from "#bu1nq95e3k0f";
import { readIconCacheEntry, renderIconElement } from "#e55z7pkijewq";
import { applySvgColor } from "#bu1nq95e3k0f";
import { getActiveIconServerRenderer } from "#6o6fqz7svsts";
import { frontendClassName, frontendCssVar, frontendDataAttr } from "#5vbaqj4pirp3";
import type { IconRuntimeMode } from "#e55z7pkijewq";

type IconProps = Omit<HTMLAttributes<HTMLElement>, "color"> & {
  color?: string;
  endpoint?: string;
  label?: string;
  mode?: IconRuntimeMode;
  name?: string;
  pack?: string;
  spec?: string;
  tag?: "i" | "span" | "div";
  title?: string;
};

function resolveSpec(props: IconProps): string {
  if (props.spec) return normalizeSpace(props.spec);
  if (props.pack && props.name) return `${props.pack}:${props.name}`;
  if (props.name) return normalizeSpace(props.name);
  return "";
}

function resolveStyle(
  props: IconProps,
  colorMode: string,
  colorValue: string,
): CSSProperties | undefined {
  const base = props.style && typeof props.style === "object" ? { ...props.style } : {};
  if (props.color) {
    return {
      ...base,
      "--icon-custom-color": props.color,
      [frontendCssVar("icon-color")]: props.color,
    } as CSSProperties;
  }
  if (colorMode === "brand" && colorValue) return { ...base, color: colorValue };
  return Object.keys(base).length ? base : undefined;
}

function resolveIconCache(normalizedSpec: string) {
  const serverRenderer = getActiveIconServerRenderer();
  const serverEntry = normalizedSpec && serverRenderer ? serverRenderer(normalizedSpec) : null;
  const browserEntry = normalizedSpec ? readIconCacheEntry(normalizedSpec) : null;
  return serverEntry || browserEntry;
}

function Icon(props: IconProps) {
  const {
    className,
    color,
    endpoint,
    label,
    mode,
    name: _name,
    pack: _pack,
    spec: _spec,
    tag = "i",
    title,
    ...rest
  } = props;
  const resolvedSpec = resolveSpec(props);
  const parsed = parseIconSpec(resolvedSpec);
  const normalizedSpec = parsed ? parsed.spec : normalizeSpace(resolvedSpec);
  const cacheEntry = resolveIconCache(normalizedSpec);
  const svgMarkup = text(cacheEntry?.svg);
  const colorMode = text(cacheEntry?.colorMode);
  const colorValue = text(cacheEntry?.colorValue);
  const hidden = label || rest["aria-label"] ? undefined : "true";
  const elementProps: Record<string, unknown> = {
    ...rest,
    "aria-hidden": rest["aria-hidden"] ?? hidden,
    "aria-label": rest["aria-label"] || label || undefined,
    className: classNames(frontendClassName("icon"), "icon-glyph", className),
    [frontendDataAttr("icon")]: normalizedSpec || undefined,
    ref: (element: Element | null) => {
      if (!element || !normalizedSpec) return;
      void renderIconElement(element, normalizedSpec, { color, endpoint, mode });
    },
    style: resolveStyle({ ...props, color }, colorMode, colorValue),
    title,
  };
  if (svgMarkup) {
    elementProps.dangerouslySetInnerHTML = {
      __html: color ? applySvgColor(svgMarkup, color) : svgMarkup,
    };
  }

  return createElement(tag, elementProps);
}

export { Icon };
export type { IconProps };
export default Icon;
