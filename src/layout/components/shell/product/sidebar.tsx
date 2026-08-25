import { classNames } from "#ndsvdqv80epr";
import { Card } from "#4woymc9xhupl";
import { button } from "#6hfutrhvm6x6";
import { Icon } from "#lbkpzw8nphru";
import { locale_switcher } from "#wvgfyq72vfgf";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarMinimizeButton,
  SidebarShell,
} from "#26uyycr73i6f";
import { ThemeSelect } from "#wavczpl1zxvg";
import { primitiveStackClassName } from "#hzrmwbvgt2ax";
import { productShellLabel } from "./state.js";
import type {
  ProductShellAboutButtonProps,
  ProductShellSidebarControlsProps,
  ProductShellSidebarDefaultControlsProps,
  ProductShellSidebarFooterProps,
  ProductShellSidebarMinimizeButtonProps,
  ProductShellSidebarProps,
  ProductShellThemeToggleProps,
} from "./types.js";
import { FRONTEND_PREFIX, frontendClassName, frontendDataAttr, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type ProductShellThemeSelectProps =
Pick<ProductShellThemeToggleProps, "dark" | "light" | "modes" | "theme"> & {
  label: string;
  popoverId: string;
};

function ProductShellSidebarFooter(props: ProductShellSidebarFooterProps) {
  const { actions, children, className, ...rest } = props;
  const body = actions ?? children;
  if (!body) return null;
  return (
    <SidebarFooter
    {...rest}
    className={classNames(frontendClassName("product-shell-sidebar-footer"), className)}
    >
    {body}
    </SidebarFooter>
  );
}

function ProductShellSidebarControls(props: ProductShellSidebarControlsProps) {
  const { about, className, language, minimize, theme, ...rest } = props;
  return (
    <Card {...rest} className={classNames(frontendClassName("product-shell-sidebar-controls"), className)}>
    {minimize}
    {theme}
    {language}
    {about}
    </Card>
  );
}

function productShellControlIcon(spec: string) {
  return <Icon spec={spec} />;
}

function productShellThemeIcon(theme: unknown) {
  return productShellControlIcon(
    String(theme || "").toLowerCase() === "light"
    ? "remixicon moon-line"
    : "remixicon sun-line",
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
    className={classNames(frontendClassName("product-shell-sidebar-minimize"), className)}
    title={String(label)}
    >
    {children || (
        <>
        <span className={frontendElementClass("product-shell-sidebar-minimize", "collapse")}>
        {expandedIcon}
        </span>
        <span className={frontendElementClass("product-shell-sidebar-minimize", "expand")}>
        {minimizedIcon}
        </span>
        </>
    )}
    </SidebarMinimizeButton>
  );
}

function ProductShellSidebarDefaultControls(
  props: ProductShellSidebarDefaultControlsProps,
) {
  const {
    aboutHref,
    buttonClassName = "btn icon has-tooltip",
    controlsId,
    dark,
    idPrefix,
    labels,
    lang,
    light,
    modes,
    productName,
    side = "left",
    theme,
    ...rest
  } = props;
  const prefix = idPrefix || `product_shell_sidebar_${side}`;
  const minimizeLabel = productShellLabel(labels, "minimize");
  const themeLabel = productShellLabel(labels, "toggleTheme");
  const aboutLabel = productShellLabel(labels, "about");
  const hasIconOnlyControls = /\bicon\b/u.test(buttonClassName);
  return (
    <ProductShellSidebarControls
    {...rest}
    minimize={(
        <ProductShellSidebarMinimizeButton
        controls={controlsId}
        className={buttonClassName}
        expandedIcon={productShellControlIcon("remixicon arrow-left-s-line")}
        labels={labels}
        minimizedIcon={productShellControlIcon("remixicon arrow-right-s-line")}
        title={minimizeLabel}
        />
    )}
    theme={(
        <ProductShellThemeToggle
        dark={dark}
        id={`${prefix}_theme_toggle_btn`}
        light={light}
        modes={modes}
        className={buttonClassName}
        {...(hasIconOnlyControls ? frontendDataAttrs({ "tooltip": themeLabel }) : {})}
        icon={productShellThemeIcon(theme)}
        labels={labels}
        theme={theme}
        />
    )}
    language={locale_switcher({ id: `${prefix}_lang_switch_btn`, lang })}
    about={(
        <ProductShellAboutButton
        href={aboutHref}
        className={buttonClassName}
        icon={productShellControlIcon("remixicon information-2-line")}
        labels={labels}
        productName={productName}
        title={aboutLabel}
        />
    )}
    />
  );
}

function productShellThemeSelect(props: ProductShellThemeSelectProps) {
  return (
    <ThemeSelect
    aria-hidden="true"
    className={`popover popover-portaled ${frontendClassName("theme-switch-popover")}`}
    dark={props.dark}
    {...frontendDataAttrs({ "popover": "" })}
    id={props.popoverId}
    inert={true}
    label={props.label}
    light={props.light}
    modes={props.modes}
    optionClassName="popover-item"
    value={props.theme}
    variant="buttons"
    />
  );
}

function ProductShellThemeToggle(props: ProductShellThemeToggleProps) {
  const {
    children,
    className,
    dark,
    icon,
    labels,
    light,
    modes,
    popoverId,
    theme,
    type = "button",
    ...rest
  } = props;
  const label = productShellLabel(labels, "toggleTheme");
  const id = String(rest.id || `${FRONTEND_PREFIX}_product_shell_theme_control`);
  const themePopoverId = popoverId || `${id}_menu`;
  const body = children || icon;
  const iconOnly = !children;
  return (
    <>
    {button({
          ...rest,
          "aria-controls": themePopoverId,
          "aria-expanded": "false",
          "aria-label": props["aria-label"] || label,
          "aria-haspopup": "menu",
          children: body,
          className: classNames(frontendClassName("product-shell-theme-control"), className),
          [frontendDataAttr("popover-trigger")]: "",
          icon: iconOnly,
          id,
          title: iconOnly ? String(label) : undefined,
          tooltip: iconOnly,
          type,
    })}
    {productShellThemeSelect({
          dark,
          label: String(label),
          light,
          modes,
          popoverId: themePopoverId,
          theme,
    })}
    </>
  );
}

function ProductShellAboutButton(props: ProductShellAboutButtonProps) {
  const { children, className, href = "/about", icon, labels, productName, title, ...rest } = props;
  const label = title || productShellLabel(labels, "about");
  return (
    <a
    {...rest}
    aria-label={props["aria-label"] || String(label)}
    className={classNames(frontendClassName("product-shell-about"), className)}
    {...frontendDataAttrs({ "soft-redirect": "" })}
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
    <SidebarShell className={classNames(String(side), props.className)} id={shellId} minimized={props.minimized} persist={props.persist} side={side}>
    <Sidebar aria-label={props.ariaLabel} className={primitiveStackClassName({ gap: "sm" })}>
    <SidebarBody className={primitiveStackClassName({ className: props.bodyClassName, gap: "sm" })} id={bodyId}>
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
  ProductShellSidebarDefaultControls,
  ProductShellSidebarFooter,
  ProductShellSidebarMinimizeButton,
  ProductShellThemeToggle,
};
