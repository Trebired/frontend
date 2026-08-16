import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type DisclosureProps = HTMLAttributes<HTMLDivElement> & {
  defaultOpen?: boolean;
  panel: ReactNode;
  trigger: ReactNode;
};

type DisclosureButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function Disclosure(props: DisclosureProps) {
  const { children, className, defaultOpen, panel, trigger, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("disclosure"), className)}
    {...frontendDataAttrs({ "disclosure": "" })}
    {...frontendDataAttrs({ "disclosure-open": defaultOpen ? "true" : "false" })}
    >
    {trigger}
    <div
    className={frontendElementClass("disclosure", "panel")}
    {...frontendDataAttrs({ "disclosure-panel": "" })}
    hidden={!defaultOpen}
    >
    {panel}
    </div>
    {children}
    </div>
  );
}

function DisclosureButton(props: DisclosureButtonProps) {
  const { children, className, type = "button", ...rest } = props;
  return (
    <button
    {...rest}
    aria-expanded={props["aria-expanded"] ?? false}
    className={classNames(frontendElementClass("disclosure", "trigger"), className)}
    {...frontendDataAttrs({ "disclosure-trigger": "" })}
    type={type}
    >
    {children}
    </button>
  );
}

export { Disclosure, DisclosureButton };
export type { DisclosureButtonProps, DisclosureProps };
