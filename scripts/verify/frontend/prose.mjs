import assert from "node:assert/strict";

const SECTIONS = [
  "---",
  "title: Questions",
  "updated: 2026-10-14",
  "parts: disclosure",
  "---",
  "",
  "A lead paragraph before any section.",
  "",
  "## Working together",
  "",
  "### What does it cost",
  "",
  "One price, agreed in <!--tbf:link /pricing-->writing<!--/tbf:link--> before anything starts.",
  "",
  "A second paragraph.",
  "",
  "## Plain section",
  "",
  "No parts here, only a paragraph.",
].join("\n");

function render(markup, text, props = {}) {
  return markup.renderToStaticMarkup(markup.create(markup.ProseText, { text, ...props }));
}

async function verifyProseText({ importDist }) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement: create } = await import("react");
  const react = await importDist("react");
  const markup = { ProseText: react.ProseText, create, renderToStaticMarkup };

  const marked = render(markup, "Read <!--tbf:link /philosophy-->the philosophy page<!--/tbf:link--> for why.", { softRedirect: true });
  assert.match(marked, /<a[^>]+href="\/philosophy"/u, "a marked span becomes a link to the path it declares");
  assert.match(marked, /data-tbf-soft-redirect/u, "an internal link soft redirects when the caller asks for it");
  assert.match(marked, />the philosophy page</u, "the label is the text between the markers");
  assert.equal(marked.includes("<!--"), false, "a marker is never shown to a reader");

  const tab = render(markup, "Get it from <!--tbf:link https://github.com/Trebired tab-->GitHub<!--/tbf:link-->.");
  assert.match(tab, /target="_blank"/u, "the tab flag opens a new tab");
  assert.match(tab, /rel="noopener noreferrer"/u, "and a new tab carries its rel");
  assert.equal(tab.includes("data-tbf-soft-redirect"), false, "a link leaving the site never soft redirects");

  const reload = render(markup, "Start at <!--tbf:link /downloads reload-->downloads<!--/tbf:link-->.", { softRedirect: true });
  assert.match(reload, /href="\/downloads"/u, "the reload flag keeps the link");
  assert.equal(reload.includes("data-tbf-soft-redirect"), false, "the reload flag navigates fully instead");

  const unknown = render(markup, "Read <!--tbf:link /philosophy loud-->the philosophy page<!--/tbf:link--> for why.");
  assert.equal(unknown.includes("<a"), false, "an unknown flag drops the annotation rather than guessing");
  assert.equal(unknown.includes("<!--"), false, "and still shows no marker");
  assert.match(unknown, /the philosophy page/u, "the text itself survives");

  const unclosed = render(markup, "Read <!--tbf:link /philosophy-->the philosophy page for why.");
  assert.equal(unclosed.includes("<a"), false, "an unclosed marker makes no link");
  assert.match(unclosed, /the philosophy page for why\./u, "and loses none of the prose");

  const bracket = render(markup, "Read [the philosophy page](/philosophy) for why.", { softRedirect: true });
  assert.match(bracket, /<a[^>]+href="\/philosophy"[^>]*>/u, "the bracket form means the same thing in code");

  assert.equal(render(markup, "Nothing to link here."), "Nothing to link here.", "plain prose passes through untouched");
}

function verifyTextDocument(config) {
  const document = config.parseTextDocument(SECTIONS);
  assert.equal(document.title, "Questions", "front matter carries the title");
  assert.equal(document.updated, "2026-10-14", "and the date the document was last changed");
  assert.equal(document.sections.length, 2, "every section with content is read");
  assert.equal(document.sections[0].parts.length, 1, "a section with parts holds them instead of paragraphs");
  assert.equal(document.sections[0].parts[0].body.length, 2, "a part keeps each paragraph as its own block");
  assert.match(document.sections[0].parts[0].body[0], /<!--tbf:link \/pricing-->/u, "annotations reach the renderer untouched");
  assert.equal(document.sections[1].body.length, 1, "a section without parts keeps its own paragraphs");
  assert.equal(document.parts, "disclosure", "the document says how its parts are presented");
  assert.equal(document.outline, true, "a document carries an outline unless it refuses one");
  assert.equal(
    config.parseTextDocument("---\ntitle: T\nupdated: 2026-01-01\noutline: false\n---\n\n## S\n\nB.").outline,
    false,
    "and a document can refuse one in its front matter",
  );
  assert.equal(document.lead.length, 1, "paragraphs before the first section are the lead");
  assert.equal(document.sections[0].id, "working-together", "a section carries the id an outline links to");
  assert.equal(document.sections[0].parts[0].id, "what-does-it-cost", "and so does a part");
  assert.equal(config.documentSlug("Proč je všechno veřejné"), "proc-je-vsechno-verejne", "a slug survives diacritics");
  assert.equal(config.parseTextDocument("---\ntitle: T\nupdated: 2026-01-01\n---\n\n## S\n\nB.").parts, "prose", "prose is the default");
  assert.equal(config.parseTextDocument("## No front matter\n\nBody."), null, "a document without front matter is refused");
  assert.equal(config.parseTextDocument("---\ntitle: Only\n---\n\nNo sections."), null, "and so is one with no sections");
}

function railedMarkup(render, config) {
  return render(config.parseTextDocument(SECTIONS), { outline: true });
}

function verifyHeadingLevels(html, proseHtml) {
  for (const [markup, mode] of [[html, "disclosure"], [proseHtml, "prose"]]) {
    const levels = [...markup.matchAll(/<h([1-6])/gu)].map((m) => Number(m[1]));
    assert.deepEqual(
      [...new Set(levels)].sort(),
      [2, 3],
      `a ${mode} document is a section heading and a part heading and nothing else, so its outline never skips a level`,
    );
  }
}

function verifyArticle(markup) {
  assert.match(
    markup,
    /<article[^>]*data-tbf-document/u,
    "a document is an <article>, the element a browser's own reader mode weighs when it decides what to extract",
  );
  assert.equal(
    (markup.match(/<article/gu) || []).length,
    1,
    "exactly one, since a nested article is a second candidate for a reader to pick instead of the whole document",
  );
  const article = markup.slice(markup.indexOf("<article"), markup.indexOf("</article>"));
  assert.equal(
    article.includes("<nav"),
    false,
    "and its outline rail sits outside it, because navigation inside an article is what a reader is told to drop",
  );
  assert.match(markup, /<aside[^>]*page-outline-layout__rail/u, "that rail is an <aside>");
  assert.equal((markup.match(/<p>/gu) || []).length > 0, true, "the prose is in real paragraphs, which is what readers score");
}

function verifyOutlineBoot(markup) {
  const first = markup.indexOf("tbf-page-outline__link");
  assert.notEqual(first, -1, "an outline renders its links");
  assert.match(
    markup.slice(Math.max(0, first - 120), first + 120),
    /aria-current="true"/u,
    "the server marks the first section active, so an outline is never blank before it hydrates",
  );
  assert.match(
    markup,
    /outline-marker-top/u,
    "and ships a script that places the marker before the first paint",
  );
  assert.match(
    markup,
    /getEntriesByType\('navigation'\)/u,
    "which reads the navigation type, because a reload restores a scroll position the address no longer describes",
  );
  assert.match(
    markup,
    /sessionStorage\.setItem/u,
    "and records the section it leaves on, so a reload comes back to it rather than to a stale hash",
  );
  assert.match(
    markup,
    /pagehide',function\(\)\{try\{var k=document\.querySelector/u,
    "it finds the current link when the page is left rather than holding the node it booted with, which a soft navigation replaces",
  );
  assert.match(
    markup,
    /setItem\(P\+location\.pathname/u,
    "and keys the saved section by the address the page is left from, not the one it was first loaded at",
  );
}

function verifyIndentStyles(indent) {
  assert.match(indent, /"typography-indent-"/u, "the indent is its own system with its own token group");
  assert.match(indent, /padding-inline-start: token\("size"/u, "its step is a token");
  assert.match(indent, /border-inline-start: token\(\n\s*"border"/u, "and its rule variant draws the border from one too");
  const flow = ":where(h1, h2, h3, h4, h5, h6) ~ :where(p, blockquote):not(:where(#{$centered}, #{$centered} *))";
  assert.ok(indent.includes(`${flow} {`), "text that follows a heading steps in, except where it is centered");
  assert.ok(indent.includes('padding-inline-start: token("flow", 0px);'), "by the flow token, which is zero until an application sets it");
  assert.match(indent, /\$centered: .*text-center.*error-page__body/u, "centered text is never indented, so it stays centered");
  assert.ok(indent.includes("@supports (width: calc(1px * sqrt(1em / 1rem)))"), "the indent measures itself where the browser can divide lengths");
  assert.ok(indent.includes("calc(#{$step} * (1em / 1rem) * sqrt(#{$title} / #{$reference}))"),
  "and scales with its own text and with the root of its heading's size, so small text under a small title is not pushed far in");
  assert.ok(indent.includes("@each $level in 6, 5, 4, 3, 2, 1"), "a block's largest heading names the title every indent inside it measures");
}

async function verifyIndent({ importDist, rootDir }) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement: create } = await import("react");
  const react = await importDist("react");
  const config = await importDist("config");
  const render = (doc, extra) => renderToStaticMarkup(create(react.TextDocumentBody, { document: doc, ...extra }));
  const html = render(config.parseTextDocument(SECTIONS));
  const proseHtml = render(config.parseTextDocument(SECTIONS.replace("parts: disclosure\n", "")));

  verifyHeadingLevels(html, proseHtml);

  verifyIndentStyles(await fs.readFile(path.join(rootDir, "dist", "indent", "styles", "index.scss"), "utf8"));

  const document = await fs.readFile(path.join(rootDir, "dist", "document", "styles", "index.scss"), "utf8");
  assert.equal(
    document.includes("indent"),
    false,
    "the document stylesheet owns none of it: a document wears the class like anything else can",
  );

  assert.equal(
    /tbf-indent[^"]*"[^>]*>\s*<ul[^>]*text-document__list/u.test(html),
    false,
    "a disclosure section's cells are never indented: they already inset their own text",
  );
  assert.equal(
    (html.match(/tbf-indent/gu) || []).length,
    1,
    "only the section it renders as prose is indented, and the card list beside it is not",
  );
  assert.equal(
    (proseHtml.match(/tbf-indent/gu) || []).length,
    3,
    "a section indents its body once, and a part that carries a heading indents its paragraphs once more",
  );

  const railed = railedMarkup(render, config);
  verifyOutlineBoot(railed);
  verifyArticle(railed);
} async function verifyProse({ importDist, rootDir }) {

  await verifyProseText({ importDist });
  verifyTextDocument(await importDist("config"));
  await verifyIndent({ importDist, rootDir });
}

export { verifyProse };
