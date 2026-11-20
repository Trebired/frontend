import { joinClassNames } from "./shared.js";
import { frontendClassName } from "#5vbaqj4pirp3";

type NumberProps = {
  className?: string;
  id?: string;
  value: unknown;
};

function parseNumberValue(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumberValue(value: unknown) {
  const parsed = parseNumberValue(value);
  return parsed == null ? "" : parsed.toLocaleString("en-US");
}

function numberClassName(className?: string) {
  return joinClassNames(frontendClassName("number"), className);
}

function number(props: NumberProps) {
  const text = formatNumberValue(props.value);
  if (!text) return null;
  return (
    <span {...(props.id ? { id: props.id } : {})} className={numberClassName(props.className)}>
    {text}
    </span>
  );
}

function createNumberElement(documentRef: Document, value: unknown, className?: string) {
  const node = documentRef.createElement("span");
  node.className = numberClassName(className);
  node.textContent = formatNumberValue(value);
  return node;
}

export { createNumberElement, formatNumberValue, number };
export type { NumberProps };
