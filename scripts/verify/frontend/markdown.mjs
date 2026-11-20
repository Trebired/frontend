import assert from "node:assert/strict";

const README = [
  '<div align="center">',
  "",
  "# Demo Shop",
  "",
  "</div>",
  "",
  "- [Install](#install)",
  "",
  "## Install",
  "",
  "```sh",
  "bun i",
  "```",
  "",
  "<script>alert(1)</script>",
  "",
  "Inline `code` here.",
].join("\n");

async function verifyMarkdownArticle(context) {
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const react = await context.importDist("react");
  const html = renderToStaticMarkup(React.createElement(() => react.markdown_article({ markdown: README })));
  assert.match(html, /class="tbf-markdown /u, "the article carries the markdown class its styles hang on");
  assert.match(html, /<div align="center">/u, "aligned HTML blocks survive sanitising");
  assert.match(html, /<h2 id="user-content-install">/u, "headings get anchor ids");
  assert.match(html, /href="#user-content-install"/u, "in-page links point at the sanitised heading ids");
  assert.doesNotMatch(html, /alert\(1\)/u, "scripts in the markdown are removed");
  assert.match(html, /tbf-markdown__code[\s\S]*<pre[^>]*id="tbf-markdown-code-[^"]+"[\s\S]*copy-button/u, "code blocks get a copy button");
  const config = await context.importDist("config");
  const scss = config.generateFrontendScss({ forVersion: context.packageVersion });
  assert.match(scss, /markdown\/styles\/index\.scss/u, "the markdown styles load with the default systems");
}

export { verifyMarkdownArticle };
