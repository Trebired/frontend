import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames } from "#ndsvdqv80epr";

type ModalRootProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  labelledBy?: string;
};

type ModalContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

type ModalOpenButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  controls: string;
};

function ModalRoot(props: ModalRootProps) {
  const { children, className, labelledBy, role = "dialog", ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames("tbf-modal", className)}
      data-tbf-modal=""
      role={role}
      aria-hidden="true"
      aria-labelledby={labelledBy}
    >
      {children}
    </div>
  );
}

function ModalContent(props: ModalContentProps) {
  const { children, className, ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames("tbf-modal__content", className)}
      data-tbf-modal-content=""
    >
      {children}
    </div>
  );
}

function ModalOpenButton(props: ModalOpenButtonProps) {
  const { children, className, controls, type = "button", ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-button", className)}
      data-tbf-modal-open=""
      aria-controls={controls}
      type={type}
    >
      {children}
    </button>
  );
}

function ModalCloseButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { children = "Close", className, type = "button", ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-button", className)}
      data-tbf-modal-close=""
      type={type}
    >
      {children}
    </button>
  );
}

export { ModalCloseButton, ModalContent, ModalOpenButton, ModalRoot };
export type { ModalContentProps, ModalOpenButtonProps, ModalRootProps };
