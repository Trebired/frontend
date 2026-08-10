import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";

type StatusFieldProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  method?: string;
  url: string;
};

function StatusField(props: StatusFieldProps) {
  const { children, className, method, url, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames("tbf-status-field", className)}
    data-tbf-status-field=""
    data-tbf-status-method={method}
    data-tbf-status-state="idle"
    data-tbf-status-url={url}
    >
    {children}
    </div>
  );
}

function StatusMessage(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames("tbf-status-field__message", className)} data-tbf-status-message="">
    {children}
    </div>
  );
}

export { StatusField, StatusMessage };
export type { StatusFieldProps };
