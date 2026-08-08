import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames } from "#ndsvdqv80epr";
import { shellPageHref } from "./state.js";

type ShellSupportLink = AnchorHTMLAttributes<HTMLAnchorElement> & {
  key: string;
  label: ReactNode;
};

type ShellSupportLinksProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  baseHref?: string;
  docsLabel?: ReactNode;
  feedbackLabel?: ReactNode;
  label?: ReactNode;
  labelClassName?: string;
  linkClassName?: string;
  listClassName?: string;
  renderLink?: (link: ShellSupportLink) => ReactNode;
  supportLabel?: ReactNode;
};

function shellSupportLinks(props: ShellSupportLinksProps): ShellSupportLink[] {
  return [
    {
      href: shellPageHref(props.baseHref, "/docs"),
      key: "docs",
      label: props.docsLabel ?? "Docs",
    },
    {
      href: shellPageHref(props.baseHref, "/feedback"),
      key: "feedback",
      label: props.feedbackLabel ?? "Feedback",
    },
    {
      href: shellPageHref(props.baseHref, "/support"),
      key: "support",
      label: props.supportLabel ?? "Support",
    },
  ];
}

function defaultSupportLink(
  link: ShellSupportLink,
  linkClassName: string | undefined,
) {
  const { key, label, ...attrs } = link;
  return (
    <a
      {...attrs}
      className={classNames("tbf-shell-support-links__link", linkClassName)}
      key={key}
      rel={attrs.rel || "noopener noreferrer"}
      target={attrs.target || "_blank"}
    >
      {label}
    </a>
  );
}

function ShellSupportLinks(props: ShellSupportLinksProps) {
  const {
    baseHref,
    className,
    docsLabel,
    feedbackLabel,
    label,
    labelClassName,
    linkClassName,
    listClassName,
    renderLink,
    supportLabel,
    ...rest
  } = props;
  const links = shellSupportLinks({
    baseHref,
    docsLabel,
    feedbackLabel,
    supportLabel,
  });
  return (
    <div
      {...rest}
      className={classNames("tbf-shell-support-links", className)}
      data-tbf-shell-support-links=""
    >
      {label ? (
        <div className={classNames("tbf-shell-support-links__label", labelClassName)}>
          {label}
        </div>
      ) : null}
      <div className={classNames("tbf-shell-support-links__list", listClassName)}>
        {links.map((link) => renderLink
          ? renderLink(link)
          : defaultSupportLink(link, linkClassName))}
      </div>
    </div>
  );
}

export { ShellSupportLinks, shellSupportLinks };
export type { ShellSupportLink, ShellSupportLinksProps };
