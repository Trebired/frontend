import type { HTMLAttributes, ReactNode } from "react";
import { languageDirection } from "./direction.js";

type LangFragmentProps = HTMLAttributes<HTMLSpanElement> & {
  as?: "div" | "p" | "span";
  children?: ReactNode;
  lang: string;
};

function LangFragment(props: LangFragmentProps) {
  const { as = "span", children, lang, ...rest } = props;
  const Tag = as;
  const direction = languageDirection(lang);
  return (
    <Tag {...rest} dir={direction === "rtl" ? "rtl" : undefined} lang={lang}>
    {children}
    </Tag>
  );
}

export { LangFragment };
export type { LangFragmentProps };
