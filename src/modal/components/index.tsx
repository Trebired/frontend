import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { renderCloseButton } from "#5e51rp1mtb3n";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttr, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

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
    className={classNames(frontendClassName("modal"), className)}
    {...frontendDataAttrs({ "modal": "" })}
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
    className={classNames(frontendElementClass("modal", "content"), className)}
    {...frontendDataAttrs({ "modal-content": "" })}
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
    className={classNames(frontendClassName("button"), className)}
    {...frontendDataAttrs({ "modal-open": "" })}
    aria-controls={controls}
    type={type}
    >
    {children}
    </button>
  );
}

function ModalCloseButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return renderCloseButton({ closeAttribute: frontendDataAttr("modal-close"), props });
}

export { ModalCloseButton, ModalContent, ModalOpenButton, ModalRoot };
export type { ModalContentProps, ModalOpenButtonProps, ModalRootProps };
