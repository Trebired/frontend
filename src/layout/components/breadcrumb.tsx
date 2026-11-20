import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Children, isValidElement, useId } from "react";
import { copy_button } from "#k632wzgl64a3";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type BreadcrumbProps = HTMLAttributes<HTMLElement> & {
  copy?: boolean;
  copyLabel?: string;
  copyValue?: string;
  label?: string;
  lang?: string;
};

type BreadcrumbItemProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  current?: boolean;
  icon?: ReactNode;
  itemKey?: string;
  softRedirect?: boolean;
};

function breadcrumbLabels(children: ReactNode) {
  return Children.toArray(children)
  .map((child) => (isValidElement<{ children?: ReactNode }>(child) ? child.props.children : null))
  .filter((label) => typeof label === "string" || typeof label === "number")
  .map(String);
}

function BreadcrumbCopy(props: { children: ReactNode; label?: string; lang?: string; value?: string }) {
  const id = `${frontendClassName("breadcrumb")}-copy-${useId().replace(/[^a-zA-Z0-9_-]/gu, "")}`;
  const value = typeof props.value === "string" ? props.value : breadcrumbLabels(props.children).join("/");
  return (
    <span className={frontendElementClass("breadcrumb", "copy")}>
    <code hidden id={id} {...frontendDataAttrs({ "breadcrumb-copy-value": "" })}>{value}</code>
    {copy_button({ lang: props.lang, size: "sm", target: id, title: props.label, tooltip: props.label })}
    </span>
  );
}

function Breadcrumb(props: BreadcrumbProps) {
  const { children, className, copy, copyLabel, copyValue, label = "Breadcrumb", lang, ...rest } = props;
  return (
    <nav
    {...rest}
    aria-label={label}
    className={classNames(frontendClassName("breadcrumb"), className)}
    {...frontendDataAttrs({ "breadcrumb": "", "breadcrumb-copyable": copy ? "" : undefined })}
    >
    <ol className={frontendElementClass("breadcrumb", "list")}>{children}</ol>
    {copy ? <BreadcrumbCopy label={copyLabel} lang={lang} value={copyValue}>{children}</BreadcrumbCopy> : null}
    </nav>
  );
}

function BreadcrumbItem(props: BreadcrumbItemProps) {
  const { children, className, current, href, icon, itemKey, softRedirect, ...rest } = props;
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
        {...frontendDataAttrs({ "soft-redirect": softRedirect === true ? "" : undefined })}
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
