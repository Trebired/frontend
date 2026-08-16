type NamespaceValue = string | number | boolean;
type DataAttrsInput = Record<string, NamespaceValue|null|undefined>;
type DataAttrsOutput = Record<string, NamespaceValue|null|undefined>;

const NAMESPACE_PREFIX = "tbf";

function namespaceName(name: string): string {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) throw new Error("namespace name must be a non-empty string");
  return normalizedName;
}

function prefixedName(name: string): string {
  const normalizedName = namespaceName(name);
  return NAMESPACE_PREFIX ? `${NAMESPACE_PREFIX}-${normalizedName}` : normalizedName;
}

function selectorValue(value: NamespaceValue): string {
  return String(value).replace(/\\/gu, "\\\\").replace(/"/gu, "\\\"");
}

function className(name: string): string {
  return prefixedName(name);
}

function elementClass(block: string, element: string): string {
  return `${prefixedName(block)}__${namespaceName(element)}`;
}

function modifierClass(block: string, modifier: string): string {
  return `${prefixedName(block)}--${namespaceName(modifier)}`;
}

function dataAttr(name: string): string {
  return `data-${prefixedName(name)}`;
}

function dataAttrs(input: DataAttrsInput): DataAttrsOutput {
  return Object.fromEntries(
    Object.entries(input).map(([name, value]) => [dataAttr(name), value]),
  );
}

function dataSelector(name: string, value?: NamespaceValue): string {
  const attr = dataAttr(name);
  return value === undefined ? `[${attr}]` : `[${attr}=\"${selectorValue(value)}\"]`;
}

function cssVar(name: string): string {
  return `--${prefixedName(name)}`;
}

function cssVarRef(name: string, fallback?: string): string {
  const variable = `var(${cssVar(name)}`;
  return fallback === undefined ? `${variable})` : `${variable}, ${fallback})`;
}

function token(name: string): string {
  return prefixedName(name);
}

function eventName(name: string): string {
  const normalizedName = namespaceName(name);
  return NAMESPACE_PREFIX ? `${NAMESPACE_PREFIX}:${normalizedName}` : normalizedName;
}

export {
  NAMESPACE_PREFIX,
  className,
  cssVar,
  cssVarRef,
  dataAttr,
  dataAttrs,
  dataSelector,
  elementClass,
  eventName,
  modifierClass,
  token,
};
