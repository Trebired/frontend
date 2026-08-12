import { createElement, useEffect, useMemo, useRef } from "react";
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

type IconProps = Omit<HTMLAttributes<HTMLElement>, "color"> & {
  color?: string;
  endpoint?: string;
  label?: string;
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
      "--tbf-icon-color": props.color,
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
    name: _name,
    pack: _pack,
    spec: _spec,
    tag = "i",
    title,
    ...rest
  } = props;
  const ref = useRef<Element | null>(null);
  const resolvedSpec = resolveSpec(props);
  const parsed = parseIconSpec(resolvedSpec);
  const normalizedSpec = parsed ? parsed.spec : normalizeSpace(resolvedSpec);
  const cacheEntry = resolveIconCache(normalizedSpec);
  const svgMarkup = text(cacheEntry?.svg);
  const colorMode = text(cacheEntry?.colorMode);
  const colorValue = text(cacheEntry?.colorValue);

  useEffect(() => {
      if (!ref.current || !normalizedSpec) return undefined;
      void renderIconElement(ref.current, normalizedSpec, { color, endpoint });
      return undefined;
    }, [color, endpoint, normalizedSpec]);

  const elementProps = useMemo(() => {
      const hidden = label || rest["aria-label"] ? undefined : "true";
      const out: Record<string, unknown> = {
        ...rest,
        "aria-hidden": rest["aria-hidden"] ?? hidden,
        "aria-label": rest["aria-label"] || label || undefined,
        className: classNames("tbf-icon", "icon-glyph", className),
        "data-tbf-icon": normalizedSpec || undefined,
        ref,
        style: resolveStyle({ ...props, color }, colorMode, colorValue),
        title,
      };
      if (svgMarkup) {
        out.dangerouslySetInnerHTML = {
          __html: color ? applySvgColor(svgMarkup, color) : svgMarkup,
        };
      }
      return out;
    }, [className, color, colorMode, colorValue, label, normalizedSpec, props, rest, svgMarkup, title]);

  return createElement(tag, elementProps);
}

export { Icon };
export type { IconProps };
export default Icon;
