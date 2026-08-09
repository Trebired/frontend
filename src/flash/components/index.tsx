import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import type { FlashType } from "#33o6e7mug9pg";

type FlashStackProps = HTMLAttributes<HTMLDivElement> & {
  expanded?: boolean;
};

type FlashShellProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  description?: ReactNode;
  id?: string;
  progress?: boolean;
  title: ReactNode;
  type?: FlashType;
};

type ConfirmElementProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmDescription?: string;
  confirmMode?: "classic" | "text";
  confirmText?: string;
  confirmTitle: string;
  confirmType?: FlashType;
};

function FlashStack(props: FlashStackProps) {
  const { children, className, expanded = false, id = "tbf_flash_stack", ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames("tbf-flash-stack", className)}
      data-tbf-expanded={expanded ? "true" : "false"}
      data-tbf-flash-stack=""
      id={id}
    >
      {children}
    </div>
  );
}

function FlashShell(props: FlashShellProps) {
  const {
    actions,
    className,
    description,
    id,
    progress = true,
    title,
    type = "info",
    ...rest
  } = props;
  return (
    <section
      {...rest}
      className={classNames("tbf-flash", className)}
      data-tbf-flash=""
      data-tbf-flash-id={id}
      data-tbf-flash-type={type}
      data-tbf-progress-tone={type}
      role={type === "error" ? "alert" : "status"}
    >
      <span className="tbf-flash__icon" aria-hidden="true">{iconText(type)}</span>
      <div className="tbf-flash__body">
        <strong className="tbf-flash__title">{title}</strong>
        {description ? <span className="tbf-flash__description">{description}</span> : null}
        {actions ? <div className="tbf-flash__actions">{actions}</div> : null}
      </div>
      <span className="tbf-flash__progress" aria-hidden="true" hidden={!progress} />
    </section>
  );
}

function ConfirmElement(props: ConfirmElementProps) {
  const {
    children,
    className,
    confirmDescription,
    confirmMode,
    confirmText,
    confirmTitle,
    confirmType,
    type = "button",
    ...rest
  } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-button", className)}
      data-tbf-confirm=""
      data-tbf-confirm-description={confirmDescription}
      data-tbf-confirm-mode={confirmMode}
      data-tbf-confirm-text={confirmText}
      data-tbf-confirm-title={confirmTitle}
      data-tbf-confirm-type={confirmType}
      type={type}
    >
      {children}
    </button>
  );
}

function FlashLiveRegion(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames("tbf-flash-live", className)}
      aria-live="polite"
      data-tbf-flash-live=""
    />
  );
}

function iconText(type: FlashType) {
  if (type === "success") return "OK";
  if (type === "error") return "!";
  return "i";
}

export { ConfirmElement, FlashLiveRegion, FlashShell, FlashStack };
export type { ConfirmElementProps, FlashShellProps, FlashStackProps };
