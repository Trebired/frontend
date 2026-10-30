import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import { useLinks, verifySiteLinks } from "./links.mjs";
import { verifySitePages } from "./../pages.mjs";

async function verifySiteHeaderMarkup(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement: h } = await import("react");
  const react = await context.importDist("react");
  await useLinks(context, "plain");
  const html = renderToStaticMarkup(h(react.SiteHeader, {
        actions: h("button", { type: "button" }, "Lang"), brand: "Site", labels: { openMenu: "Open" }, softRedirect: true,
  }));
  assert.ok(html.includes('data-tbf-site-header-open="false"'), "the site header starts closed");
  assert.ok(html.includes('aria-expanded="false"') && html.includes('aria-label="Open"'), "the menu toggle carries its state and label");
  assert.ok(/class="tbf-site-header__menu"[^>]*inert=""/u.test(html), "a closed menu is inert so its links are not focusable");
  assert.equal(
    html.match(/tbf-text-link[\s"]/gu)?.length,
    4,
    "every link appears twice, in the bar and in the menu, and both are the one text link",
  );
  assert.equal(/tbf-site-header__menu-link[\s"]/u.test(html), false, "the menu builds no link of its own");
  const headerOnly = await fs.readFile(new URL("../../../../src/layout/styles/site/header.scss", import.meta.url), "utf8");
  const menuOnly = await fs.readFile(new URL("../../../../src/layout/styles/site/menu.scss", import.meta.url), "utf8");
  const header = `${headerOnly}\n${menuOnly}`;
  assert.ok(
    !header.includes('ns.css-var("glass-bg")'),
    "the bar and its menu are opaque rather than glass, so the navigation is readable at every scroll position",
  );
  assert.match(
    header,
    /html:not\(#\{ns\.data\("header-tone"\)\}\) body:has\(main > #\{ns\.data\("dark"\)\}:first-child\)/u,
    "a page opened at the top gets its tone from the first band, in CSS, before anything runs",
  );
  assert.match(
    header,
    /html#\{ns\.data\("header-tone", "dark"\)\}/u,
    "a page reopened where it was left gets the tone it had, from the boot script",
  );
  assert.match(
    header,
    /:not\(#\{ns\.data\("light"\)\}\),/u,
    "and both step aside once the measurement has set a light tone",
  );
  assert.match(
    header,
    /#\{ns\.data\("site-header"\)\}#\{ns\.data\("dark"\)\}/u,
    "a header over a dark band carries the same marker the band does, so one attribute drives ink, border, menu and logo",
  );
  const toneScript = (await context.importDistRoot()).createSiteHeaderToneScript();
  assert.match(toneScript, /data-tbf-site-header/u, "the tone script finds the header by its own marker");
  assert.match(toneScript, /main > \*, \[data-tbf-site-footer\]/u, "and reads the page's own bands and the footer");
  assert.match(
    toneScript,
    /o=document\.documentElement;if\(o\.getAttribute\(T\)!==c\)o\.setAttribute\(T,c\)/u,
    "the tone lands on the document, never on the header React hydrates, so there is no mismatch to patch up",
  );
  assert.ok(
    !/h\.setAttribute/u.test(toneScript),
    "and the script never writes an attribute onto a rendered element",
  );
  assert.match(toneScript, /addEventListener\('scroll'/u, "it keeps up with scrolling");
  assert.match(toneScript, /tbf:page-change/u, "and with a soft navigation");
  assert.ok(html.includes("tbf-site-header__menu-footer"), "actions are repeated in the mobile menu footer");
  assert.ok(html.includes("data-tbf-soft-redirect"), "softRedirect marks the header links");
  await useLinks(context, "empty");
  const plain = renderToStaticMarkup(h(react.SiteHeader, { actions: "Lang", brand: "Site" }));
  assert.ok(plain.includes('data-tbf-site-header-menu="false"') && !plain.includes("tbf-site-header__toggle"),
  "a header without links has no menu toggle and keeps its actions visible");
  const root = await context.importDistRoot();
  assert.equal(root.siteHeaderRootHtml("<header></header>"), '<div data-tbf-site-header-root=""><header></header></div>');
  assert.equal(root.SITE_HEADER_ROOT_SELECTOR, "[data-tbf-site-header-root]");
  const styles = [
    await fs.readFile(path.join(context.distDir, "layout", "styles", "site", "header.scss"), "utf8"),
    await fs.readFile(path.join(context.distDir, "layout", "styles", "site", "menu.scss"), "utf8"),
  ].join("\n");
  assert.ok(styles.includes('token("root-bg"'), "header tokens use the emitted token names");
  assert.match(
    styles,
    /@include band\(token\("bar-px", var\(#\{ns\.css-var\("container-px"\)\}, 1\.5rem\)\)\);/u,
    "the brand sits at the page gutter, so the bar lines up with everything under it",
  );
  assert.match(
    styles,
    /@include band\(token\("bar-px-wide", token\("bar-px"/u,
    "and an application can set a different one once there is room for the full bar",
  );
  assert.equal(
    styles.match(/max-width: calc\(#\{token\("max-width", 72rem\)\} \+ #\{\$gutter\} \* 2\);/gu)?.length,
    2,
    "max-width names the content band, the gutter sits outside it, and the bar and the menu read it the same way",
  );
  assert.ok(
    !/max-width: token\("max-width"/u.test(styles),
    "so a wide window cannot leave the brand inset by one gutter while everything under it starts at the page edge",
  );
  assert.match(styles, /"menu-content"\)\} \{\n {2}width: 100%;/u, "the menu content spans the header width instead of shrinking");
  assert.match(styles, /"toggle"\)\} \{.*?width: 3rem;.*?font-size: 2rem;/su, "the menu toggle is one fixed size, not a per-site option");
  assert.ok(!styles.includes('token("toggle-size"') && !styles.includes('token("toggle-icon-size"'), "the toggle size is not configurable");
  assert.match(styles, /:root \{\n {2}#\{ns\.css-var\("shell-header-height"\)\}: 5rem;/su, "every site header is the same height");
  assert.ok(!styles.includes('token("bar-min-height"'), "the header height is not a per-site option");
  const brandRule = styles.split('#{ns.class("button")}#{ns.class("site-header-brand-button")} {')[1] || "";
  const brandBody = brandRule.split("\n}")[0];
  for (const own of ["padding-inline: 0;", "padding-block: 4px;", "color: var("]) {
    assert.ok(
      brandBody.includes(own),
      `the brand button sets ${own} where it outranks the plain button rule, which is emitted after it`,
    );
  }

  for (const fixed of [
      'token("height"',
      'token("link-font-size"',
      'token("menu-link-font-size"',
      'token("brand-logo-height"',
      'token("px"',
      "shell-header-brand-button-padding",
  ]) {
    assert.ok(!styles.includes(fixed), `${fixed} must stay fixed rather than become a per-site option`);
  }
}

async function verifySiteHeaderBehaviour(context) {
  const { createElement: h } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { flushSync } = await import("react-dom");
  const react = await context.importDist("react");
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await useLinks(context, "plain");
  flushSync(() => root.render(h(react.SiteHeader, { actions: h("a", { href: "#cta" }, "CTA"), brand: "Site" })));
  const header = () => host.querySelector("[data-tbf-site-header]").getAttribute("data-tbf-site-header-open");
  const click = (selector) => flushSync(() => host.querySelector(selector).click());
  const wait = () => new Promise((resolve) => setTimeout(resolve, 20));
  const view = document.defaultView;
  click(".tbf-site-header__toggle");
  assert.equal(header(), "true", "the toggle opens the menu");
  assert.equal(host.querySelector(".tbf-site-header__toggle").getAttribute("aria-expanded"), "true");
  click(".tbf-site-header__menu-links .tbf-text-link");
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

async function verifySiteHeaderSheetMarkup(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement: h } = await import("react");
  const react = await context.importDist("react");
  await useLinks(context, "grouped");
  const html = renderToStaticMarkup(h(react.SiteHeader, { brand: "Site" }));
  assert.ok(!html.includes("data-tbf-popover"), "a group opens the header's own band, never a popover");
  assert.equal(html.match(/class="tbf-site-header__sheet"/gu)?.length, 1, "every group shares the one band under the bar");
  const closed = /class="tbf-site-header__sheet"[^>]*inert=""[^>]*data-tbf-site-header-sheet="closed"/u;
  assert.match(html, closed, "the band starts closed and inert");
  const trigger = /<button aria-controls="([^"]+)"[^>]*aria-expanded="false" class="tbf-site-header__nav-trigger"/gu;
  assert.ok(!/<button[^>]*aria-current[^>]*tbf-site-header__nav-trigger/u.test(html), "a group is a menu, not a page, so it never shows as current");
  const triggers = [...html.matchAll(trigger)];
  assert.equal(triggers.length, 2, "each group is a button that says what it controls and whether it is open");
  for (const [, id] of triggers) {
    assert.ok(html.includes(`id="${id}"`), "and the section it controls is in the markup for crawlers and no-script readers");
  }
  assert.ok(
    html.includes('data-tbf-site-header-layout="columns"'),
    "a group of groups lays out as columns",
  );
  assert.ok(html.includes('data-tbf-site-header-layout="list"'), "a group of plain links lays out as a list");
  const headings = [...html.matchAll(/<h2 class="tbf-site-header__sheet-heading" id="([^"]+)"/gu)].map((match) => match[1]);
  assert.equal(headings.length, 2, "every column has a real h2, the level below none, sized like an h5");
  assert.equal(html.match(/class="tbf-site-header__sheet-links tbf-scroll-min"/gu)?.length, 2,
  "a column's links sit on their heading's edge and scroll with the slim scrollbar once they pass the height cap");
  assert.ok(!html.includes("tbf-indent"), "header links are navigation, not prose, so nothing in the header is indented");
  for (const id of headings) assert.ok(html.includes(`aria-labelledby="${id}"`), "and the column is a group named by it");
  assert.equal(html.match(/tbf-site-header__sheet-description/gu)?.length, 3, "each described link shows its line in the band");
  assert.match(html, /class="tbf-site-header__sheet-entry"[^>]*><span class="tbf-text-link">about<\/span>/u,
  "a band link's label is the same text link as the bar, so only the label takes its colour, states and underline");
  assert.equal(html.match(/<div class="tbf-link-category"><h2 class="tbf-link-category__heading"/gu)?.length, 2,
  "the mobile menu keeps the column headings, as the same link category the footer uses");
  assert.match(html, /tbf-site-header__menu-group-label[^>]*><span class="tbf-text-link">More<\/span>/u,
  "a group in the mobile menu is labelled by the same text link as every other entry");
  const menu = html.split('class="tbf-site-header__menu"')[1] || "";
  assert.ok(!menu.includes("sheet-description"), "and leaves the descriptions out, so the menu stays a short list");
  const styles = await fs.readFile(path.join(context.distDir, "layout", "styles", "site", "sheet.scss"), "utf8");
  assert.ok(
    styles.includes('background: var(#{ns.css-var("ground")}, #fff);'),
    "the band paints with the tone's ground, the same adaptive colour as the bar, so it follows its tone",
  );
  assert.ok(!/token\("sheet-/u.test(styles), "the band's layout is fixed, the same in every application");
  assert.ok(styles.includes("clip-path: inset(0 0 100% 0);") && !styles.includes("grid-template-rows: 0fr"),
  "the band opens at its full height behind a wipe, so its content never overflows mid-animation and no scrollbar flashes");
  const place = await fs.readFile(new URL("../../../../src/popover/index.ts", import.meta.url), "utf8");
  assert.ok(place.includes("popover.offsetWidth") && place.includes("documentElement.clientWidth"),
  "a popover is placed by its laid-out size inside the scrollbar, not by the box its opening scale shrinks");
}

async function verifySiteHeaderSheetBehaviour(context) {
  const { createElement: h } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { flushSync } = await import("react-dom");
  const react = await context.importDist("react");
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await useLinks(context, "grouped");
  flushSync(() => root.render(h(react.SiteHeader, { brand: "Site" })));
  const sheet = () => host.querySelector(".tbf-site-header__sheet").getAttribute("data-tbf-site-header-sheet");
  const trigger = (index) => host.querySelectorAll(".tbf-site-header__nav-trigger")[index];
  const visible = () => [...host.querySelectorAll(".tbf-site-header__sheet-section")].filter((section) => !section.hidden).length;
  flushSync(() => trigger(0).click());
  assert.equal(sheet(), "open", "pressing a group opens the band");
  assert.equal(trigger(0).getAttribute("aria-expanded"), "true");
  assert.equal(visible(), 1, "and shows that group's section alone");
  flushSync(() => trigger(1).click());
  assert.equal(trigger(1).getAttribute("aria-expanded"), "true", "pressing another group switches the band to it");
  assert.equal(trigger(0).getAttribute("aria-expanded"), "false");
  flushSync(() => trigger(1).click());
  assert.equal(sheet(), "closed", "pressing the open group again closes the band");
  flushSync(() => trigger(0).click());
  flushSync(() => document.dispatchEvent(new document.defaultView.KeyboardEvent("keydown", { key: "Escape" })));
  assert.equal(sheet(), "closed", "Escape closes the band");
  flushSync(() => trigger(0).click());
  flushSync(() => host.querySelector(".tbf-site-header__sheet-entry").click());
  assert.equal(sheet(), "closed", "choosing a link closes the band");
  flushSync(() => trigger(0).click());
  const outside = document.createElement("p");
  document.body.appendChild(outside);
  flushSync(() => outside.dispatchEvent(new document.defaultView.PointerEvent("pointerdown", { bubbles: true })));
  assert.equal(sheet(), "closed", "pressing outside the header closes the band");
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
  await verifySiteLinks(context);
  await verifySiteHeaderMarkup(context);
  await verifySiteHeaderBehaviour(context);
  await verifySiteHeaderSheetMarkup(context);
  await verifySiteHeaderSheetBehaviour(context);
  await verifyGenericBottomBar(context);
  await verifySitePages(context);
}

export { verifySiteChrome };
