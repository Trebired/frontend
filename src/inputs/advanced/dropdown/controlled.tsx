import { createElement, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { dropdown_option, dropdown_props } from "./model.js";

const EMPTY_VALUE = "\u0000empty";

type ControlledDropdownProps = {
  props: dropdown_props;
  render: (props: dropdown_props) => ReactNode;
};

function toInternal(value: string) {
  return value === "" ? EMPTY_VALUE : value;
}

function fromInternal(value: string) {
  return value === EMPTY_VALUE ? "" : value;
}

function internalOptions(options: dropdown_option[] | undefined) {
  return (Array.isArray(options) ? options : []).map((option) => ({ ...option, value: toInternal(String(option.value)) }));
}

function internalValue(value: dropdown_props["value"]) {
  return Array.isArray(value) ? value.map((item) => toInternal(String(item))) : toInternal(String(value ?? ""));
}

function readHiddenValue(input: HTMLInputElement, multiple: boolean): string | string[] {
  if (!multiple) return fromInternal(input.value);
  try {
    const parsed = JSON.parse(input.value || "[]");
    return Array.isArray(parsed) ? parsed.map((item) => fromInternal(String(item))) : [];
  } catch {
    return [];
  }
}

function shownValue(box: HTMLDivElement | null, multiple: boolean) {
  const hidden = box?.querySelector<HTMLInputElement>("input[type=hidden]");
  return hidden ? JSON.stringify(readHiddenValue(hidden, multiple)) : "";
}

function ControlledDropdown({ props, render }: ControlledDropdownProps) {
  const box = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  const [generation, setGeneration] = useState(0);
  latest.current = props;
  const multiple = props.multiple === true;
  const wanted = JSON.stringify(Array.isArray(props.value) ? props.value : String(props.value ?? ""));
  useEffect(() => {
      if (shownValue(box.current, multiple) !== wanted) setGeneration((value) => value + 1);
    }, [wanted, multiple, props.disabled]);
  useEffect(() => {
      const node = box.current;
      if (!node) return;
      const listener = (event: Event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement) || target.type !== "hidden") return;
        const value = readHiddenValue(target, multiple);
        if (Array.isArray(value)) latest.current.onValuesChange?.(value);
        else latest.current.onChange?.(value);
        setTimeout(() => {
            const current = latest.current;
            const expected = JSON.stringify(Array.isArray(current.value) ? current.value : String(current.value ?? ""));
            if (shownValue(box.current, multiple) !== expected) setGeneration((count) => count + 1);
          }, 0);
      };
      node.addEventListener("change", listener);
      return () => node.removeEventListener("change", listener);
    }, [multiple]);
  return createElement(
    "div",
    { ref: box, style: { display: "contents" } },
    createElement(
      "div",
      { key: generation, style: { display: "contents" } },
      render({
          ...props,
          onChange: undefined,
          onValuesChange: undefined,
          options: internalOptions(props.options),
          value: internalValue(props.value),
      }),
    ),
  );
}

function controlledDropdown(props: dropdown_props, render: (props: dropdown_props) => ReactNode) {
  return createElement(ControlledDropdown, { props, render });
}

export { controlledDropdown };
