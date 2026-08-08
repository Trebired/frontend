import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames } from "#ndsvdqv80epr";

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
      className={classNames("tbf-header", className)}
      data-tbf-header=""
      data-tbf-header-primary={primary && !secondary ? "" : undefined}
      data-tbf-header-secondary={secondary ? "" : undefined}
    >
      {brand ? <div className="tbf-header__brand" data-tbf-header-brand="">{brand}</div> : null}
      {nav ? <nav className="tbf-header__nav" data-tbf-header-nav="">{nav}</nav> : null}
      {children}
      {actions ? <div className="tbf-header__actions" data-tbf-header-actions="">{actions}</div> : null}
    </header>
  );
}

function HeaderGroup(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames("tbf-header__group", className)} data-tbf-header-group="">
      {children}
    </div>
  );
}

function MobileNav(props: MobileNavProps) {
  const { actions, bottom, children, className, id, panelLabel = "Menu", ...rest } = props;
  return (
    <nav
      {...rest}
      className={classNames("tbf-mobile-nav", className)}
      data-tbf-mobile-nav=""
      data-tbf-mobile-nav-open="false"
      id={id}
    >
      <div className="tbf-mobile-nav__scrim" data-tbf-mobile-nav-close="" />
      <div
        aria-hidden="true"
        aria-label={panelLabel}
        className="tbf-mobile-nav__panel"
        data-tbf-mobile-nav-panel=""
        role="dialog"
      >
        {children}
        {actions ? <div className="tbf-mobile-nav__actions">{actions}</div> : null}
        {bottom ? <div className="tbf-mobile-nav__bottom">{bottom}</div> : null}
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
      className={classNames("tbf-button tbf-mobile-nav__toggle", className)}
      data-tbf-mobile-nav-toggle=""
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
      className={classNames("tbf-button tbf-mobile-nav__close", className)}
      data-tbf-mobile-nav-close=""
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
