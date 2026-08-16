import {
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
} from "./generated.js";
import { frontendCssTokenName } from "./css-var.js";

type FrontendNamespaceValue = string | number | boolean;
type FrontendCssVarName = `--${string}`;
type FrontendDataAttrName = `data-${string}`;
type FrontendDataAttrs = Record<FrontendDataAttrName, FrontendNamespaceValue|null|undefined>;

const FRONTEND_PREFIX = NAMESPACE_PREFIX;

function frontendClassName(name: string): string {
  return className(name);
}

function frontendElementClass(block: string, element: string): string {
  return elementClass(block, element);
}

function frontendModifierClass(block: string, modifier: string): string {
  return modifierClass(block, modifier);
}

function frontendDataAttr(name: string): FrontendDataAttrName {
  return dataAttr(name) as FrontendDataAttrName;
}

function frontendDataAttrs(input: Record<string, FrontendNamespaceValue|null|undefined>): FrontendDataAttrs {
  return dataAttrs(input) as FrontendDataAttrs;
}

function frontendDataSelector(name: string, value?: string | number | boolean): string {
  return dataSelector(name, value);
}

function frontendCssVar(name: string): FrontendCssVarName {
  return cssVar(frontendCssTokenName(name)) as FrontendCssVarName;
}

function frontendCssVarRef(name: string, fallback?: string): string {
  return cssVarRef(frontendCssTokenName(name), fallback);
}

function frontendEventName(name: string): string {
  return eventName(name);
}

function frontendToken(name: string): string {
  return token(name);
}

export {
  FRONTEND_PREFIX,
  frontendClassName,
  frontendCssVar,
  frontendCssVarRef,
  frontendDataAttr,
  frontendDataAttrs,
  frontendDataSelector,
  frontendElementClass,
  frontendEventName,
  frontendModifierClass,
  frontendToken,
};
