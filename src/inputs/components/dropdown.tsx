import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from "react";
import { classNames } from "#ndsvdqv80epr";

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
      className={classNames("tbf-dropdown", className)}
      data-tbf-dropdown=""
      data-tbf-dropdown-current={value}
      data-tbf-dropdown-open="false"
    >
      {name ? <input data-tbf-dropdown-input="" name={name} type="hidden" value={value} /> : null}
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
      className={classNames("tbf-dropdown__trigger", className)}
      data-tbf-dropdown-trigger=""
      type={type}
    >
      {children}
    </button>
  );
}

function DropdownValue(props: HTMLAttributes<HTMLSpanElement>) {
  const { children, className, ...rest } = props;
  return (
    <span {...rest} className={classNames("tbf-dropdown__value", className)} data-tbf-dropdown-value="">
      {children}
    </span>
  );
}

function DropdownMenu(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames("tbf-dropdown__menu", className)} data-tbf-dropdown-menu="">
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
      className={classNames("tbf-dropdown__option", className)}
      data-tbf-dropdown-option={value}
      role="option"
      type={type}
    >
      {children}
    </button>
  );
}

function DropdownNativeInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} data-tbf-dropdown-input="" type="hidden" />;
}

export { Dropdown, DropdownMenu, DropdownNativeInput, DropdownOption, DropdownTrigger, DropdownValue };
export type { DropdownOptionProps, DropdownProps, DropdownTriggerProps };
