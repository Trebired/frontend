import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";

type MobileBottomBarProps = HTMLAttributes<HTMLElement>;

type MobileBottomBarItemProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean;
  badge?: ReactNode;
  icon?: ReactNode;
};

function MobileBottomBar(props: MobileBottomBarProps) {
  const { children, className, ...rest } = props;
  return (
    <nav
      {...rest}
      className={classNames("tbf-mobile-bottom-bar", className)}
      data-tbf-layout-bottom-bar=""
      data-tbf-mobile-bottom-bar=""
    >
      <div className="tbf-mobile-bottom-bar__items">{children}</div>
    </nav>
  );
}

function MobileBottomBarItem(props: MobileBottomBarItemProps) {
  const { active, badge, children, className, icon, ...rest } = props;
  return (
    <a
      {...rest}
      aria-current={active ? "page" : props["aria-current"]}
      className={classNames("tbf-mobile-bottom-bar__item", className)}
      data-tbf-active={active ? "true" : undefined}
    >
      {icon ? <span className="tbf-mobile-bottom-bar__icon">{icon}</span> : null}
      <span className="tbf-mobile-bottom-bar__label">{children}</span>
      {badge ? <span className="tbf-mobile-bottom-bar__badge">{badge}</span> : null}
    </a>
  );
}

export { MobileBottomBar, MobileBottomBarItem };
export type { MobileBottomBarItemProps, MobileBottomBarProps };
