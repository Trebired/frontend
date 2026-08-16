import type {
  ButtonHTMLAttributes,
} from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName } from "#5vbaqj4pirp3";

type CloseButtonOptions = {
  closeAttribute: `data-${string}`;
  props: ButtonHTMLAttributes<HTMLButtonElement>;
};

function renderCloseButton(options: CloseButtonOptions) {
  const { children = "Close", className, type = "button", ...rest } = options.props;
  return (
    <button
    {...rest}
    {...{ [options.closeAttribute]: "" }}
    className={classNames(frontendClassName("button"), className)}
    type={type}
    >
    {children}
    </button>
  );
}

export { renderCloseButton };
