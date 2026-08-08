import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";

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
      className={classNames("tbf-disclosure", className)}
      data-tbf-disclosure=""
      data-tbf-disclosure-open={defaultOpen ? "true" : "false"}
    >
      {trigger}
      <div
        className="tbf-disclosure__panel"
        data-tbf-disclosure-panel=""
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
      className={classNames("tbf-disclosure__trigger", className)}
      data-tbf-disclosure-trigger=""
      type={type}
    >
      {children}
    </button>
  );
}

export { Disclosure, DisclosureButton };
export type { DisclosureButtonProps, DisclosureProps };
