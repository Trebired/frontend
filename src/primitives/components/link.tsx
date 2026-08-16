import type { AnchorHTMLAttributes, ReactNode } from "react";
import { joinClassNames } from "./shared.js";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";

type TextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  external?: boolean;
};

function linkTarget(target: string | undefined, external: boolean | undefined) {
  if (target) return target;
  return external === true ? "_blank" : undefined;
}

function linkRel(rel: string | undefined, target: string | undefined) {
  return target === "_blank" ? rel || "noopener noreferrer" : rel;
}

function TextLink(props: TextLinkProps) {
  const { children, className, external, rel, target, ...rest } = props;
  const resolvedTarget = linkTarget(target, external);
  return (
    <a
    {...rest}
    className={joinClassNames(frontendClassName("text-link"), "text-link", className)}
    {...frontendDataAttrs({ "text-link": "" })}
    rel={linkRel(rel, resolvedTarget)}
    target={resolvedTarget}
    >
    {children}
    </a>
  );
}

function text_link(props: TextLinkProps) {
  return <TextLink {...props} />;
}

export { TextLink, text_link };
export type { TextLinkProps };
