import { frontendClassName } from "#5vbaqj4pirp3";
import { joinClassNames } from "#dqy2d22qyujv";
import { icon } from "#dqy2d22qyujv";
import {
  primitiveInputClassName,
  type PrimitiveInputSize,
  type PrimitiveInputTone,
} from "#0rl8rpgzssot";
import type { ChangeEvent, ReactNode } from "react";
import { labelledControl } from "./../field/labelled.js";

type InputProps = {
  className?: string;
  label?: ReactNode;
  onValue?: (value: string) => void;
  size?: PrimitiveInputSize;
  tone?: PrimitiveInputTone;
  [key: string]: unknown;
};

function withValueCallback(rest: Record<string, unknown>, onValue?: (value: string) => void) {
  if (typeof onValue !== "function") return rest;
  const onChange = rest.onChange as ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  return {
    ...rest,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      onValue(event.target.value);
    },
  };
}

function input(props: InputProps) {
  const { label, onValue, ...rest } = props;
  return labelledControl(label, inputControl(withValueCallback(rest, onValue)));
}

function inputControl(props: InputProps) {
  const { className, size, tone, ...rest } = props;
  const search = String(rest.type || "").toLowerCase() === "search";
  const classes = splitInputClasses(className);
  const node = (
    <input
    className={primitiveInputClassName({
          className: search ? classes.input : className,
          size,
          tone,
    })}
    {...rest}
    />
  );

  if (!search) return node;
  return (
    <span className={joinClassNames([frontendClassName("input-search-wrap"), classes.wrapper])}>
    {node}
    {icon({
          className: frontendClassName("input-search-icon"),
          spec: "remixicon search-line",
    })}
    </span>
  );
}

function isWrapperClass(name: string) {
  return name.startsWith(frontendClassName("width-")) || name === frontendClassName("grow");
}

function splitInputClasses(className: unknown) {
  const inputClasses: string[] = [];
  const wrapperClasses: string[] = [];
  String(className || "")
  .split(/\s+/)
  .filter(Boolean)
  .forEach((name) => {
      if (isWrapperClass(name)) wrapperClasses.push(name);
      else inputClasses.push(name);
  });
  return {
    input: inputClasses.join(" "),
    wrapper: wrapperClasses.join(" "),
  };
}

export type { InputProps };
export default input;
