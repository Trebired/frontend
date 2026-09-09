import assert from "node:assert/strict";

const ROUTING = { defaultLocale: "en", locales: ["en", "cs"], storageKey: "site.locale" };

function verifyPathHelpers(api) {
  const routing = api.normalizeLocaleRouting(ROUTING);
  assert.equal(api.buildLocalePathname("/", "en", routing), "/");
  assert.equal(api.buildLocalePathname("/", "cs", routing), "/cs");
  assert.equal(api.buildLocalePathname("/about", "cs", routing), "/cs/about");
  assert.equal(api.buildLocalePathname("/about/", "cs", routing), "/cs/about");

  assert.deepEqual(api.parseLocalePathname("/cs/about", routing), {
      locale: "cs",
      pathname: "/about",
      prefixed: true,
    });
  assert.deepEqual(api.parseLocalePathname("/about", routing), {
      locale: "en",
      pathname: "/about",
      prefixed: false,
    });
  assert.equal(api.parseLocalePathname("/cs", routing).pathname, "/");
}

function verifyShellRoutes(api) {
  const routing = api.normalizeLocaleRouting(ROUTING);
  const routes = api.localeShellRoutes(["/", "/about"], routing);
  assert.deepEqual(routes.map((route) => route.path), ["/", "/about", "/cs", "/cs/about"]);
  assert.deepEqual(routes.map((route) => route.outFile), [
    "index.html",
    "about/index.html",
    "cs/index.html",
    "cs/about/index.html",
  ]);
  assert.deepEqual(routes.map((route) => route.sourcePath), ["/", "/about", "/", "/about"]);
}

function verifyMatching(api) {
  const routing = api.normalizeLocaleRouting(ROUTING);
  assert.equal(api.matchLocale("CS", routing), "cs");
  assert.equal(api.matchLocale("cs-CZ", routing), "cs");
  assert.equal(api.matchLocale("de", routing), "");
  assert.equal(api.pickLocale(["de", "fr", "cs-CZ"], routing), "cs");
  assert.equal(api.normalizeLocaleRouting({ locales: ["cs"] }).defaultLocale, "cs");
}

function runBootScript(source, url, stored) {
  const store = new Map();
  if (stored) store.set(ROUTING.storageKey, stored);
  const target = new URL(url);
  const replaced = [];
  const element = { lang: "" };
  const scope = {
    document: { documentElement: element },
    location: {
      hash: target.hash,
      pathname: target.pathname,
      replace: (value) => replaced.push(value),
      search: target.search,
    },
    navigator: { language: "de-DE", languages: ["de-DE"] },
    window: { localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) } },
  };
  const keys = Object.keys(scope);
  Function(...keys, source)(...keys.map((key) => scope[key]));
  return { lang: element.lang, replaced, stored: store.get(ROUTING.storageKey) };
}

function verifyBootScript(api) {
  const source = api.createLocaleBootScript(ROUTING);

  const none = runBootScript(source, "https://x.test/", "");
  assert.deepEqual(none.replaced, [], "no preference must not redirect");
  assert.equal(none.lang, "en");

  const preferred = runBootScript(source, "https://x.test/", "cs");
  assert.deepEqual(preferred.replaced, ["/cs"], "stored preference must redirect before paint");

  const deep = runBootScript(source, "https://x.test/about?a=1#b", "cs");
  assert.deepEqual(deep.replaced, ["/cs/about?a=1#b"], "redirect must preserve search and hash");

  const explicit = runBootScript(source, "https://x.test/cs/about", "en");
  assert.deepEqual(explicit.replaced, [], "explicit url locale must win over stored preference");
  assert.equal(explicit.lang, "cs");
  assert.equal(explicit.stored, "cs", "explicit url locale must be persisted");

  const settled = runBootScript(source, "https://x.test/cs", "cs");
  assert.deepEqual(settled.replaced, [], "matching url must not redirect");
}

async function verifyLocaleRouting(context) {
  const api = await context.importDistRoot();
  verifyMatching(api);
  verifyPathHelpers(api);
  verifyShellRoutes(api);
  verifyBootScript(api);
}

export { verifyLocaleRouting };
