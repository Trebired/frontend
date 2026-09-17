import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { MobileNavToggleButton } from "./header.js";
import { MobileBottomBar, MobileBottomBarItem } from "./mobile.js";

type BottomBarItem = {
  active?: boolean;
  badge?: ReactNode;
  className?: string;
  controls?: string;
  href?: string;
  icon?: ReactNode;
  id?: string;
  key?: string;
  label?: ReactNode;
  node?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
};

type BottomBarProps = HTMLAttributes<HTMLElement> & {
  itemClassName?: string;
  items: BottomBarItem[];
};

function bottomBarItemBody(item: BottomBarItem) {
  return (
    <>
    {item.icon ? <span className={frontendElementClass("mobile-bottom-bar", "icon")}>{item.icon}</span> : null}
    <span className={frontendElementClass("mobile-bottom-bar", "label")}>{item.label}</span>
    {item.badge ? <span className={frontendElementClass("mobile-bottom-bar", "badge")}>{item.badge}</span> : null}
    </>
  );
}

function BottomBarEntry(props: { item: BottomBarItem; itemClassName?: string }) {
  const { item, itemClassName } = props;
  if (item.node !== undefined) return <>{item.node}</>;
  const className = classNames(frontendElementClass("mobile-bottom-bar", "item"), itemClassName, item.className);
  if (item.controls) {
    return (
      <MobileNavToggleButton aria-label={typeof item.label === "string" ? item.label : undefined} className={className} controls={item.controls}
      id={item.id} onClick={item.onClick} surface={false}>
      {bottomBarItemBody(item)}
      </MobileNavToggleButton>
    );
  }
  if (item.href) {
    return (
      <MobileBottomBarItem active={item.active} badge={item.badge} className={classNames(itemClassName, item.className)} href={item.href}
      icon={item.icon} id={item.id} onClick={item.onClick}>
      {item.label}
      </MobileBottomBarItem>
    );
  }
  return (
    <button
    className={className}
    id={item.id}
    onClick={item.onClick}
    type="button"
    {...frontendDataAttrs({ "active": item.active ? "true" : undefined })}
    >
    {bottomBarItemBody(item)}
    </button>
  );
}

function BottomBar(props: BottomBarProps) {
  const { itemClassName, items, ...rest } = props;
  return (
    <MobileBottomBar {...rest}>
    {items.map((item, index) => (
          <BottomBarEntry item={item} itemClassName={itemClassName} key={item.key || item.id || item.href || index} />
    ))}
    </MobileBottomBar>
  );
}

export { BottomBar };
export type { BottomBarItem, BottomBarProps };
