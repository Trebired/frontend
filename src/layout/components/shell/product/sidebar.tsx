import { classNames } from "#ndsvdqv80epr";
import { Card } from "#4woymc9xhupl";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarMinimizeButton,
  SidebarShell,
} from "#26uyycr73i6f";
import { ThemeToggle } from "#wavczpl1zxvg";
import { productShellLabel } from "./state.js";
import type {
  ProductShellAboutButtonProps,
  ProductShellSidebarControlsProps,
  ProductShellSidebarFooterProps,
  ProductShellSidebarMinimizeButtonProps,
  ProductShellSidebarProps,
  ProductShellThemeToggleProps,
} from "./types.js";

function ProductShellSidebarFooter(props: ProductShellSidebarFooterProps) {
  const { actions, children, className, ...rest } = props;
  const body = actions ?? children;
  if (!body) return null;
  return (
    <SidebarFooter
      {...rest}
      className={classNames("tbf-product-shell-sidebar-footer", className)}
    >
      {body}
    </SidebarFooter>
  );
}

function ProductShellSidebarControls(props: ProductShellSidebarControlsProps) {
  const { about, className, language, minimize, theme, ...rest } = props;
  return (
    <Card {...rest} className={classNames("tbf-product-shell-sidebar-controls", className)}>
      {minimize}
      {theme}
      {language}
      {about}
    </Card>
  );
}

function ProductShellSidebarMinimizeButton(
  props: ProductShellSidebarMinimizeButtonProps,
) {
  const {
    children,
    className,
    expandedIcon,
    labels,
    minimizedIcon,
    title,
    ...rest
  } = props;
  const label = title || productShellLabel(labels, "minimize");
  return (
    <SidebarMinimizeButton
      {...rest}
      aria-label={props["aria-label"] || String(label)}
      className={classNames("tbf-product-shell-sidebar-minimize", className)}
      title={String(label)}
    >
      {children || (
        <>
          <span className="tbf-product-shell-sidebar-minimize__collapse">
            {expandedIcon}
          </span>
          <span className="tbf-product-shell-sidebar-minimize__expand">
            {minimizedIcon}
          </span>
        </>
      )}
    </SidebarMinimizeButton>
  );
}

function ProductShellThemeToggle(props: ProductShellThemeToggleProps) {
  const { children, className, icon, labels, ...rest } = props;
  const label = productShellLabel(labels, "toggleTheme");
  return (
    <ThemeToggle
      {...rest}
      aria-label={props["aria-label"] || label}
      className={classNames("tbf-product-shell-theme-control", className)}
      darkLabel={label}
      lightLabel={label}
    >
      {children || icon}
    </ThemeToggle>
  );
}

function ProductShellAboutButton(props: ProductShellAboutButtonProps) {
  const { children, className, href = "/about", icon, labels, title, ...rest } = props;
  const label = title || productShellLabel(labels, "about");
  return (
    <a
      {...rest}
      aria-label={props["aria-label"] || String(label)}
      className={classNames("tbf-product-shell-about", className)}
      href={href}
      title={String(label)}
    >
      {children || icon || label}
    </a>
  );
}

function ProductShellSidebar(props: ProductShellSidebarProps) {
  const side = props.side || "left";
  const shellId = props.id || `sidebar_shell_${side}`;
  const bodyId = props.bodyId || `sidebar_body_${side}`;
  return (
    <SidebarShell className={classNames(String(side), props.className)} id={shellId} persist={props.persist} side={side}>
      <Sidebar aria-label={props.ariaLabel} className="column gap-sm">
        <SidebarBody className={classNames("column gap-sm", props.bodyClassName)} id={bodyId}>
          {props.content ?? props.children}
        </SidebarBody>
        {props.showFooter === false ? null : (
          <ProductShellSidebarFooter actions={props.footerActions}>
            {props.footer}
          </ProductShellSidebarFooter>
        )}
      </Sidebar>
    </SidebarShell>
  );
}

export {
  ProductShellAboutButton,
  ProductShellSidebar,
  ProductShellSidebarControls,
  ProductShellSidebarFooter,
  ProductShellSidebarMinimizeButton,
  ProductShellThemeToggle,
};
