import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

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
    className={classNames(frontendClassName("status-field"), className)}
    {...frontendDataAttrs({ "status-field": "" })}
    {...frontendDataAttrs({ "status-method": method })}
    {...frontendDataAttrs({ "status-state": "idle" })}
    {...frontendDataAttrs({ "status-url": url })}
    >
    {children}
    </div>
  );
}

function StatusMessage(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendElementClass("status-field", "message"), className)}
    {...frontendDataAttrs({ "status-message": "" })}
    >
    {children}
    </div>
  );
}

export { StatusField, StatusMessage };
export type { StatusFieldProps };
