import assert from "node:assert/strict";

const LINKS_CONFIG = {
  categories: { help: ["source", "security"], how: ["process"], who: ["about", "team"] },
  links: {
    about: { href: "/about" },
    alpha: { href: "#a" },
    beta: { href: "#b" },
    blog: { href: "/blog" },
    downloads: { href: "/downloads", site: "app" },
    process: { href: "/process" },
    security: { href: "/security", site: "main" },
    source: { external: true, href: "https://example.com/source" },
    team: { href: "/team" },
  },
  messages: {
    cs: {
      categories: { help: "Pomoc", how: "Jak", who: "Kdo" },
      groups: { more: "Více", short: "Krátce" },
      links: {
        about: "o nás", alpha: "Alfa", beta: "Beta", blog: "Blog", downloads: "Ke stažení", process: "postup", security: "Bezpečnost",
        source: "Zdroj", team: "tým",
      },
    },
    en: {
      categories: { help: "Help", how: "How", who: "Who" },
      descriptions: { about: "about line", process: "process line", team: "team line" },
      groups: { more: "More", short: "Short" },
      links: {
        about: "about", alpha: "Alpha", beta: "Beta", blog: "Blog", downloads: "Downloads", process: "process", security: "Security",
        source: "Source", team: "team",
      },
    },
  },
  sets: {
    app: { footer: { columns: [["help"]], note: ["security"], site: ["downloads"] }, header: ["downloads", "source"] },
    empty: {},
    grouped: { header: ["blog", { group: "more", sitemap: true }, { group: "short", links: ["alpha", "beta"] }], sitemap: ["who", "how"] },
    plain: { header: ["alpha", "beta"] },
  },
};

async function useLinks(context, set, origins) {
  (await context.importDistRoot()).configureSiteLinks(LINKS_CONFIG, { origins, set });
}

function refuses(configure, config, message, why) {
  assert.throws(() => configure(config, { set: "plain" }), (error) => error.message.includes(message), why);
}

async function verifyLinksConfig(context) {
  const { configureSiteLinks } = await context.importDistRoot();
  const broken = (patch) => ({ ...LINKS_CONFIG, ...patch });
  refuses(configureSiteLinks, broken({ sets: { plain: { header: ["missing"] } } }), 'names "missing", which is not a link',
  "a set that names a link the config does not define is refused");
  refuses(configureSiteLinks, broken({ categories: { who: ["nobody"] } }), 'names "nobody", which is not a link',
  "a category that names an undefined link is refused");
  refuses(configureSiteLinks, broken({ messages: { en: { ...LINKS_CONFIG.messages.en, links: { alpha: "Alpha" } } } }), "has no label for",
  "every link needs a label in every language, so no link renders as its key");
  refuses(configureSiteLinks, broken({ sets: { plain: { header: [{ group: "more" }] } } }), "needs links or sitemap: true",
  "a header group without links or the sitemap is refused");
  assert.throws(() => configureSiteLinks(LINKS_CONFIG, { set: "nowhere" }), /no set named "nowhere"/u,
  "naming a set the config does not have is refused");
  const { normalizeFrontendConfig } = await context.importDist("config");
  assert.equal(normalizeFrontendConfig({ forVersion: context.packageVersion, links: LINKS_CONFIG }).links.icon, "remixicon:external-link-line",
  "links are part of the frontend config and validated with the rest of it");
}

async function verifyExternalLinks(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement: h } = await import("react");
  const react = await context.importDist("react");
  await useLinks(context, "app", { app: "https://app.example", main: "https://main.example" });
  const header = renderToStaticMarkup(h(react.LocaleProvider, { locale: "en" }, h(react.SiteHeader, { brand: "Site", softRedirect: true })));
  const external = /<a class="tbf-text-link" href="https:\/\/example\.com\/source" rel="noopener noreferrer" target="_blank">/u;
  assert.match(header, external, "an external link opens in a new tab without handing over the opener");
  assert.match(header, /tbf-text-link__external">Source<[^]*?tbf-icon/u, "and carries the external icon after its label");
  assert.ok(!/href="https:\/\/example\.com\/source"[^>]*data-tbf-soft-redirect/u.test(header), "and never soft-navigates");
  assert.ok(header.includes('href="/downloads"'), "a link on the set's own site stays a path");
  const props = { brand: "Site", note: "©", site: { brand: "App" } };
  const footer = renderToStaticMarkup(h(react.LocaleProvider, { locale: "cs" }, h(react.SiteFooter, props)));
  assert.match(footer, /<div class="tbf-link-category"><h2 class="tbf-link-category__heading">Pomoc<\/h2><nav class="tbf-link-category__links">/u,
  "footer columns are the set's categories, headed in the reader's language, as the same link category the header menu uses");
  assert.match(footer, external, "the same external link opens the same way in the footer");
  assert.match(footer, /tbf-text-link__external">Zdroj</u, "with the same icon");
  assert.ok(footer.includes('href="https://main.example/security?setlang=cs"'),
  "a link that belongs to another site gets that site's origin and hands the reader's language over");
  assert.match(footer, /tbf-site-footer__site-links[^]*?Ke stažení/u, "the site band lists the set's own site links");
  assert.match(footer, /tbf-site-footer__note-links[^]*?Bezpečnost/u, "the note lists the set's note links beside the note");
  assert.ok(!footer.includes("tbf-site-footer__credit"), "a footer carries no credit unless the site turns it on");
}

async function verifyFooterCredit(context) {
  const react = await context.importDist("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const el = (await import("react")).createElement;
  const render = (locale, credit) => renderToStaticMarkup(el(react.LocaleProvider, { locale }, el(react.SiteFooter, { credit, note: "©" })));
  assert.match(
    render("cs", true),
    new RegExp(
      '<span class="tbf-site-footer__credit">Vytvořil <a class="tbf-text-link" href="https://trebired\\.com" rel="noopener" target="_blank">'
      +'<span class="tbf-text-link__external">Trebired<',
      "u",
    ),
    "credit names Trebired in the reader's language and opens trebired.com in a new tab, keeping the referrer",
  );
  const other = render("en", { href: "https://example.com", name: "Example" });
  assert.match(
    other,
    /Made by <a class="tbf-text-link" href="https:\/\/example\.com"[^>]*>[^]*?Example</u,
    "a site can credit another maker by name and address"
  );
}

async function verifySiteLinks(context) {
  await verifyLinksConfig(context);
  await verifyExternalLinks(context);
  await verifyFooterCredit(context);
}

export { useLinks, verifySiteLinks };
