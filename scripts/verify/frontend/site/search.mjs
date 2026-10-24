import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PAGES = {
  "/": {
    cs: "<header><a>Hlavička</a></header><main><h1><span>Vítejte</span><span>doma</span></h1><p>Úvodní text o příručce.</p></main>",
    en: [
      "<header><nav><a>Every page</a></nav></header>",
      "<main><h1><span>Made</span><span>for you</span></h1>",
      "<p>Welcome &amp; hello&nbsp;there.</p><p aria-hidden=\"true\">Decorative copy</p>",
      "<svg><text>vector words</text></svg><script>var hidden = 1;</script>",
      "<small>up to</small><strong>€240</strong></main><footer>Footer words</footer>",
    ].join(""),
  },
  "/handbook": {
    cs: "<main><h1>Příručka</h1><p>Jak se vydává repozitář.</p></main>",
    en: "<main><h1>Handbook</h1><h2 id=\"releases\">How a release reads</h2><p>Every release carries a name.</p></main>",
  },
};

function siteIndex(server) {
  return server.createSiteSearchIndex({
      locales: ["en", "cs"],
      meta: (route, locale) => ({ title: route === "/" ? "Home" : locale === "cs" ? "Příručka" : "Handbook" }),
      paths: Object.keys(PAGES),
      render: (route, locale) => PAGES[route][locale],
  });
}

async function verifySiteSearchIndex({ importDist }) {
  const server = await importDist("server");
  const files = siteIndex(server);
  const paths = files.map((file) => file.path);
  assert.deepEqual(paths, ["tbf-search/en.json", "tbf-search/cs.json"], "one index per language, under the package's own folder");
  const en = JSON.parse(files[0].contents);
  const home = en.pages[0];
  assert.equal(en.version, 1);
  assert.match(home.text, /Welcome & hello there\./u, "entities are decoded");
  for (const absent of ["Every page", "Footer words", "Decorative copy", "vector words", "hidden"]) {
    assert.ok(!home.text.includes(absent), `only the page's readable content is indexed, not ${JSON.stringify(absent)}`);
  }
  assert.equal(home.sections[0].title, "Made for you", "elements laid out as lines stay separate words");
  assert.match(home.text, /up to €240/u, "and so do neighbouring labels");
  assert.deepEqual(
    en.pages[1].sections[1],
    { id: "releases", title: "How a release reads" },
    "a heading keeps its id, so a result can open its section"
  );
  assert.ok(!files[1].contents.includes("Handbook"), "the Czech index holds only Czech pages");
  return { cs: JSON.parse(files[1].contents), en };
}

async function verifySiteSearchQuery(context, indexes) {
  const query = await import(pathToFileURL(path.join(context.distDir, "search", "site", "query.js")).href);
  const en = query.preparePages(indexes.en.pages);
  const release = query.searchSite(en, "release");
  assert.equal(release[0].href, "/handbook#releases", "a match in a heading links to that section");
  assert.ok(release[0].snippet.some((part) => part.mark && /release/iu.test(part.text)), "the snippet marks what matched");
  assert.equal(query.searchSite(en, "release welcome").length, 0, "every word of the query has to match");
  const cs = query.searchSite(query.preparePages(indexes.cs.pages), "prirucka repozitar");
  assert.equal(cs[0]?.path, "/handbook", "accents are ignored, so a query typed without them still finds the page");
  assert.equal(cs[0]?.title, "Příručka", "and the page keeps its own spelling");
}

async function verifySiteSearchLoader(context) {
  const load = await import(pathToFileURL(path.join(context.distDir, "search", "site", "load.js")).href);
  const requests = [];
  const original = globalThis.fetch;
  let fail = true;
  globalThis.fetch = async(url) => {
    requests.push(String(url));
    if (fail) return new Response("", { status: 503 });
    return new Response(JSON.stringify({ pages: [], version: 1 }), { status: 200 });
  };
  try {
    await assert.rejects(() => load.loadSiteSearch("cs"), /503/u, "a missing index is reported");
    fail = false;
    assert.deepEqual(await load.loadSiteSearch("cs"), [], "and asked for again on the next search");
    await load.loadSiteSearch("cs");
    assert.deepEqual(requests, ["/tbf-search/cs.json", "/tbf-search/cs.json"], "the index for the reader's language is fetched once it loads");
  } finally {
    globalThis.fetch = original;
  }
}

async function verifySiteSearchHeader(context) {
  const { importDist } = context;
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement: h } = await import("react");
  const react = await importDist("react");
  (await context.importDistRoot()).configureSiteLinks({
      links: { about: { href: "/about" }, x: { href: "/x" } },
      messages: { cs: { groups: { all: "Vše", other: "Jiné" }, links: { about: "O nás", x: "X" } } },
      sets: { site: { header: [{ group: "all", links: ["about"], search: true }, { group: "other", links: ["x"] }] } },
    }, { set: "site" });
  const html = renderToStaticMarkup(h(react.SiteHeader, { brand: "Site", lang: "cs" }));
  const fields = html.match(/class="tbf-input tbf-site-header__search-input"/gu)?.length;
  assert.equal(fields, 2, "a searchable group carries the field in the band and in the mobile menu");
  assert.ok(html.includes('placeholder="Hledat na všech stránkách"'), "the field speaks the header's language");
  assert.ok(!html.includes("tbf-site-header__search-results"), "nothing is listed before a query is typed");
  const field = await fs.readFile(path.join(context.distDir, "inputs", "styles", "field.scss"), "utf8");
  assert.ok(field.includes('ns.css-var("ui-input-root-bg")') && field.includes('ns.css-var("ui-input-root-border")'),
  "an application sets the input's background and border through primitives.input");
  assert.ok(field.includes("outline: var(#{ns.css-var(\"border-width\")}, 1px) solid transparent;") && field.includes("outline-color var("),
  "focus fades its ring in instead of snapping, because the ring is always there and only its colour changes");
  const tone = await fs.readFile(path.join(context.distDir, "styles", "utils", "_tone.scss"), "utf8");
  assert.ok(tone.includes('$plain:\n"ground",') && tone.includes('ns.css-var("ground")}: var(#{ns.css-var("dark-ground")}'),
  "every tone region carries its own ground, so chrome paints with one adaptive colour");
  const header = await fs.readFile(path.join(context.distDir, "layout", "styles", "site", "header.scss"), "utf8");
  assert.ok(header.includes('token("root-bg", var(#{ns.css-var("ground")}') && !header.includes("shell-header-surface"),
  "the header has no background system of its own");
}

async function verifySiteSearch(context) {
  const indexes = await verifySiteSearchIndex(context);
  await verifySiteSearchQuery(context, indexes);
  await verifySiteSearchLoader(context);
  await verifySiteSearchHeader(context);
}

export { verifySiteSearch };
