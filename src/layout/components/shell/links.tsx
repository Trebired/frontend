import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames } from "#ndsvdqv80epr";
import { TextLink } from "#hzrmwbvgt2ax";
import { shellPageHref } from "./state.js";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

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

function buildShellSupportLinks(props: ShellSupportLinksProps): ShellSupportLink[] {
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
  const { className, key, label, ...attrs } = link;
  return (
    <TextLink
    {...attrs}
    className={classNames(frontendElementClass("shell-support-links", "link"), className, linkClassName)}
    key={key}
    rel={attrs.rel || "noopener noreferrer"}
    target={attrs.target || "_blank"}
    >
    {label}
    </TextLink>
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
  const links = buildShellSupportLinks({
      baseHref,
      docsLabel,
      feedbackLabel,
      supportLabel,
  });
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("shell-support-links"), className)}
    {...frontendDataAttrs({ "shell-support-links": "" })}
    >
    {label ? (
        <div className={classNames(frontendElementClass("shell-support-links", "label"), labelClassName)}>
        {label}
        </div>
      ) : null}
    <div className={classNames(frontendElementClass("shell-support-links", "list"), listClassName)}>
    {links.map((link) => renderLink
        ? renderLink(link)
        : defaultSupportLink(link, linkClassName))}
    </div>
    </div>
  );
}

export { ShellSupportLinks, buildShellSupportLinks as shellSupportLinks };
export type { ShellSupportLink, ShellSupportLinksProps };
