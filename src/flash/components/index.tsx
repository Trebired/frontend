import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { flashIconSpec } from "#qdbpux4f2e4m";
import type { FlashType } from "#33o6e7mug9pg";
import { Icon } from "#lbkpzw8nphru";
import { FRONTEND_PREFIX, frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

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
  const { children, className, expanded = false, id = `${FRONTEND_PREFIX}_flash_stack`, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("flash-stack"), className)}
    {...frontendDataAttrs({ "expanded": expanded ? "true" : "false" })}
    {...frontendDataAttrs({ "flash-stack": "" })}
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
    className={classNames(frontendClassName("flash"), className)}
    {...frontendDataAttrs({ "flash": "" })}
    {...frontendDataAttrs({ "flash-id": id })}
    {...frontendDataAttrs({ "flash-type": type })}
    {...frontendDataAttrs({ "progress-tone": type })}
    role={type === "error" ? "alert" : "status"}
    >
    <Icon className={frontendElementClass("flash", "icon")} spec={flashIconSpec(type)} />
    <div className={frontendElementClass("flash", "body")}>
    <span className={frontendElementClass("flash", "title")}>{title}</span>
    {description ? <span className={frontendElementClass("flash", "description")}>{description}</span> : null}
    {actions ? <div className={frontendElementClass("flash", "actions")}>{actions}</div> : null}
    </div>
    <span className={frontendElementClass("flash", "progress")} aria-hidden="true" hidden={!progress} />
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
    className={classNames(frontendClassName("button"), className)}
    {...frontendDataAttrs({ "confirm": "" })}
    {...frontendDataAttrs({ "confirm-description": confirmDescription })}
    {...frontendDataAttrs({ "confirm-mode": confirmMode })}
    {...frontendDataAttrs({ "confirm-text": confirmText })}
    {...frontendDataAttrs({ "confirm-title": confirmTitle })}
    {...frontendDataAttrs({ "confirm-type": confirmType })}
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
    className={classNames(frontendClassName("flash-live"), className)}
    aria-live="polite"
    {...frontendDataAttrs({ "flash-live": "" })}
    />
  );
}

export { ConfirmElement, FlashLiveRegion, FlashShell, FlashStack };
export type { ConfirmElementProps, FlashShellProps, FlashStackProps };
