import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type BreadcrumbProps = HTMLAttributes<HTMLElement> & {
  label?: string;
};

type BreadcrumbItemProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  current?: boolean;
  icon?: ReactNode;
  itemKey?: string;
};

function Breadcrumb(props: BreadcrumbProps) {
  const { children, className, label = "Breadcrumb", ...rest } = props;
  return (
    <nav
    {...rest}
    aria-label={label}
    className={classNames(frontendClassName("breadcrumb"), className)}
    {...frontendDataAttrs({ "breadcrumb": "" })}
    >
    <ol className={frontendElementClass("breadcrumb", "list")}>{children}</ol>
    </nav>
  );
}

function BreadcrumbItem(props: BreadcrumbItemProps) {
  const { children, className, current, href, icon, itemKey, ...rest } = props;
  const content = (
    <>
    {icon ? <span className={frontendElementClass("breadcrumb", "icon")} {...frontendDataAttrs({ "breadcrumb-icon": "" })}>{icon}</span> : null}
    <span className={frontendElementClass("breadcrumb", "label")}>{children}</span>
    </>
  );
  return (
    <li className={frontendElementClass("breadcrumb", "item")}>
    {href && !current ? (
        <a
        {...rest}
        className={classNames(frontendElementClass("breadcrumb", "link"), className)}
        {...frontendDataAttrs({ "breadcrumb-item": "" })}
        {...frontendDataAttrs({ "breadcrumb-key": itemKey })}
        href={href}
        >
        {content}
        </a>
      ) : (
        <span
        className={classNames(frontendElementClass("breadcrumb", "current"), className)}
        {...frontendDataAttrs({ "breadcrumb-current": current ? "" : undefined })}
        {...frontendDataAttrs({ "breadcrumb-item": "" })}
        {...frontendDataAttrs({ "breadcrumb-key": itemKey })}
        >
        {content}
        </span>
    )}
    </li>
  );
}

export { Breadcrumb, BreadcrumbItem };
export type { BreadcrumbItemProps, BreadcrumbProps };
