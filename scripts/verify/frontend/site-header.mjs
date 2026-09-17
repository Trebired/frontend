import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const LINKS = [{ href: "#a", label: "Alpha" }, { href: "#b", label: "Beta" }];

async function verifySiteHeaderMarkup(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement: h } = await import("react");
  const react = await context.importDist("react");
  const html = renderToStaticMarkup(h(react.SiteHeader, {
        actions: h("button", { type: "button" }, "Lang"), brand: "Site", labels: { openMenu: "Open" }, links: LINKS, softRedirect: true,
  }));
  assert.ok(html.includes('data-tbf-site-header-open="false"'), "the site header starts closed");
  assert.ok(html.includes('aria-expanded="false"') && html.includes('aria-label="Open"'), "the menu toggle carries its state and label");
  assert.ok(/class="tbf-site-header__menu"[^>]*inert=""/u.test(html), "a closed menu is inert so its links are not focusable");
  assert.equal(html.match(/tbf-site-header__menu-link"/gu)?.length, 2, "the mobile menu lists every link");
  assert.equal(html.match(/tbf-site-header__link"/gu)?.length, 2, "the desktop nav lists every link");
  assert.ok(html.includes("tbf-site-header__menu-footer"), "actions are repeated in the mobile menu footer");
  assert.ok(html.includes("data-tbf-soft-redirect"), "softRedirect marks the header links");
  const plain = renderToStaticMarkup(h(react.SiteHeader, { actions: "Lang", brand: "Site" }));
  assert.ok(plain.includes('data-tbf-site-header-menu="false"') && !plain.includes("tbf-site-header__toggle"),
  "a header without links has no menu toggle and keeps its actions visible");
  const root = await context.importDistRoot();
  assert.equal(root.siteHeaderRootHtml("<header></header>"), '<div data-tbf-site-header-root=""><header></header></div>');
  assert.equal(root.SITE_HEADER_ROOT_SELECTOR, "[data-tbf-site-header-root]");
  const styles = await fs.readFile(path.join(context.distDir, "layout", "styles", "site-header.scss"), "utf8");
  assert.ok(styles.includes('token("root-bg"') && styles.includes('token("px"'), "header tokens use the emitted token names");
  assert.match(styles, /"menu-content"\)\} \{\n {2}width: 100%;/u, "the menu content spans the header width instead of shrinking");
}

async function verifySiteHeaderBehaviour(context) {
  const { createElement: h } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { flushSync } = await import("react-dom");
  const react = await context.importDist("react");
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  flushSync(() => root.render(h(react.SiteHeader, { actions: h("a", { href: "#cta" }, "CTA"), brand: "Site", links: LINKS })));
  const header = () => host.querySelector("[data-tbf-site-header]").getAttribute("data-tbf-site-header-open");
  const click = (selector) => flushSync(() => host.querySelector(selector).click());
  const wait = () => new Promise((resolve) => setTimeout(resolve, 20));
  const view = document.defaultView;
  click(".tbf-site-header__toggle");
  assert.equal(header(), "true", "the toggle opens the menu");
  assert.equal(host.querySelector(".tbf-site-header__toggle").getAttribute("aria-expanded"), "true");
  click(".tbf-site-header__menu-link");
  assert.equal(header(), "false", "choosing a link closes the menu");
  click(".tbf-site-header__toggle");
  click(".tbf-site-header__menu-footer a");
  assert.equal(header(), "false", "a link among the menu actions closes the menu");
  click(".tbf-site-header__toggle");
  await wait();
  flushSync(() => document.dispatchEvent(new view.KeyboardEvent("keydown", { key: "Escape" })));
  assert.equal(header(), "false", "Escape closes the menu");
  click(".tbf-site-header__toggle");
  await wait();
  const outside = document.createElement("p");
  document.body.appendChild(outside);
  flushSync(() => outside.dispatchEvent(new view.PointerEvent("pointerdown", { bubbles: true })));
  assert.equal(header(), "false", "pressing outside the header closes the menu");
  flushSync(() => root.unmount());
  host.remove();
  outside.remove();
}

async function verifyGenericBottomBar(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement: h } = await import("react");
  const react = await context.importDist("react");
  const html = renderToStaticMarkup(h(react.BottomBar, {
        itemClassName: "extra",
        items: [
          { active: true, href: "/home", icon: "H", label: "Home" },
          { key: "custom", node: h("span", { id: "custom_item" }, "Custom") },
          { controls: "nav_menu", label: "Menu" },
          { label: "Action" },
        ],
  }));
  assert.ok(html.includes('href="/home"') && html.includes('aria-current="page"'), "link items render as bar links");
  assert.ok(html.includes('id="custom_item"'), "custom nodes render as given");
  assert.ok(/<button[^>]*aria-controls="nav_menu"[^>]*data-tbf-mobile-nav-toggle/u.test(html), "controls items toggle a mobile nav");
  assert.ok(!/aria-controls="nav_menu"[^>]*class="[^"]*tbf-button/u.test(html), "a menu item has no button surface");
  assert.equal(html.match(/tbf-mobile-bottom-bar__item extra/gu)?.length, 3, "every built-in item carries the bar item class");
}

async function verifySiteChrome(context) {
  await verifySiteHeaderMarkup(context);
  await verifySiteHeaderBehaviour(context);
  await verifyGenericBottomBar(context);
}

export { verifySiteChrome };
