import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { renderCloseButton } from "#5e51rp1mtb3n";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttr, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ensureLayerRoot } from "#ccvonx3uhbte";

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
  const [layerRoot, setLayerRoot] = useState<HTMLElement | null>(null);

  /**
   * `openModal()` moves the modal into the layer root, which detaches it from
   * the React root container and kills React's delegated events inside it.
   * Portalling keeps the node in the React tree. Applied after mount so the
   * server render and the first client render still match.
   */
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
