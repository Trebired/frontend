import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { renderCloseButton } from "#5e51rp1mtb3n";
import { button, createLocalTranslator, icon } from "#dqy2d22qyujv";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttr, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ensureLayerRoot } from "#ccvonx3uhbte";
import { HeadingScope } from "#7ly3b59upz0n";

type ModalRootProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  closeButton?: boolean;
  closeLabel?: string;
  labelledBy?: string;
};

type ModalContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

type ModalOpenButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  controls: string;
};

function overlayCloseButton(label: string) {
  return button({
      "aria-label": label,
      [frontendDataAttr("modal-close")]: "",
      children: icon({ spec: "remixicon close-line" }),
      icon: true,
      size: "sm",
      title: label,
      tooltip: true,
      variant: "secondary",
  });
}

function ModalRoot(props: ModalRootProps) {
  const { children, className, closeButton, closeLabel, labelledBy, role = "dialog", ...rest } = props;
  const refusesClickClose = (rest as Record<string, unknown>)[frontendDataAttr("modal-backdrop-close")] === "false";
  const showClose = closeButton ?? !refusesClickClose;
  const [layerRoot, setLayerRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
      setLayerRoot(ensureLayerRoot());
    }, []);

  const modal = (
    <div
    {...rest}
    className={classNames(frontendClassName("modal"), className)}
    {...frontendDataAttrs({ "modal": "" })}
    role={role}
    aria-hidden="true"
    aria-labelledby={labelledBy}
    >
    {showClose ? overlayCloseButton(closeLabel ?? createLocalTranslator(import.meta.url, rest.lang)("actions.close")) : null}
    {children}
    </div>
  );

  return layerRoot ? createPortal(modal, layerRoot) : modal;
}

function ModalContent(props: ModalContentProps) {
  const { children, className, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendElementClass("modal", "content"), className)}
    {...frontendDataAttrs({ "modal-content": "" })}
    >
    <HeadingScope depth={1}>{children}</HeadingScope>
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
    aria-haspopup="dialog"
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
