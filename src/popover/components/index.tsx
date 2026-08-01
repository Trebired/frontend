import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
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
      data-tbf-popover-open=""
      aria-controls={controls}
      aria-expanded="false"
      type={type}
    >
      {children}
    </button>
  );
}

function PopoverCloseButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { children = "Close", className, type = "button", ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-button", className)}
      data-tbf-popover-close=""
      type={type}
    >
      {children}
    </button>
  );
}

export { PopoverCloseButton, PopoverOpenButton, PopoverPanel };
export type { PopoverOpenButtonProps, PopoverPanelProps };
