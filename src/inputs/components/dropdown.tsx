import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type DropdownProps = HTMLAttributes<HTMLDivElement> & {
  name?: string;
  value?: string;
};

type DropdownTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

type DropdownOptionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  value: string;
};

function Dropdown(props: DropdownProps) {
  const { children, className, name, value = "", ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("dropdown"), className)}
    {...frontendDataAttrs({ "dropdown": "" })}
    {...frontendDataAttrs({ "dropdown-current": value })}
    {...frontendDataAttrs({ "dropdown-open": "false" })}
    >
    {name ? <input {...frontendDataAttrs({ "dropdown-input": "" })} name={name} type="hidden" value={value} /> : null}
    {children}
    </div>
  );
}

function DropdownTrigger(props: DropdownTriggerProps) {
  const { children, className, type = "button", ...rest } = props;
  return (
    <button
    {...rest}
    aria-expanded={props["aria-expanded"] ?? false}
    className={classNames(frontendElementClass("dropdown", "trigger"), className)}
    {...frontendDataAttrs({ "dropdown-trigger": "" })}
    type={type}
    >
    {children}
    </button>
  );
}

function DropdownValue(props: HTMLAttributes<HTMLSpanElement>) {
  const { children, className, ...rest } = props;
  return (
    <span {...rest} className={classNames(frontendElementClass("dropdown", "value"), className)} {...frontendDataAttrs({ "dropdown-value": "" })}>
    {children}
    </span>
  );
}

function DropdownMenu(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames(frontendElementClass("dropdown", "menu"), className)} {...frontendDataAttrs({ "dropdown-menu": "" })}>
    {children}
    </div>
  );
}

function DropdownOption(props: DropdownOptionProps) {
  const { children, className, selected, type = "button", value, ...rest } = props;
  return (
    <button
    {...rest}
    aria-selected={selected ? "true" : "false"}
    className={classNames(frontendElementClass("dropdown", "option"), className)}
    {...frontendDataAttrs({ "dropdown-option": value })}
    role="option"
    type={type}
    >
    {children}
    </button>
  );
}

function DropdownNativeInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} {...frontendDataAttrs({ "dropdown-input": "" })} type="hidden" />;
}

export { Dropdown, DropdownMenu, DropdownNativeInput, DropdownOption, DropdownTrigger, DropdownValue };
export type { DropdownOptionProps, DropdownProps, DropdownTriggerProps };
