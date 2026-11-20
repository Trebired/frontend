import type { ReactNode } from "react";
import { useId } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import {
  Text,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
import { toText as articleText } from "#ndsvdqv80epr";
import { copy_button } from "#k632wzgl64a3";
import { frontendClassName, frontendElementClass } from "#5vbaqj4pirp3";

type MarkdownArticleProps = {
  className?: string;
  emptyText?: ReactNode;
  lang?: string;
  linkClassName?: string;
  markdown?: unknown;
  urlTransform?: (url: string) => string;
};

const CLOBBER_PREFIX = String(defaultSchema.clobberPrefix || "user-content-");

function anchorHref(href: unknown) {
  const value = articleText(href);
  if (!value.startsWith("#") || value.startsWith(`#${CLOBBER_PREFIX}`)) return value || undefined;
  return `#${CLOBBER_PREFIX}${value.slice(1)}`;
}

function MarkdownCode(props: { children?: ReactNode; lang?: string; preProps: Record<string, unknown> }) {
  const id = `${frontendClassName("markdown")}-code-${useId().replace(/[^a-zA-Z0-9_-]/gu, "")}`;
  return (
    <div className={frontendElementClass("markdown", "code")}>
    <pre {...props.preProps} id={id}>{props.children}</pre>
    <span className={frontendElementClass("markdown", "copy")}>{copy_button({ lang: props.lang, size: "sm", target: id })}</span>
    </div>
  );
}

function markdownComponents(props: MarkdownArticleProps) {
  const linkClassName = articleText(props.linkClassName);
  return {
    a({ node: _node, className, href, ...anchorProps }: any) {
      return <a {...anchorProps} className={[linkClassName, className].filter(Boolean).join(" ") || undefined} href={anchorHref(href)} />;
    },
    pre({ node: _node, children, ...preProps }: any) {
      return <MarkdownCode lang={props.lang} preProps={preProps}>{children}</MarkdownCode>;
    },
  };
}

function articleClassName(props: MarkdownArticleProps) {
  const base = articleText(props.className) || primitiveTextClassName({ breakWord: true });
  return [frontendClassName("markdown"), base].join(" ");
}

function markdown_article(props: MarkdownArticleProps) {
  const markdown = articleText(props.markdown);
  if (!markdown) {
    return (
      <Text as="p" muted>
      {props.emptyText || "Nothing to show."}
      </Text>
    );
  }
  return (
    <div className={articleClassName(props)}>
    <Markdown
    components={markdownComponents(props)}
    rehypePlugins={[rehypeRaw, rehypeSlug, rehypeSanitize]}
    remarkPlugins={[remarkGfm]}
    urlTransform={props.urlTransform}
    >
    {markdown}
    </Markdown>
    </div>
  );
}

export { markdown_article };
export type { MarkdownArticleProps };
export default markdown_article;
