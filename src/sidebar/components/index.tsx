import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  ScriptHTMLAttributes,
} from "react";
import { classNames, dataBool } from "#ndsvdqv80epr";
import { createSidebarBootScript, type SidebarSide } from "#dyryux7b683c";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

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
    className={classNames(frontendClassName("sidebar-shell"), className)}
    {...frontendDataAttrs({ "sidebar-shell": "" })}
    {...frontendDataAttrs({ "sidebar-side": String(side) })}
    {...frontendDataAttrs({ "sidebar-minimized": minimized === undefined ? undefined : String(minimized) })}
    {...frontendDataAttrs({ "sidebar-open": open === undefined ? undefined : String(open) })}
    {...frontendDataAttrs({ "sidebar-persist": persist ? undefined : "false" })}
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
    className={classNames(frontendClassName("sidebar"), className)}
    {...frontendDataAttrs({ "sidebar": "" })}
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
    className={classNames(frontendElementClass("sidebar", "body"), className)}
    {...frontendDataAttrs({ "sidebar-body": "" })}
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
    className={classNames(frontendElementClass("sidebar", "footer"), className)}
    {...frontendDataAttrs({ "sidebar-footer": "" })}
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
    className={classNames(`${frontendClassName("button")} ${frontendElementClass("sidebar", "minimize")}`, className)}
    {...frontendDataAttrs({ "sidebar-minimize": "" })}
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
    className={classNames(`${frontendClassName("button")} ${frontendElementClass("sidebar", "open")}`, className)}
    {...frontendDataAttrs({ "sidebar-open": "" })}
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
    className={classNames(`${frontendClassName("button")} ${frontendElementClass("sidebar", "close")}`, className)}
    {...frontendDataAttrs({ "sidebar-close": "" })}
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
    className={classNames(frontendClassName("sidebar-list"), className)}
    {...frontendDataAttrs({ "sidebar-list": "" })}
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
    className={frontendElementClass("sidebar-list", "item")}
    {...frontendDataAttrs({ "sidebar-link-row": "" })}
    {...frontendDataAttrs({ "active": dataBool(active) })}
    >
    <a
    {...rest}
    aria-current={active ? "page" : props["aria-current"]}
    aria-disabled={disabled ? true : props["aria-disabled"]}
    className={classNames(frontendClassName("sidebar-link"), className)}
    {...frontendDataAttrs({ "sidebar-link": "" })}
    {...frontendDataAttrs({ "disabled": dataBool(disabled) })}
    tabIndex={disabled ? -1 : props.tabIndex}
    >
    {icon ? <span className={frontendElementClass("sidebar-link", "icon")} {...frontendDataAttrs({ "sidebar-link-icon": "" })}>{icon}</span> : null}
    <span className={frontendElementClass("sidebar-link", "label")} {...frontendDataAttrs({ "sidebar-label": "" })}>{children}</span>
    {badge ? <span className={frontendElementClass("sidebar-link", "badge")}>{badge}</span> : null}
    </a>
    </li>
  );
}

function SidebarSeparator(props: HTMLAttributes<HTMLLIElement>) {
  const { className, ...rest } = props;
  return (
    <li
    {...rest}
    className={classNames(frontendClassName("sidebar-separator"), className)}
    {...frontendDataAttrs({ "sidebar-separator": "" })}
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
    {...frontendDataAttrs({ "sidebar-boot": "" })}
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
