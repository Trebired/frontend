function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function dataBool(value: boolean | undefined) {
  return value === true ? "true" : undefined;
}

function jsonScript(value: unknown) {
  return JSON.stringify(value ?? {}).replace(/</g, "\\u003c");
}

export { classNames, dataBool, jsonScript };
