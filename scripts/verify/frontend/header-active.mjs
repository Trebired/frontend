import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

function render(react, currentUrl, links) {
  return renderToStaticMarkup(
    h(react.RenderCurrentUrlProvider, { currentUrl },
      h(react.SiteHeader, { brand: "Brand", links })),
  );
}

async function verifyHeaderActiveLinks(importDist) {
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

  const fragments = render(react, "https://example.com/", [
      { href: "/#about", label: "About" },
      { href: "/#contact", label: "Contact" },
  ]);
  assert.equal(fragments.includes("aria-current"), false, "fragment links share a path, so none of them is resolved from the address");

  const explicit = render(react, "https://example.com/services", [{ active: false, href: "/services", label: "Services" }]);
  assert.equal(explicit.includes("aria-current"), false, "an explicit active wins over the address");
}

export { verifyHeaderActiveLinks };
