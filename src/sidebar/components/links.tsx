import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames, dataBool } from "#ndsvdqv80epr";

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
    <ul {...rest} className={classNames("tbf-sidebar-list", className)} data-tbf-sidebar-list="">
      {items.map((item, index) => {
        if (isSeparatorItem(item)) {
          return (
            <li className="tbf-sidebar-separator" data-tbf-sidebar-separator="" key={item.key || `separator-${index}`} role="separator">
              <span />
            </li>
          );
        }
        return <SidebarLinkListItem item={item} key={item.key || String(item.href || index)} />;
      })}
    </ul>
  );
}

function SidebarLinkListItem(props: { item: SidebarLinkItem }) {
  const { active, badge, disabled, icon, key: _key, label, separator: _separator, ...rest } = props.item;
  return (
    <li className="tbf-sidebar-list__item" data-tbf-active={dataBool(active)} data-tbf-sidebar-link-row="">
      <a
        {...rest}
        aria-current={active ? "page" : props.item["aria-current"]}
        aria-disabled={disabled ? true : props.item["aria-disabled"]}
        className={classNames("tbf-sidebar-link", props.item.className)}
        data-tbf-disabled={dataBool(disabled)}
        data-tbf-sidebar-link=""
        tabIndex={disabled ? -1 : props.item.tabIndex}
      >
        {icon ? <span className="tbf-sidebar-link__icon" data-tbf-sidebar-link-icon="">{icon}</span> : null}
        <span className="tbf-sidebar-link__label" data-tbf-sidebar-label="">{label}</span>
        {badge ? <span className="tbf-sidebar-link__badge">{badge}</span> : null}
      </a>
    </li>
  );
}

function SidebarLiveSlot(props: SidebarLiveSlotProps) {
  const { children, slotKey, ...rest } = props;
  return (
    <span {...rest} data-tbf-sidebar-live-slot={slotKey}>
      {children}
    </span>
  );
}

export { SidebarLinkList, SidebarLiveSlot };
export type { SidebarItem, SidebarLinkItem, SidebarLinkListProps, SidebarLiveSlotProps };
