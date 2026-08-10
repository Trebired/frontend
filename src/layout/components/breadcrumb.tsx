import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";

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
    className={classNames("tbf-breadcrumb", className)}
    data-tbf-breadcrumb=""
    >
    <ol className="tbf-breadcrumb__list">{children}</ol>
    </nav>
  );
}

function BreadcrumbItem(props: BreadcrumbItemProps) {
  const { children, className, current, href, icon, itemKey, ...rest } = props;
  const content = (
    <>
    {icon ? <span className="tbf-breadcrumb__icon" data-tbf-breadcrumb-icon="">{icon}</span> : null}
    <span className="tbf-breadcrumb__label">{children}</span>
    </>
  );
  return (
    <li className="tbf-breadcrumb__item">
    {href && !current ? (
        <a
        {...rest}
        className={classNames("tbf-breadcrumb__link", className)}
        data-tbf-breadcrumb-item=""
        data-tbf-breadcrumb-key={itemKey}
        href={href}
        >
        {content}
        </a>
      ) : (
        <span
        className={classNames("tbf-breadcrumb__current", className)}
        data-tbf-breadcrumb-current={current ? "" : undefined}
        data-tbf-breadcrumb-item=""
        data-tbf-breadcrumb-key={itemKey}
        >
        {content}
        </span>
    )}
    </li>
  );
}

export { Breadcrumb, BreadcrumbItem };
export type { BreadcrumbItemProps, BreadcrumbProps };
