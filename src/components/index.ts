function classNameParts(values: unknown[]): string[] {
  return values
  .flatMap((value) => (Array.isArray(value) ? classNameParts(value) : [String(value || "").trim()]))
  .filter(Boolean);
}

function classNames(...values: Array<string | false | null | undefined>) {
  return joinClassNames(...values);
}

function dataBool(value: boolean | undefined) {
  return value === true ? "true" : undefined;
}

function defineValue<T>(value: T): T {
  return value;
}

function toText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function objectRecord<T = Record<string, unknown>>(value: unknown): T {
  return value && typeof value === "object" && !Array.isArray(value)
  ? value as T
  : {} as T;
}

function interpolateMessage(message: string, vars: Record<string, unknown> = {}) {
  return Object.entries(vars).reduce((next, [key, value]) => {
      return next
      .split(`{{${key}}}`)
      .join(String(value ?? ""))
      .split(`{${key}}`)
      .join(String(value ?? ""));
    }, message);
}

function createTranslatorFactory(resolveMessage: (key: string, lang?: string) => string) {
  return (_url?: string, lang?: string) => {
    return (key: string, vars: Record<string, unknown> = {}) => {
      return interpolateMessage(resolveMessage(key, lang), vars);
    };
  };
}

function joinClassNames(...values: unknown[]) {
  return classNameParts(values).join(" ");
}

function appendClassName(input: unknown, ...values: unknown[]) {
  const next = new Set(classNameParts([input]));
  classNameParts(values).forEach((value) => next.add(value));
  return Array.from(next).join(" ");
}

function jsonScript(value: unknown) {
  return JSON.stringify(value ?? {}).replace(/</g, "\\u003c");
}

function escapeHtml(value: unknown) {
  return String(value == null ? "" : value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
    }

    export {
    appendClassName,
    classNames,
    dataBool,
    defineValue,
    escapeHtml,
    createTranslatorFactory,
    joinClassNames,
    jsonScript,
    interpolateMessage,
    objectRecord,
    toText,
    };
