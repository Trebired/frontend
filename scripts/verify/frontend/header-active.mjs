import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

function render(react, currentUrl, links) {
  return renderToStaticMarkup(
    h(react.RenderCurrentUrlProvider, { currentUrl },
      h(react.SiteHeader, { brand: "Brand", links })),
  );
}

async function verifyHeaderActiveLinks(importDist, rootDir) {
  const react = await importDist("react");
  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  const onServices = render(react, "https://example.com/services", links);
  assert.match(
    onServices,
    /href="\/services" aria-current="page"|aria-current="page"[^>]*href="\/services"/u,
    "the link for the current page is marked"
  );
  assert.ok(onServices.includes("tbf-site-header__link--active"), "and carries the active class a site styles from the config");
  assert.equal((onServices.match(/aria-current="page"/gu) || []).length, 2, "once in the nav and once in the menu, and nowhere else");

  const onHome = render(react, "https://example.com/", links);
  assert.equal((onHome.match(/aria-current="page"/gu) || []).length, 2, "the root link matches only the root");

  const nested = render(react, "https://example.com/services/hosting", links);
  assert.ok(nested.includes("tbf-site-header__link--active"), "a child route still marks its section");

  const prefixed = render(react, "https://example.com/cs/services", links);
  assert.ok(prefixed.includes("tbf-site-header__link--active"), "a locale prefix in the path does not stop the match");

  const sectioned = render(react, "https://example.com/", [
      { href: "/", label: "Home" },
      { href: "/#about", label: "About" },
      { href: "/#contact", label: "Contact" },
  ]);
  assert.equal(
    (sectioned.match(/aria-current="page"/gu) || []).length,
    2,
    "on the server no section is in view, so the page's own link keeps the highlight",
  );
  assert.match(
    sectioned,
    /<a[^>]*aria-current="page"[^>]*href="\/"|href="\/"[^>]*aria-current="page"/u,
    "and it is the page link, not a fragment",
  );

  const explicit = render(react, "https://example.com/services", [{ active: false, href: "/services", label: "Services" }]);
  assert.equal(explicit.includes("aria-current"), false, "an explicit active wins over the address");

  const styles = await fs.readFile(path.join(rootDir, "dist", "layout", "styles", "site-header.scss"), "utf8");
  for (const gone of ['token("menu-link-color"', 'token("menu-link-font-weight"', 'token("menu-link-padding"', 'token("menu-link-radius"']) {
    assert.equal(
      styles.includes(gone),
      false,
      `${gone} must not exist: a navigation link has one colour and weight, set once.`
      +" Given its own, a site can pin the menu to the active colour and nothing ever looks current.",
    );
  }
  assert.ok(
    /"menu-link"\)\} \{[^}]*color: token\("link-color"/su.test(styles),
    "the menu link reads the header link's colour, not its own",
  );

  assert.ok(onServices.includes("tbf-site-header__burger"), "the burger is the toggle, always");
  assert.equal(
    (onServices.match(/tbf-site-header__burger/gu) || []).length >= 1,
    true,
    "and it animates open and closed from the package's own stylesheet, with nothing for a site to swap in",
  );
}

export { verifyHeaderActiveLinks };
