import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

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
    className={classNames(frontendClassName("mobile-bottom-bar"), className)}
    {...frontendDataAttrs({ "layout-bottom-bar": "" })}
    {...frontendDataAttrs({ "mobile-bottom-bar": "" })}
    >
    <div className={frontendElementClass("mobile-bottom-bar", "items")}>{children}</div>
    </nav>
  );
}

function MobileBottomBarItem(props: MobileBottomBarItemProps) {
  const { active, badge, children, className, icon, ...rest } = props;
  return (
    <a
    {...rest}
    aria-current={active ? "page" : props["aria-current"]}
    className={classNames(frontendElementClass("mobile-bottom-bar", "item"), className)}
    {...frontendDataAttrs({ "active": active ? "true" : undefined })}
    >
    {icon ? <span className={frontendElementClass("mobile-bottom-bar", "icon")}>{icon}</span> : null}
    <span className={frontendElementClass("mobile-bottom-bar", "label")}>{children}</span>
    {badge ? <span className={frontendElementClass("mobile-bottom-bar", "badge")}>{badge}</span> : null}
    </a>
  );
}

export { MobileBottomBar, MobileBottomBarItem };
export type { MobileBottomBarItemProps, MobileBottomBarProps };
