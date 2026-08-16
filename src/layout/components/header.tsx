import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type AppHeaderProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  brand?: ReactNode;
  nav?: ReactNode;
  primary?: boolean;
  secondary?: boolean;
};

type MobileNavProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  bottom?: ReactNode;
  id: string;
  panelLabel?: string;
};

type MobileNavToggleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  controls: string;
};

function AppHeader(props: AppHeaderProps) {
  const { actions, brand, children, className, nav, primary = true, secondary, ...rest } = props;
  return (
    <header
    {...rest}
    className={classNames(frontendClassName("header"), className)}
    {...frontendDataAttrs({ "header": "" })}
    {...frontendDataAttrs({ "header-primary": primary && !secondary ? "" : undefined })}
    {...frontendDataAttrs({ "header-secondary": secondary ? "" : undefined })}
    >
    {brand ? <div className={frontendElementClass("header", "brand")} {...frontendDataAttrs({ "header-brand": "" })}>{brand}</div> : null}
    {nav ? <nav className={frontendElementClass("header", "nav")} {...frontendDataAttrs({ "header-nav": "" })}>{nav}</nav> : null}
    {children}
    {actions ? <div className={frontendElementClass("header", "actions")} {...frontendDataAttrs({ "header-actions": "" })}>{actions}</div> : null}
    </header>
  );
}

function HeaderGroup(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames(frontendElementClass("header", "group"), className)} {...frontendDataAttrs({ "header-group": "" })}>
    {children}
    </div>
  );
}

function MobileNav(props: MobileNavProps) {
  const { actions, bottom, children, className, id, panelLabel = "Menu", ...rest } = props;
  return (
    <nav
    {...rest}
    className={classNames(frontendClassName("mobile-nav"), className)}
    {...frontendDataAttrs({ "mobile-nav": "" })}
    {...frontendDataAttrs({ "mobile-nav-open": "false" })}
    id={id}
    >
    <div className={frontendElementClass("mobile-nav", "scrim")} {...frontendDataAttrs({ "mobile-nav-close": "" })} />
    <div
    aria-hidden="true"
    aria-label={panelLabel}
    className={frontendElementClass("mobile-nav", "panel")}
    {...frontendDataAttrs({ "mobile-nav-panel": "" })}
    role="dialog"
    >
    {children}
    {actions ? <div className={frontendElementClass("mobile-nav", "actions")}>{actions}</div> : null}
    {bottom ? <div className={frontendElementClass("mobile-nav", "bottom")}>{bottom}</div> : null}
    </div>
    </nav>
  );
}

function MobileNavToggleButton(props: MobileNavToggleButtonProps) {
  const { children, className, controls, type = "button", ...rest } = props;
  return (
    <button
    {...rest}
    aria-controls={controls}
    aria-expanded={props["aria-expanded"] ?? false}
    className={classNames(`${frontendClassName("button")} ${frontendElementClass("mobile-nav", "toggle")}`, className)}
    {...frontendDataAttrs({ "mobile-nav-toggle": "" })}
    type={type}
    >
    {children}
    </button>
  );
}

function MobileNavCloseButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { children = "Close", className, type = "button", ...rest } = props;
  return (
    <button
    {...rest}
    className={classNames(`${frontendClassName("button")} ${frontendElementClass("mobile-nav", "close")}`, className)}
    {...frontendDataAttrs({ "mobile-nav-close": "" })}
    type={type}
    >
    {children}
    </button>
  );
}

export {
  AppHeader,
  HeaderGroup,
  MobileNav,
  MobileNavCloseButton,
  MobileNavToggleButton,
};
export type { AppHeaderProps, MobileNavProps, MobileNavToggleButtonProps };
