import type { ReactNode } from "react";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import {
  Text,
  primitiveStackClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";

type MarkdownArticleProps = {
  className?: string;
  emptyText?: ReactNode;
  lang?: string;
  linkClassName?: string;
  markdown?: unknown;
  urlTransform?: (url: string) => string;
};

function articleText(value: unknown) {
  return String(value == null ? "" : value).trim();
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
  const linkClassName = articleText(props.linkClassName);
  const components = linkClassName
    ? {
        a({ node: _node, className, ...anchorProps }: any) {
          return (
            <a
              {...anchorProps}
              className={[linkClassName, className].filter(Boolean).join(" ")}
            />
          );
        },
      }
    : undefined;
  return (
    <div
      className={articleText(props.className) ||
        primitiveStackClassName({
          className: primitiveTextClassName({
            breakWord: true,
            className: "markdown-article",
          }),
          gap: "sm",
        })}
    >
      <Markdown
        components={components}
        rehypePlugins={[rehypeSanitize]}
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
