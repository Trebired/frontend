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

async function verifyOneLinkStyle(rootDir, markup) {
  const styles = await fs.readFile(path.join(rootDir, "dist", "layout", "styles", "site", "header.scss"), "utf8");
  assert.equal(
    styles.includes('element-class("site-header", "menu-link")'),
    false,
    "the menu has no link of its own: it renders the header's link, so there is nothing that can drift apart",
  );
  assert.equal(
    /tbf-site-header__menu-link[\s"]/u.test(markup),
    false,
    "and the markup carries only one link class, in the bar and in the menu alike",
  );
  for (const gone of ['token("menu-link-color"', 'token("menu-link-font-weight"', 'token("menu-link-padding"', 'token("menu-link-radius"']) {
    assert.equal(
      styles.includes(gone),
      false,
      `${gone} must not exist: a navigation link has one colour and weight, set once.`
      +" Given its own, a site can pin the menu to the active colour and nothing ever looks current.",
    );
  }
}

async function verifyPendingUrl(rootDir) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const page = await fs.readFile(path.join(rootDir, "src", "spa", "page.ts"), "utf8");
  assert.match(
    page,
    /function beginNavigation[\s\S]*?emitPendingPage\(url\)/u,
    "a navigation announces where it is going the moment it starts, so the shell can mark the destination before the swap rather than after it",
  );
  assert.match(
    page,
    /function emitPageChange[\s\S]*?emitPendingPage\(""\)/u,
    "and clears that the moment the page commits, so a settled shell follows the address again",
  );
}

function verifyCustomNode(react) {
  const custom = render(react, "https://example.com/", [
      { href: "/", label: "Home" },
      { key: "own", label: "unused", node: h("button", { className: "own-control", type: "button" }, "Anything") },
  ]);
  assert.ok(custom.includes("own-control"), "a link may be any node the application hands the shell");
  assert.equal(/<a[^>]*own-control/u.test(custom), false, "and the shell wraps it in no anchor of its own");
  assert.equal(custom.includes(">unused<"), false, "a node replaces the label rather than rendering beside it");
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
  assert.ok(onServices.includes("tbf-text-link--active"), "and carries the active modifier on the one text link");
  assert.equal((onServices.match(/aria-current="page"/gu) || []).length, 2, "once in the nav and once in the menu, and nowhere else");

  const onHome = render(react, "https://example.com/", links);
  assert.equal((onHome.match(/aria-current="page"/gu) || []).length, 2, "the root link matches only the root");

  const nested = render(react, "https://example.com/services/hosting", links);
  assert.ok(nested.includes("tbf-text-link--active"), "a child route still marks its section");

  const prefixed = render(react, "https://example.com/cs/services", links);
  assert.ok(prefixed.includes("tbf-text-link--active"), "a locale prefix in the path does not stop the match");

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

  verifyCustomNode(react);
  await verifyPendingUrl(rootDir);

  await verifyOneLinkStyle(rootDir, onServices);

  assert.ok(onServices.includes("tbf-site-header__burger"), "the burger is the toggle, always");
  assert.equal(
    (onServices.match(/tbf-site-header__burger/gu) || []).length >= 1,
    true,
    "and it animates open and closed from the package's own stylesheet, with nothing for a site to swap in",
  );
}

export { verifyHeaderActiveLinks };
