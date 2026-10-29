import type { ReactNode } from "react";
import { frontendClassName, frontendElementClass } from "#5vbaqj4pirp3";

const block = "link-category";

type SiteLinkCategoryProps = {
  children?: ReactNode;
  heading: ReactNode;
  headingId?: string;
  nav?: boolean;
};

function SiteLinkCategory({ children, heading, headingId, nav = false }: SiteLinkCategoryProps) {
  const Links = nav ? "nav" : "div";
  return (
    <div className={frontendClassName(block)}>
    <h2 className={frontendElementClass(block, "heading")} id={headingId}>{heading}</h2>
    <Links aria-labelledby={nav ? headingId : undefined} className={frontendElementClass(block, "links")}>{children}</Links>
    </div>
  );
}

export { SiteLinkCategory };
export type { SiteLinkCategoryProps };
