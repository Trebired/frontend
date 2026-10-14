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
  assert.equal(document.lead.length, 1, "paragraphs before the first section are the lead");
  assert.equal(document.sections[0].id, "working-together", "a section carries the id an outline links to");
  assert.equal(document.sections[0].parts[0].id, "what-does-it-cost", "and so does a part");
  assert.equal(config.documentSlug("Proč je všechno veřejné"), "proc-je-vsechno-verejne", "a slug survives diacritics");
  assert.equal(config.parseTextDocument("---\ntitle: T\nupdated: 2026-01-01\n---\n\n## S\n\nB.").parts, "prose", "prose is the default");
  assert.equal(config.parseTextDocument("## No front matter\n\nBody."), null, "a document without front matter is refused");
  assert.equal(config.parseTextDocument("---\ntitle: Only\n---\n\nNo sections."), null, "and so is one with no sections");
}

async function verifyProse({ importDist }) {
  await verifyProseText({ importDist });
  verifyTextDocument(await importDist("config"));
}

export { verifyProse };
