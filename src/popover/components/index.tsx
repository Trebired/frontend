import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { renderCloseButton } from "#5e51rp1mtb3n";
import { classNames, dataBool } from "#ndsvdqv80epr";

type PopoverPanelProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

type PopoverOpenButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  controls: string;
  hover?: boolean;
};

function PopoverPanel(props: PopoverPanelProps) {
  const { children, className, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames("tbf-popover", className)}
    data-tbf-popover=""
    aria-hidden="true"
    inert={true}
    >
    {children}
    </div>
  );
}

function PopoverOpenButton(props: PopoverOpenButtonProps) {
  const { children, className, controls, hover, type = "button", ...rest } = props;
  return (
    <button
    {...rest}
    className={classNames("tbf-button", className)}
    data-tbf-popover-hover={dataBool(hover)}
    data-tbf-popover-trigger=""
    aria-controls={controls}
    aria-expanded="false"
    type={type}
    >
    {children}
    </button>
  );
}

function PopoverCloseButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return renderCloseButton({ closeAttribute: "data-tbf-popover-close", props });
}

export { PopoverCloseButton, PopoverOpenButton, PopoverPanel };
export type { PopoverOpenButtonProps, PopoverPanelProps };
