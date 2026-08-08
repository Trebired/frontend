import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  ScriptHTMLAttributes,
} from "react";
import { classNames, dataBool } from "#ndsvdqv80epr";
import { createSidebarBootScript, type SidebarSide } from "#dyryux7b683c";

type SidebarShellProps = HTMLAttributes<HTMLDivElement> & {
  minimized?: boolean;
  open?: boolean;
  persist?: boolean;
  side?: SidebarSide;
};

type SidebarProps = HTMLAttributes<HTMLElement>;

type SidebarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  controls: string;
};

type SidebarLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean;
  badge?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
};

type SidebarBootScriptProps = ScriptHTMLAttributes<HTMLScriptElement> & {
  sides?: SidebarSide[];
};

function SidebarShell(props: SidebarShellProps) {
  const {
    children,
    className,
    minimized,
    open,
    persist = true,
    side = "left",
    ...rest
  } = props;
  return (
    <div
      {...rest}
      className={classNames("tbf-sidebar-shell", className)}
      data-tbf-sidebar-shell=""
      data-tbf-sidebar-side={String(side)}
      data-tbf-sidebar-minimized={minimized === undefined ? undefined : String(minimized)}
      data-tbf-sidebar-open={open === undefined ? undefined : String(open)}
      data-tbf-sidebar-persist={persist ? undefined : "false"}
    >
      {children}
    </div>
  );
}

function Sidebar(props: SidebarProps) {
  const { children, className, ...rest } = props;
  return (
    <aside
      {...rest}
      className={classNames("tbf-sidebar", className)}
      data-tbf-sidebar=""
    >
      {children}
    </aside>
  );
}

function SidebarBody(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames("tbf-sidebar__body", className)}
      data-tbf-sidebar-body=""
    >
      {children}
    </div>
  );
}

function SidebarFooter(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames("tbf-sidebar__footer", className)}
      data-tbf-sidebar-footer=""
    >
      {children}
    </div>
  );
}

function SidebarMinimizeButton(props: SidebarButtonProps) {
  const { children, className, controls, type = "button", ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-button tbf-sidebar__minimize", className)}
      data-tbf-sidebar-minimize=""
      aria-controls={controls}
      aria-expanded={props["aria-expanded"] ?? true}
      type={type}
    >
      {children}
    </button>
  );
}

function SidebarOpenButton(props: SidebarButtonProps) {
  const { children, className, controls, type = "button", ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-button tbf-sidebar__open", className)}
      data-tbf-sidebar-open=""
      aria-controls={controls}
      type={type}
    >
      {children}
    </button>
  );
}

function SidebarCloseButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { children = "Close", className, type = "button", ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-button tbf-sidebar__close", className)}
      data-tbf-sidebar-close=""
      type={type}
    >
      {children}
    </button>
  );
}

function SidebarList(props: HTMLAttributes<HTMLUListElement>) {
  const { children, className, ...rest } = props;
  return (
    <ul
      {...rest}
      className={classNames("tbf-sidebar-list", className)}
      data-tbf-sidebar-list=""
    >
      {children}
    </ul>
  );
}

function SidebarLink(props: SidebarLinkProps) {
  const {
    active,
    badge,
    children,
    className,
    disabled,
    icon,
    ...rest
  } = props;
  return (
    <li
      className="tbf-sidebar-list__item"
      data-tbf-sidebar-link-row=""
      data-tbf-active={dataBool(active)}
    >
      <a
        {...rest}
        aria-current={active ? "page" : props["aria-current"]}
        aria-disabled={disabled ? true : props["aria-disabled"]}
        className={classNames("tbf-sidebar-link", className)}
        data-tbf-sidebar-link=""
        data-tbf-disabled={dataBool(disabled)}
        tabIndex={disabled ? -1 : props.tabIndex}
      >
        {icon ? <span className="tbf-sidebar-link__icon" data-tbf-sidebar-link-icon="">{icon}</span> : null}
        <span className="tbf-sidebar-link__label" data-tbf-sidebar-label="">{children}</span>
        {badge ? <span className="tbf-sidebar-link__badge">{badge}</span> : null}
      </a>
    </li>
  );
}

function SidebarSeparator(props: HTMLAttributes<HTMLLIElement>) {
  const { className, ...rest } = props;
  return (
    <li
      {...rest}
      className={classNames("tbf-sidebar-separator", className)}
      data-tbf-sidebar-separator=""
      role="separator"
    >
      <span />
    </li>
  );
}

function SidebarBootScript(props: SidebarBootScriptProps) {
  const { sides, ...rest } = props;
  return (
    <script
      {...rest}
      data-tbf-sidebar-boot=""
      dangerouslySetInnerHTML={{ __html: createSidebarBootScript(sides) }}
    />
  );
}

export {
  Sidebar,
  SidebarBody,
  SidebarBootScript,
  SidebarCloseButton,
  SidebarFooter,
  SidebarLink,
  SidebarList,
  SidebarMinimizeButton,
  SidebarOpenButton,
  SidebarSeparator,
  SidebarShell,
};
export * from "./links.js";
export * from "#o5qa0mbep8mh";
export type * from "#9w9ch5jtlv9e";
export type {
  SidebarBootScriptProps,
  SidebarButtonProps,
  SidebarLinkProps,
  SidebarProps,
  SidebarShellProps,
};
