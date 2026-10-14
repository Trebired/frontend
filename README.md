# @trebired/frontend

Generic frontend framework for Trebired applications: React shell, design tokens, UI components, browser runtime, and frontend server helpers.

This package owns reusable layout, theme, sidebar, header, overlay, upload, flash, tab, link, icon, and boot-script behavior. Callers own product routes, copy, persistence endpoints, domain rendering, and application design values supplied through config.

## Install

Runtime support: Bun 1+.

```sh
bun i @trebired/frontend
```

## Quick Start

Configure the package through `.trebired/frontend/config.ts`:

```ts
import { defineConfig } from "@trebired/frontend/config";

export default defineConfig({
  forVersion: "8.0.0",
  assets: {
    icons: {
      endpoint: "/__icons/svg",
      packs: ["remixicon"],
    },
  },
  components: {},
  design: {},
  runtime: {},
  systems: {
    flash: true,
    layout: true,
    popover: true,
    theme: true,
  },
});
```

Bind the browser runtime after the document shell exists:

```ts
import { bindFrontendRuntime } from "@trebired/frontend";

bindFrontendRuntime(document);
```

For a static app without an icon endpoint, generate an icon cache module during the frontend build:

```ts
import { writeStaticIconCacheModule } from "@trebired/frontend/server";

await writeStaticIconCacheModule({
  outFile: "src/frontend/generated/static-icons.ts",
  rootDir: process.cwd(),
  specs: [
    "remixicon:home-line",
    "remixicon:settings-3-line",
  ],
});
```

Register that cache before binding the browser runtime:

```ts
import { bindFrontendRuntime } from "@trebired/frontend";
import { registerFrontendStaticIcons } from "../generated/static-icons";

registerFrontendStaticIcons();
bindFrontendRuntime(document, { icons: { mode: "static" } });
```

## Concepts

### Package Namespace

Frontend source-visible class names, data attributes, CSS variables, tokens, and events are created through `@trebired/bundler` namespace helpers. The package's own `.trebired/bundler/config.ts` declares the `tbf` prefix. Applications do not set a frontend prefix to consume this package.

### Backend-free and Server-backed Surfaces

Backend-free applications can use the config API, generated CSS, namespace helpers, theme and layout runtime, browser binders, static React components, design-token driven primitives, and static icon caches.

Server-backed applications use `@trebired/frontend/server` for package static assets, icon SVG endpoints, React document rendering, server locals, navigation, SEO, theme and language cookies, live socket helpers, and framework middleware.

Runtime components that submit HTTP actions, expect data-attribute request/response endpoints, subscribe to live socket islands, load code-editor assets through server routes, or render server-provided entity graph data require an application backend.

### React Shell

The React entrypoint renders package-owned document, layout, header, sidebar, portal, upload, tabs, tooltip, popover, modal, fullscreen, flash, text-link, language, and theme controls. The markup is generic and configured through `.trebired/frontend/config.ts`.

### Headings

Heading levels come from where a heading sits, not from the call site. Render titles with `Title`, never a hand-written `<h3>`. A heading outside any card is `h3`, a card's own title is `h3`, and every card nested inside another adds one level: a card inside a card is `h4`, one more is `h5`. A modal starts over: its title is `h3` and a card inside it is `h4`. `copy_card`, `copy_code_card`, graph cards and `TitleDescription` follow the same rule, and a `TitleDescription`'s children sit one level below its title.

Pass `level` to `Title` (or `titleAs` to a copy card) only for a page hero title, which is `h2`. `HeadingScope` sets the depth explicitly, for markup rendered on its own, such as a fragment swapped into a card later.

### Site Header

`SiteHeader` is the whole header of a content site: the sticky bar, the brand, the desktop navigation, the actions beside it, and the mobile menu behind the toggle. The menu is a full-width panel under the bar; it lists the same links, repeats the actions in a footer row, and closes on a link, on Escape, on a press outside the header and when the viewport grows past 768px. The desktop navigation appears when it fits and not at a width: the header measures the bar against the links it was given and falls back to the menu whenever they would collide with the actions, so a site with four links keeps its bar on a tablet and a site with eight does not have to cram them at 820px. Pass the links as data, not markup:

```tsx
<SiteHeader
  actions={<LanguageMenu />}
  brand="Restaurace Střílky"
  brandHref="#top"
  labels={{ closeMenu: t("menuClose"), navigation: t("navLabel"), openMenu: t("menuOpen") }}
  links={sections.map((section) => ({ href: hrefs[section], key: section, label: t(`nav.${section}`) }))}
/>
```

A header with no links and no `menuActions` has no toggle and keeps its actions visible on a phone. `menuActions` replaces `actions` inside the menu when the two should differ, `menuIcon` and `closeIcon` replace the built-in burger, and `softRedirect` marks the links for soft navigation.

The header is the hydration root, so it renders itself as the `<header>` element. Server markup wraps it with `siteHeaderRootHtml(html)`, which the client hydrates through `SITE_HEADER_ROOT_SELECTOR`; the wrapper is `display: contents`, so the header still sticks to the viewport.

Colors, fonts, borders and spacing are tokens under `components.shell.header`: `root` (position, background, border, backdropFilter), `maxWidth`, `brand`, `link`, `menu` and the motion pair `motionDuration` and `motionEasing`. Sizes are not: the bar is 5rem tall, its inline padding 1.5rem and 1rem once there is room for the full bar, a brand logo 3.5rem, navigation links 0.875rem, menu links 1rem, and the toggle a 3rem button with a 2rem icon, the same in every site.

`tone` decides where the bar takes its light or dark variant from, and nothing in the consuming application calls into it. `follow: "hero"`, the default, holds the tone of the page's first band for the whole page through one CSS rule and runs no script at all. `follow: "band"` gives the bar the tone of whatever band is under it as the page scrolls: the header reads `main`'s own children and the site footer, takes the one crossing its `probe` line (`0.5`, its own middle), and marks itself `data-tbf-dark` when that band carries it, so the ink, the border, the mobile menu and a logo that ships a light and a dark face all follow the one attribute. The CSS rule stays the pre-hydration and no-script answer in both modes. `duration` and `easing` set the crossfade, 320ms by default. A soft navigation does not cross-fade: `<html>` carries `data-tbf-page-swap` for the frame the page is replaced in, which holds every transition and animation at 1ms, so chrome arrives in the new page's colours instead of sliding into them while the reader is already looking at a different page.

### Prose Text

`ProseText` renders a plain string in which a marked span becomes a `TextLink`, so copy kept as strings can point at another page without becoming markup. It takes `text` and an optional `softRedirect`.

A span is marked in one of two spellings, which mean the same thing. In a markdown file, a comment pair, because a markdown renderer shows nothing of it and the document stays plain wherever else it is read:

```md
Read <!--tbf:link /philosophy-->the philosophy page<!--/tbf:link--> for why.
Get it from <!--tbf:link https://github.com/Trebired tab-->GitHub<!--/tbf:link-->.
Start at <!--tbf:link /downloads reload-->the downloads page<!--/tbf:link-->.
```

In source that nothing else renders, the short form: `[the philosophy page](/philosophy)`, equal to the comment pair with no flags.

The first token after the marker is the href and is required. `tab` opens a new tab and sets its `rel`; `reload` navigates fully instead of soft redirecting. Anything malformed, a missing href, an unknown flag, an unclosed pair, drops the annotation and renders the text plainly: a marker is never shown to a reader, and prose is never lost to a typo.

It is not a markdown renderer and will not become one. Bold, lists and headings stay out, because the moment copy carries markup the component that renders it owns a format, and a format has to be documented, versioned and escaped. A second annotation gets added when something needs one, not in advance.


### Text Documents

`parseTextDocument` reads a document from a text repository: front matter, a lead, sections, and the parts inside them. A document says how it is presented rather than leaving a consumer to recognise it by slug:

```md
---
title: FAQ
updated: 2026-10-14
parts: disclosure
---
```

`parts` is `prose`, the default, or `disclosure`, which asks for an accordion. Every section and part carries an `id` slugged from its heading, diacritics folded, which is what an outline links to. Paragraphs before the first `##` are the document's lead.

### Page Outline

`PageOutline` takes `items` of `{ id, label }` and renders a fixed rail beside the page, listing the sections and marking the one being read. A click scrolls smoothly to the section, instantly under reduced motion, moves focus to it so the keyboard carries on from there, and replaces the fragment in the address bar rather than stacking a history entry per jump. It appears from 1280px, where there is room beside the content, and otherwise renders nothing: the page is still read by scrolling.


### Site Footer

`SiteFooter` takes a `brand`, a `tagline`, `social` links, `columns` of links and a `note`. On a site that stands for itself they fill the whole footer: the brand on the left, the columns on the right. A site that belongs to someone else passes `site` as well, carrying that site's own `brand`, `tagline`, `social` and a row of `links`. That becomes a band above the first, with a rule between them: this site on top, and under it the owner's mark, one line saying who builds the site, and the columns that belong to the organization rather than to the product. One footer, one ground, two parts.

That is the whole mechanism for telling the two apart, and it is deliberate: a column heading cannot say whose links these are, because every column looks equally weighted, while a mark is read before it is read. The two parts share one ground, because a second background reads as a second footer rather than as the rest of this one. Give the bands the same heading names on every site so a reader learns one map, and let the same label appear in both bands when both genuinely have one, such as a brand page per site.


### Bottom Bar

`BottomBar` renders the mobile bar at the bottom of the viewport from an `items` array. An item with `href` is a link, one with `controls` toggles a mobile nav, one with `onClick` alone is a button, and one with `node` renders whatever it carries. `ProductShellBottomBar` is that component with a product shell's own items. `components.shell.bottomBar` tokens cover its height, background, border, radius, shadow and item colors.

### Tab Routes

Tabs keep their selection in the query string, one `tab-<familyKey>` parameter per family, so nested tabs are addressed by one parameter per level. `tabRouteUrl(url, steps)` builds that URL from `{ familyKey, route }` steps. On the server, `tabSectionRedirect({ sections, target })` turns a path segment into a redirect to the tabbed page, so a path such as `/@someone/repositories` can land on the matching nested tab:

```ts
app.get("/@:username/:section", tabSectionRedirect({
  sections: {
    repositories: [
      { familyKey: "profile", route: "platform" },
      { familyKey: "profile-sections", route: "repositories" },
    ],
  },
  target: (req) => `/@${req.params?.username}`,
}));
```

Unknown sections fall through to the next handler. The request's own query is kept, and `redirectToTabs(req, res, { target, steps })` does the same for a handler that has already resolved its steps.

## Configuration

### Design

`design` config owns palette, semantic tokens, scales, active feedback, shadows, and component styling values. The package stays style-generic and does not hardcode application colors.

### Runtime

`runtime` config owns browser systems such as theme state, navigation hooks, boot scripts, and runtime adapters.

### Icons

`assets.icons.mode` is `"server"` by default. In server mode, browser icon binders fetch SVG from `assets.icons.endpoint`, usually `/__icons/svg`, and an app must attach the icon server helper.

Static apps set `assets.icons.mode: "static"` and `assets.icons.endpoint: false`, then register a build-generated icon cache before calling `bindFrontendRuntime(document, { icons: { mode: "static" } })`.

### Accessibility

`a11y` config owns the three settings a visitor sets for themselves: animation, text size and contrast.

```ts
a11y: {
  cookie: false,
  defaults: { contrast: "system", motion: "system", textSize: 100 },
  textSizes: [100, 125, 150, 200],
}
```

`motion` is `"system"`, `"reduce"` or `"full"`. `contrast` is `"system"`, `"normal"` or `"high"`. `textSize` is one of `textSizes`. `cookie` adds a `ui_a11y` cookie beside the `localStorage` entry, for a server that renders the setting itself; it is off by default, because a static site has no server to read it.

A site passes the configured block to its one boot script so the settings apply before first paint:

```ts
const a11y = configureFrontendA11y(frontendConfig.a11y);
createLocaleBootScript(routing, { a11y, language, money, strategy });
```

Without that, the attributes are written by the runtime after hydration instead, and the page paints once with the wrong setting. The boot script writes four attributes on `<html>`: `data-tbf-motion-pref` is the choice, `data-tbf-reduce-motion` is the resolved `on`/`off` that CSS and motifs read, `data-tbf-text-size` is the percentage, and `data-tbf-high-contrast` is the resolved `on`/`off`.

`<AccessibilityMenu id lang />` renders the control as a popover, the same shape as `LocaleSwitcher`. `motionReduced()` is the predicate every animation checks; it reads the resolved attribute first and the media query only when no attribute is set, so an explicit "animation is fine" beats an operating system that asks for less. `announce(message)` speaks into the one polite live region the package renders. `contrastRatio(foreground, background)` returns a real WCAG ratio, with sRGB linearisation and alpha composited over the backdrop, and returns `null` rather than a guess for a colour it cannot parse, including `oklch()`; `meetsContrast(ratio, kind)` checks it against 4.5:1 for text, 3:1 for large text and 3:1 for non-text.

#### Touch targets

`--tbf-target-min` is the pointer target floor and defaults to `2.75rem`, which is 44px. That is WCAG 2.5.5 at level AAA. A dense surface opts down to `--tbf-target-min-dense`, `1.5rem`, by carrying `data-tbf-dense`; 24px is what WCAG 2.5.8 at level AA asks for. The opt-down is an explicit attribute on the surface. It is not a silent exception, and a surface that carries it is still accountable for the AA floor.

### Button variants

`design.components.primitives.button.variants` configures `chrome`, `danger`, `ghost`, `primary` and `secondary`. `chrome` is the header's own look: a compact quiet outline over whatever it sits on, and what the language switcher, the accessibility trigger and the choice rows in radio and checkbox groups all render as, so the three cannot drift apart. It is shorter than a content button and opts into the dense pointer tier, which is why it stays at 2rem beside a 2.75rem button. A variant may set `bg`, `border`, `color`, `radius`, `height`, `padding`, `fontSize` and a `states.hover` block.

Write only static values there. A variant value is emitted as a custom property on `:root`, so a `var()` written into config resolves once at the root and inherits already resolved. Leave the token unset and the rule's own fallback resolves it per element.

### Glass

`design.glass` is for a surface that lies over the page and lets it through. The glass has two fills. `--tbf-glass-bg` is clear and is what any surface that asks for glass gets; `--tbf-glass-tint-bg` carries the tint. `tint` is `light`, `dark` or `none` and sets the tinted fill: `light` is `--tbf-page`, `dark` is `--tbf-ink`, so a tinted pane matches the page exactly where nothing is behind it and reads as a material only where something is. `clear` sets the untinted fill, and `color` with `opacity` overrides the tint. Both shades are always emitted as `--tbf-glass-tint-light-bg` and `--tbf-glass-tint-dark-bg`.

The site header bar and the header's mobile menu do not take it. They are opaque: the bar fills with the page colour, or with the ink on a page whose first band is dark, and the menu fills to match. Chrome that carries the navigation is read at every scroll position, so it supplies its own ground rather than borrowing whatever happens to pass under it.

The chrome takes its tone from the markup, not from a measurement. A region that is dark says so with `data-tbf-dark`, or `data-tbf-tone="dark"`, which applies the dark tone to everything inside it. A page whose first band under the header is dark gives the header the dark tone through one rule, `body:has(main > [data-tbf-dark]:first-child)`, so the bar and its mobile menu are the page's own ink and ground from the first paint, with no script. The bar holds that tone for the whole page: it does not change as the page scrolls.

Nothing measures what is painted behind an element. A colour is either the palette's or declared by the markup.

A popover, a dropdown panel, a tooltip and a modal do not take it. They stand on the page rather than lying over it, they carry controls and text, and they appear over content they know nothing about, so each fills with `--tbf-surface` through its own token. For the same reason they are contrast surfaces rather than contrast items: their tone comes from the fill they supply, not from a reading of whatever is behind them.

### Systems

`systems` config gates which package-owned stylesheets are emitted, in the `SYSTEM_ORDER` cascade order. It does not gate boot scripts or binders.

## Runtime

Feature binders are idempotent and accept a `Document`, `HTMLElement`, or `DocumentFragment`. Runtime binding syncs newly added DOM without resetting document-level state such as the active theme.

Frontend server helpers own package static assets, icon SVG endpoints, React document rendering support, and frontend middleware that is generic across Trebired applications.

Static icon mode uses `registerStaticIcons()` in the browser. Missing cached icons do not trigger HTTP when the runtime mode is `"static"`.

## Public API

Entrypoints:

- `@trebired/frontend`
- `@trebired/frontend/config`
- `@trebired/frontend/react`
- `@trebired/frontend/server`

The root entrypoint exports browser runtime binders, namespace helpers, and static icon cache registration. The config entrypoint exports config loading, normalization, generated CSS, and dependency collection. The React entrypoint exports generic UI components. The server entrypoint exports frontend-related backend helpers plus build-time static icon cache helpers.

## Migration Notes

Applications import public APIs only from the package root, `/config`, `/react`, and `/server`. There is no public Sass, style, or internal component subpath API.

## What It Does Not Do

This package does not:

- Own product routes, copy, data, or persistence policy.
- Own application colors outside the supplied frontend config.
- Provide compatibility bridges for removed application-local UI attributes.
- Expose package Sass or internal component subpaths as public API.
- Provide CORS, CSP, security-header, nonce, or HTTP request-log middleware. Use `@trebired/security` for these.
