import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames, dataBool } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { isSoftNavigableHref } from "#o9lroe7t0ma6";

type SidebarLinkItem = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  active?: boolean;
  badge?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  key?: string;
  label: ReactNode;
  separator?: false;
};

type SidebarSeparatorItem = {
  key?: string;
  separator: true;
};

type SidebarItem = SidebarLinkItem | SidebarSeparatorItem;

type SidebarLinkListProps = HTMLAttributes<HTMLUListElement> & {
  items: SidebarItem[];
};

type SidebarLiveSlotProps = HTMLAttributes<HTMLSpanElement> & {
  slotKey: string;
};

function isSeparatorItem(item: SidebarItem): item is SidebarSeparatorItem {
  return item.separator === true;
}

function SidebarLinkList(props: SidebarLinkListProps) {
  const { className, items, ...rest } = props;
  return (
    <ul
    {...rest}
    className={classNames(frontendClassName("sidebar-list"), className)}
    {...frontendDataAttrs({ "sidebar-list": "" })}
    >
    {items.map((item, index) => {
          if (isSeparatorItem(item)) {
            return (
              <li
              className={frontendClassName("sidebar-separator")}
              {...frontendDataAttrs({ "sidebar-separator": "" })}
              key={item.key || `separator-${index}`}
              role="separator"
              >
              <span />
              </li>
            );
          }
          return <SidebarLinkListItem item={item} key={item.key || String(item.href || index)} />;
    })}
    </ul>
  );
}

function sidebarLinkTriggerAttrs(item: SidebarLinkItem) {
  if (!isSoftNavigableHref(item)) return {};
  return frontendDataAttrs({ href: String(item.href).trim() });
}

function SidebarLinkListItem(props: { item: SidebarLinkItem }) {
  const { active, badge, disabled, icon, key: _key, label, separator: _separator, ...rest } = props.item;
  return (
    <li
    className={frontendElementClass("sidebar-list", "item")}
    {...frontendDataAttrs({ "active": dataBool(active) })}
    {...frontendDataAttrs({ "sidebar-link-row": "" })}
    >
    <a
    {...rest}
    aria-current={active ? "page" : props.item["aria-current"]}
    aria-disabled={disabled ? true : props.item["aria-disabled"]}
    className={classNames(frontendClassName("sidebar-link"), props.item.className)}
    {...frontendDataAttrs({ "disabled": dataBool(disabled) })}
    {...frontendDataAttrs({ "sidebar-link": "" })}
    {...sidebarLinkTriggerAttrs(props.item)}
    tabIndex={disabled ? -1 : props.item.tabIndex}
    >
    {icon ? (
        <span
        className={frontendElementClass("sidebar-link", "icon")}
        {...frontendDataAttrs({ "sidebar-link-icon": "" })}
        >
        {icon}
        </span>
      ) : null}
    <span
    className={frontendElementClass("sidebar-link", "label")}
    {...frontendDataAttrs({ "sidebar-label": "" })}
    >
    {label}
    </span>
    {badge ? <span className={frontendElementClass("sidebar-link", "badge")}>{badge}</span> : null}
    </a>
    </li>
  );
}

function SidebarLiveSlot(props: SidebarLiveSlotProps) {
  const { children, slotKey, ...rest } = props;
  return (
    <span {...rest} {...frontendDataAttrs({ "sidebar-live-slot": slotKey })}>
    {children}
    </span>
  );
}

export { SidebarLinkList, SidebarLiveSlot };
export type { SidebarItem, SidebarLinkItem, SidebarLinkListProps, SidebarLiveSlotProps };
