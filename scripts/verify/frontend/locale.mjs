import assert from "node:assert/strict";

const ROUTING = { defaultLocale: "en", locales: ["en", "cs"], storageKey: "site.locale" };
const BODIES = { cs: '<header id="h">Ahoj</header>', en: '<header id="h">Hello</header>' };
const META = { cs: { description: "Popis", title: "Domů" }, en: { description: "About", title: "Home" } };
const RENDERED = "data-tbf-locale-rendered";
const PENDING = "data-tbf-locale-pending";

function verifyMatching(api) {
  const routing = api.normalizeLocaleRouting(ROUTING);
  assert.equal(api.matchLocale("CS", routing), "cs");
  assert.equal(api.matchLocale("cs-CZ", routing), "cs");
  assert.equal(api.matchLocale("de", routing), "");
  assert.equal(api.pickLocale(["de", "fr", "cs-CZ"], routing), "cs");
  assert.equal(api.normalizeLocaleRouting({ locales: ["cs"] }).defaultLocale, "cs");
  assert.equal(routing.cookieName, "ui_lang", "the static runtime must share the server language cookie");
}

function runBootScript(source, options = {}) {
  const store = new Map(options.stored ? [[ROUTING.storageKey, options.stored]] : []);
  const attrs = new Map();
  const listeners = [];
  const root = {
    getAttribute: (key) => attrs.get(key) ?? null,
    lang: "en",
    removeAttribute: (key) => attrs.delete(key),
    setAttribute: (key, value) => attrs.set(key, String(value)),
    style: {},
  };
  const languages = options.languages || ["de-DE"];
  const scope = {
    document: { addEventListener: (type) => listeners.push(type), cookie: options.cookie || "", documentElement: root },
    navigator: { language: languages[0], languages },
    window: { localStorage: { getItem: (key) => store.get(key) ?? null } },
  };
  const keys = Object.keys(scope);
  Function(...keys, source)(...keys.map((key) => scope[key]));
  return { attrs, lang: root.lang, listeners, visibility: root.style.visibility };
}

function verifyBootScript(api) {
  const source = api.createLocaleBootScript(ROUTING);
  assert.doesNotMatch(source, /location/u, "resolving the locale must never navigate");

  const none = runBootScript(source);
  assert.equal(none.lang, "en");
  assert.equal(none.attrs.get(RENDERED), "en");
  assert.equal(none.attrs.has(PENDING), false, "a matching locale must not hide the page");

  const stored = runBootScript(source, { stored: "cs" });
  assert.equal(stored.lang, "cs");
  assert.equal(stored.attrs.has(PENDING), true);
  assert.equal(stored.visibility, "hidden");
  assert.deepEqual(stored.listeners, ["DOMContentLoaded"], "a hidden page must have a reveal backstop");

  assert.equal(runBootScript(source, { cookie: "a=1; ui_lang=cs" }).lang, "cs", "the language cookie must be honoured");
  assert.equal(runBootScript(source, { languages: ["cs-CZ", "en"] }).lang, "cs", "the browser language must be honoured");
  assert.equal(runBootScript(source, { stored: "de" }).lang, "en", "an unsupported stored value must fall back");
}

function verifyIndexableRoutes(api) {
  const routing = api.normalizeLocaleRouting(ROUTING);
  const options = {
    meta: (path, locale) => ({ ...META[locale], canonical: `${locale}${path}` }),
    paths: ["/", "/about"],
    render: (path, locale) => BODIES[locale].replace("</header>", ` ${path}</header>`),
    routing,
  };

  const single = api.createLocaleShellRoutes(options);
  assert.deepEqual(single.map((route) => route.path), ["/", "/about"], "without a strategy each route is served once");

  const indexed = api.createLocaleShellRoutes({ ...options, strategy: "prefix" });
  assert.deepEqual(indexed.map((route) => route.path), ["/", "/cs", "/about", "/cs/about"]);
  const czech = indexed.find((route) => route.path === "/cs/about");
  assert.equal(czech.meta.lang, "cs");
  assert.equal(czech.meta.canonical, "cs/about", "each indexed url must carry its own locale's head");
  assert.match(czech.body, /^<!--tbf:locale-start--><header id="h">Ahoj \/about<\/header>/u, "the url's locale must be the live markup");
  assert.match(czech.body, /<template data-tbf-locale-view="en"><header id="h">Hello \/about/u, "other locales must stay switchable");

  const source = api.createLocaleBootScript(ROUTING, { strategy: "prefix" });
  const crawler = runBootScript(source, { languages: ["cs-CZ"] });
  assert.equal(crawler.lang, "en", "with indexed urls the browser language must not rewrite a page's language");
  assert.equal(crawler.attrs.has(PENDING), false);
  assert.equal(runBootScript(source, { stored: "cs" }).lang, "cs", "a saved choice must still apply");
}

function resetDocument() {
  const root = document.documentElement;
  root.lang = "";
  root.removeAttribute(RENDERED);
  root.removeAttribute(PENDING);
  root.style.visibility = "";
  document.head.innerHTML = "";
  document.body.innerHTML = "";
}

function inlineScript(html) {
  return html.match(/<script>([\s\S]*?)<\/script>/u)[1];
}

function verifyParseTimeSwap(api) {
  const body = api.createLocaleDocumentBody({ bodies: BODIES, defaultLocale: "en", meta: META });
  assert.match(body, /<template data-tbf-locale-view="cs">/u);
  assert.doesNotMatch(body, /<template data-tbf-locale-view="en">/u, "the default locale must be live markup");

  const root = document.documentElement;
  root.lang = "cs";
  root.setAttribute(RENDERED, "en");
  root.setAttribute(PENDING, "");
  document.head.innerHTML = '<title>Home</title><meta name="description" content="About">';
  document.body.innerHTML = body;
  Function(inlineScript(body))();

  assert.equal(document.getElementById("h").textContent, "Ahoj", "the stored locale must be swapped in at parse time");
  assert.equal(document.title, "Domů");
  assert.equal(document.querySelector('meta[name="description"]').getAttribute("content"), "Popis");
  assert.equal(root.getAttribute(RENDERED), "cs");
  assert.equal(root.hasAttribute(PENDING), false, "the swap must reveal the page");
  resetDocument();
}

function verifyFetchedDocumentSwap(api) {
  const body = api.createLocaleDocumentBody({ bodies: BODIES, defaultLocale: "en", meta: META });
  const parser = new document.defaultView.DOMParser();
  const html = `<!doctype html><html lang="en"><head><title>Home</title></head><body>${body}</body></html>`;

  const czech = parser.parseFromString(html, "text/html");
  assert.equal(api.applyLocaleView(czech, "cs"), true);
  assert.equal(czech.getElementById("h").textContent, "Ahoj");
  assert.equal(czech.documentElement.lang, "cs");
  assert.equal(czech.title, "Domů");

  const english = parser.parseFromString(html, "text/html");
  assert.equal(api.applyLocaleView(english, "en"), false, "the rendered locale must be left untouched");
  assert.equal(english.getElementById("h").textContent, "Hello");
}

function verifyInPlaceSwitch(api) {
  api.configureLocaleRouting(ROUTING);
  const root = document.documentElement;
  root.lang = "en";
  document.head.innerHTML = "<title>Home</title>";
  document.body.innerHTML = api.createLocaleDocumentBody({ bodies: BODIES, defaultLocale: "en", meta: META });
  const before = document.defaultView.location.href;
  const seen = [];
  const stop = api.onLocaleChanged((locale) => seen.push(locale));

  assert.equal(api.setCurrentLocale("cs"), true);
  stop();
  assert.deepEqual(seen, ["cs"], "switching must notify the rendered roots");
  assert.equal(api.currentLocale(), "cs");
  assert.equal(root.lang, "cs");
  assert.equal(document.title, "Domů");
  assert.equal(document.defaultView.location.href, before, "switching must not navigate");
  assert.equal(document.defaultView.localStorage.getItem(ROUTING.storageKey), "cs");
  assert.equal(api.setCurrentLocale("cs"), false, "an unchanged locale must not re-render");
  resetDocument();
}

async function verifyLocaleRouting(context) {
  const api = await context.importDistRoot();
  verifyMatching(api);
  verifyBootScript(api);
  verifyIndexableRoutes(api);
  verifyParseTimeSwap(api);
  verifyFetchedDocumentSwap(api);
  verifyInPlaceSwitch(api);
}

export { verifyLocaleRouting };
