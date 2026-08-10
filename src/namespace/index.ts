import { FRONTEND_PREFIX } from "./generated.js";

function prefixedName(name: string): string {
  const normalized = String(name || "").trim();
  if (!normalized) throw new Error("frontend namespace name must be non-empty");
  return FRONTEND_PREFIX ? `${FRONTEND_PREFIX}-${normalized}` : normalized;
}

function frontendClassName(name: string): string {
  return prefixedName(name);
}

function frontendDataAttr(name: string): string {
  return `data-${prefixedName(name)}`;
}

function frontendDataSelector(name: string): string {
  return `[${frontendDataAttr(name)}]`;
}

function frontendCssVar(name: string): string {
  return `--${prefixedName(name)}`;
}

export {
  FRONTEND_PREFIX,
  frontendClassName,
  frontendCssVar,
  frontendDataAttr,
  frontendDataSelector,
};
