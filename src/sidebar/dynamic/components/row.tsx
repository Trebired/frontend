import type { AnchorHTMLAttributes, ReactNode } from "react";
import { dataBool } from "#ndsvdqv80epr";
import { actionTriggerAttrs } from "#6mupcizo1mwq";
import {
  DynamicSidebarCountSlot,
  DynamicSidebarIcon,
  DynamicSidebarLoaderSlot,
  DynamicSidebarStateSlot,
} from "./slots.js";
import type {
  DynamicSidebarContext,
  DynamicSidebarItem,
  DynamicSidebarItemContext,
  DynamicSidebarLinkItem,
  DynamicSidebarLinkListProps,
} from "#9w9ch5jtlv9e";
import {
  dynamicSidebarLinkActive,
  dynamicSidebarLinkDisabled,
  textValue,
} from "#yv4ubgils4dc";
import { frontendClassName, frontendDataAttr, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

const DYNAMIC_SIDEBAR_DISABLED_LINK_CLASS = `${frontendClassName("sidebar-link")} sidebar-link-btn`;

function DynamicSidebarPermanentDisabledLink(props: {
    context: DynamicSidebarItemContext;
    renderIcon?: DynamicSidebarLinkListProps["renderIcon"];
}) {
  return (
    <button
    aria-disabled="true"
    className={DYNAMIC_SIDEBAR_DISABLED_LINK_CLASS}
    {...frontendDataAttrs({ "disabled": "true" })}
    {...frontendDataAttrs({ "sidebar-link": "" })}
    disabled
    type="button"
    >
    <DynamicSidebarIcon context={props.context} render={props.renderIcon} />
    <span className={frontendElementClass("sidebar-link", "label")} {...frontendDataAttrs({ "sidebar-label": "" })}>
    {props.context.item.label}
    </span>
    </button>
  );
}

function dynamicSidebarLinkAttrs(
  context: DynamicSidebarItemContext,
  href: string,
  dynamicDisabled: boolean,
): AnchorHTMLAttributes<HTMLAnchorElement> & Record<string, unknown> {
  return {
    "aria-current": context.active ? "page" as const : undefined,
    "aria-disabled": dynamicDisabled && context.disabled ? true : undefined,
    "data-nav-ignore": context.item.navIgnore ? "true" : undefined,
    [frontendDataAttr("active")]: dataBool(context.active),
    [frontendDataAttr("disabled")]: dynamicDisabled && context.disabled ? "true" : undefined,
    [frontendDataAttr("sidebar-disabled-path")]: dynamicDisabled
    ? textValue(context.item.disabledPath)
    : undefined,
    [frontendDataAttr("sidebar-link")]: "",
    [frontendDataAttr("sidebar-link-active")]: context.active ? "1" : undefined,
    [frontendDataAttr("sidebar-link-disabled")]: dynamicDisabled && context.disabled ? "1" : undefined,
    [frontendDataAttr("sidebar-link-dynamic")]: dynamicDisabled ? "1" : undefined,
    href,
    tabIndex: dynamicDisabled && context.disabled ? -1 : undefined,
  };
}

function DynamicSidebarLinkNode(props: {
    actionTrigger: boolean;
    context: DynamicSidebarItemContext;
    dynamicDisabled: boolean;
    href: string;
    options: DynamicSidebarLinkListProps;
    sidebar: DynamicSidebarContext;
}) {
  const { context, options, sidebar } = props;
  const countPath = textValue(context.item.countPath);
  const statePath = textValue(context.item.statePath);
  return (
    <a
    className={frontendClassName("sidebar-link")}
    {...dynamicSidebarLinkAttrs(context, props.href, props.dynamicDisabled)}
    {...(props.actionTrigger ? actionTriggerAttrs({ href: props.href }) : {})}
    >
    <DynamicSidebarIcon context={context} render={options.renderIcon} />
    <span className={frontendElementClass("sidebar-link", "label")} {...frontendDataAttrs({ "sidebar-label": "" })}>
    {context.item.label}
    </span>
    {statePath ? (
        <DynamicSidebarStateSlot
        active={context.active}
        context={context}
        path={statePath}
        render={options.renderState}
        sidebar={sidebar}
        />
      ) : null}
    {countPath ? (
        <DynamicSidebarCountSlot
        active={context.active}
        context={context}
        path={countPath}
        render={options.renderCount}
        sidebar={sidebar}
        visibility={context.item.countVisibility === "active" ? "active" : "always"}
        />
      ) : null}
    <DynamicSidebarLoaderSlot
    active={context.active}
    context={context}
    item={context.item}
    render={options.renderLoader}
    sidebar={sidebar}
    />
    </a>
  );
}

function wrapDynamicSidebarLink(
  node: ReactNode,
  href: string,
  context: DynamicSidebarItemContext,
  options: DynamicSidebarLinkListProps,
) {
  if (context.item.disabled === true) {
    return (
      <DynamicSidebarPermanentDisabledLink
      context={context}
      renderIcon={options.renderIcon}
      />
    );
  }
  if (options.wrapLink) return options.wrapLink(node, { ...context, href });
  return node;
}

function dynamicSidebarLinkActionTrigger(
  href: string,
  context: DynamicSidebarItemContext,
  options: DynamicSidebarLinkListProps,
) {
  return Boolean(
    href &&
      href !== "#" &&
      context.item.navIgnore !== true &&
      options.actionTrigger !== false &&
      !options.wrapLink,
  );
}

function DynamicSidebarLinkRow(props: {
    currentPath: string;
    index: number;
    item: DynamicSidebarLinkItem;
    options: DynamicSidebarLinkListProps;
    sidebar: DynamicSidebarContext;
}) {
  const href = textValue(props.item.href, "#");
  const disabled = dynamicSidebarLinkDisabled(props.sidebar, props.item);
  const context = {
    active: dynamicSidebarLinkActive(props.currentPath, props.item, disabled),
    disabled,
    item: props.item,
    sidebar: props.sidebar,
  };
  const dynamicDisabled =
  Boolean(textValue(props.item.disabledPath)) && props.item.disabled !== true;
  const node = (
    <DynamicSidebarLinkNode
    actionTrigger={dynamicSidebarLinkActionTrigger(href, context, props.options)}
    context={context}
    dynamicDisabled={dynamicDisabled}
    href={href}
    options={props.options}
    sidebar={props.sidebar}
    />
  );
  return (
    <li
    className={frontendElementClass("sidebar-list", "item")}
    {...frontendDataAttrs({ "active": dataBool(context.active) })}
    {...frontendDataAttrs({ "sidebar-link-row": "" })}
    {...frontendDataAttrs({ "sidebar-link-row-active": context.active ? "1" : undefined })}
    key={props.item.key || `${href}_${props.index}`}
    >
    {wrapDynamicSidebarLink(node, href, context, props.options)}
    </li>
  );
}

function DynamicSidebarDivider(props: { index: number; item: DynamicSidebarItem }) {
  return (
    <li
    aria-hidden="true"
    className="sidebar-separator"
    {...frontendDataAttrs({ "sidebar-separator": "" })}
    key={props.item.key || `sidebar_divider_${props.index}`}
    role="separator"
    >
    <span />
    </li>
  );
}

export { DynamicSidebarDivider, DynamicSidebarLinkRow };
