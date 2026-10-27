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

### Title Fit

With `design.titles.fit` set, every `Title` on a narrow screen is set as big as its width allows on as few lines as it can. The package tries the title on one line, then two, three and more, each time splitting the words into lines of even length, and takes the fewest lines that keep the title at least its own size; that split's longest line then fills the width, and the lines are balanced. No word is ever wider than the title's box and the title is never bigger than its size on a wide screen. Above the breakpoint nothing changes.

```ts
design: {
  titles: { fit: { below: "md" } },
},
```

`below` names a design breakpoint (`md` by default). The title font is the configured font family named first in `design.semantics.heading.fontFamily`, at `design.semantics.heading.fontWeight`; `font` (a key of `assets.fonts.families`) and `weight` choose another. The package reads that font's latin WOFF file from its Fontsource package when it generates the CSS and declares each character's width as a `--tbf-glyph-<code>` variable, with the heading's `textTransform` and `letterSpacing` applied.

`Title` writes each word and each candidate split as sums of those variables, so the server markup is already fitted on the first paint and hydration sees the same markup. A letter with a diacritic is measured as its base letter, and a character outside printable ASCII as the average letter. Pass `text` when the children are not plain text (a title built from styled spans), and `fit={false}` for a title that must keep its size, such as a modal's or a panel's; the package's own interface titles already do. `level` takes `1` for a page title. A title's ceiling is its `tbf-text-*` step from `design.scales.textSize`, or for a bare heading the largest size in its `design.semantics.h<level>.fontSize`.

### Boot

One call builds every script a shell needs before the page runs:

```ts
import { frontendBoot } from "@trebired/frontend";

meta: {
  ...frontendBoot({ locale: { routing, strategy, a11y, language, money } }),
  lang: "en",
}
```

It returns `{ bootScripts, bodyScripts }`: the head scripts that restore the scroll state and the reader's locale, and the body script that gives the header its tone before the first paint. On a reload or a back/forward navigation the scroll script also restores the reader's position itself: the browser would restore it against the first layout of a page that is still parsing and correct it when loading ends, a visible jump on a long page, so the script switches that navigation to manual restoration, keeps the page invisible until the document is parsed, then scrolls to the saved position and shows it in the same frame. `scroll` and `header` are on unless passed `false`, and `locale` is given by a site that has one. Nothing else has to be arranged by hand.

There is no boot step for scroll reveals: the server renders every target visible, and `bindFrontendRuntime` with `reveal.selector` shows whatever is already on screen or above it without a transition when it binds after hydration, and hides only what is still below the fold, so nothing a reader can see changes and no hydrated element is touched before React owns it.

### Site Header

`SiteHeader` is the whole header of a content site: the sticky bar, the brand, the desktop navigation, the actions beside it, and the mobile menu behind the toggle. The menu is a full-width panel under the bar; it lists the same links, repeats the actions in a footer row, and closes on a link, on Escape, on a press outside the header and when the viewport grows past 768px. The desktop navigation appears when it fits and not at a width: the header measures the bar against its links and falls back to the menu whenever they would collide with the actions, so a site with four links keeps its bar on a tablet and a site with eight does not have to cram them at 820px. The links come from the application's links config (see Site Links); the header takes no links of its own:

```tsx
<SiteHeader
  actions={<LanguageMenu />}
  brand="Restaurace Střílky"
  brandHref="#top"
  labels={{ closeMenu: t("menuClose"), navigation: t("navLabel"), openMenu: t("menuOpen") }}
/>
```

A header group is a button in the bar that opens the header's sheet: a band directly under the bar, as wide as the header, painted with the bar's own surface and tone, with its content on the same gutter as the bar. The sheet opens when the pointer rests on the group and on a press; it closes when the pointer leaves the header, on a second press, on Escape, on a press or focus outside the header, and when a link in it is chosen. Pressing a group from the keyboard moves focus to its first link, and Escape returns it to the group. Every group's links are in the server markup, hidden until their group opens.

A group of plain links lays out as a list. The sitemap group lays out as columns, one per category, each under an `h5` that takes the page's own heading styles, and prints each link's description as one line under its label. In the mobile menu the same group is a disclosure with the same headings and without the descriptions, so it stays a short list. A group with `search: true` puts the site search at the top of its section and of its mobile disclosure (see Site Search); `lang` on `SiteHeader` names the language the header is rendered in, and the current locale is used without it. The sheet has no tokens: its spacing, columns and motion are the same in every application, and its colours are the header's.

A header with no links and no `menuActions` has no toggle and keeps its actions visible on a phone. `menuActions` replaces `actions` inside the menu when the two should differ, `menuIcon` and `closeIcon` replace the built-in burger, and `softRedirect` marks the links for soft navigation.

The header takes the tone of whatever is behind it, and it knows which that is before the first paint. `frontendBoot()` adds the script that does it: it runs with the document parsed, finds the band under the bar among `main`'s own children and the site footer, and marks the header `data-tbf-dark` when that band declares itself dark, which is the same marker a dark band, an inverse footer or a dark card carries. After that it follows scrolling, resizing, `pageshow` and soft navigation. There is nothing to configure and nothing per page: a page that wants a dark bar under it says so on the band, once, the way it already says it for everything else inside it. The header has no colours of its own for this: it paints with the tone's `ground`, the background every tone region carries (the page in a light region, the ink in a dark one), and its sheet, its mobile menu and every popover it opens paint with the same `ground`, so they all change together.

The header is the hydration root, so it renders itself as the `<header>` element. Server markup wraps it with `siteHeaderRootHtml(html)`, which the client hydrates through `SITE_HEADER_ROOT_SELECTOR`; the wrapper is `display: contents`, so the header still sticks to the viewport.

Colors, fonts, borders and spacing are tokens under `components.shell.header`: `root` (position, background, border, backdropFilter), `maxWidth`, `brand`, `link`, `menu` and the motion pair `motionDuration` and `motionEasing`. Sizes are not: the bar is 5rem tall, its inline padding 1.5rem and 1rem once there is room for the full bar, a brand logo 3.5rem, navigation links 0.875rem, menu links 1rem, and the toggle a 3rem button with a 2rem icon, the same in every site.

`tone` is the crossfade: `duration` and `easing`, 320ms by default, for the moment the bar changes tone as a band scrolls under it. The first paint never uses it, because the tone is decided before it. A soft navigation does not cross-fade either: `<html>` carries `data-tbf-page-swap` for the frame the page is replaced in, which holds every transition and animation at 1ms, so chrome arrives in the new page's colours instead of sliding into them while the reader is already looking at a different page.

### Site Search

Site search finds any page of a static site by its words, with no server. The package owns the whole job: reading the rendered pages into an index at build time, loading the index in the browser, matching, ranking and showing the results. The application owns which pages exist and their titles, and it writes the files the package returns.

At build time, `createSiteSearchIndex()` from `@trebired/frontend/server` takes the same per-language bodies and metadata an application already renders for its shells and returns one file per language, `tbf-search/<locale>.json`:

```ts
import { createSiteSearchIndex } from "@trebired/frontend/server";

for (const file of createSiteSearchIndex({
  locales: ["en", "cs"],
  meta: (path, locale) => ({ description: descriptionOf(path, locale), title: titleOf(path, locale) }),
  paths: allRoutePaths,
  render: (path, locale) => bodies[path][locale],
})) await Bun.write(`${outDir}/${file.path}`, file.contents);
```

Only the page's own content is read: the inside of `<main>` when the page has one, without scripts, SVG, buttons, form controls, and anything `hidden`, `inert` or `aria-hidden`, so decorative duplicates and the header and footer every page shares never match. Headings up to `h4` are kept as sections, with their `id` when they have one.

In the browser the search lives in the site header: a group with `search: true` shows the field. The index for the reader's current language is fetched the first time the field is focused, once, and only that language is searched. Every word of the query has to match; accents and case are ignored, so "prirucka" finds "Příručka". Titles outrank section headings, which outrank descriptions and body text. A result whose best match is a heading with an `id` opens that section. Each result shows a snippet with the matched words marked. Enter opens the first result, the arrow keys move between results, and Escape clears the query before it closes the header's sheet. The field's label, placeholder and messages come from the package in the header's `lang`.

### Hollow Text

`@trebired/frontend/hollow` prints outlined text with riso shapes inside its letters: `<HollowText>` takes the text as children, an optional `inks` pair, `as` for the tag and `dark` to force dark-band inks (an ancestor with `data-tbf-dark` does the same). Without `inks`, the colours come from the nearest `<HollowPalette tones={...}>`, used as given whatever their hue, so a page's hollow text matches the palette it declares; only a page without a palette falls back to the package's cool defaults. The print is sized in `em` from the text, so server markup already carries it on the first paint; after hydration each layer is swapped for a cached bitmap at the element's size.

The print is generated by `@trebired/overprint`, an optional peer dependency: install it only in an application that imports `@trebired/frontend/hollow`. Nothing else in the package imports it.

The shape generator behind the print is exported for other prints that should match it: `seeded(seed)` returns a deterministic random source, and `scatter(next, { box, font })` returns random geometric `path` art (irregular polygons, slivers and sectors) spread across a `box` of `[width, height]`, each shape sized from `font`. The same seed always returns the same shapes.

### Prose Text

`ProseText` renders a plain string in which a marked span becomes a `TextLink`, so copy kept as strings can point at another page without becoming markup. It takes `text` and an optional `softRedirect`.

A span is marked in one of two spellings, which mean the same thing. In a markdown file, a comment pair, because a markdown renderer shows nothing of it and the document stays plain wherever else it is read:

```md
Read <!--tbf:link /philosophy-->the philosophy page<!--/tbf:link--> for why.
Get it from <!--tbf:link https://github.com/Trebired tab-->GitHub<!--/tbf:link-->.
Start at <!--tbf:link /downloads reload-->the downloads page<!--/tbf:link-->.
```

In source that nothing else renders, the short form: `[the philosophy page](/philosophy)`, equal to the comment pair with no flags. A short form whose href starts with `http://` or `https://`, such as `[GitHub](https://github.com/Trebired)`, is external and behaves as the comment pair with `tab`.

The first token after the marker is the href and is required. `tab` opens a new tab and sets its `rel`; `reload` navigates fully instead of soft redirecting. Anything malformed, a missing href, an unknown flag, an unclosed pair, drops the annotation and renders the text plainly: a marker is never shown to a reader, and prose is never lost to a typo.

It is not a markdown renderer and will not become one. Bold, lists and headings stay out, because the moment copy carries markup the component that renders it owns a format, and a format has to be documented, versioned and escaped. A second annotation gets added when something needs one, not in advance.


### Quote

`Quote` sets a quotation apart from the text around it: a quote mark at the top, the words in a real `blockquote` behind a rule down the start edge, and the source, when `cite` is given, at the end under them.

```tsx
<Quote cite="- Edward Snowden, 2015">Arguing that you don't care about the right to privacy because you have nothing to hide is no different than saying you don't care about free speech because you have nothing to say.</Quote>
```

It renders as a `figure` with the source in its `figcaption`, so the words and their source stay together for screen readers. `components.primitives.quote` sets the rule (`root.borderWidth`, `root.borderColor`), the inset (`root.px`), the spacing (`root.gap`), the mark (`mark.size`, `mark.color`), the words (`text.fontSize`, `text.lineHeight`) and the source (`cite.color`, `cite.fontSize`, `cite.fontWeight`).

### Text Document Body

`TextDocumentBody` takes a document from `parseTextDocument` and renders the whole page body: `PageOutlineLayout` with one outline entry per section, a `<section>` per chapter with its heading and id, and the parts as prose articles or as disclosure cards when the document declares `parts: disclosure`. Paragraphs render through `ProseText`, so the inline link annotations work without the application touching them; pass `paragraph` to wrap each one in your own element. `minOutlineSections` decides how long a document has to be before it gets a rail, three by default, and a document that writes `outline: false` in its front matter gets none at all.

### Build Data Sources

`textDocumentsSource` and `moneyRatesSource` are build time data sources for `@trebired/bundler`. An application declares them in `.trebired/bundler/config.ts` under `data.sources` and writes no fetching code of its own:

```ts
data: {
  define: "BUILD_SITE_DATA",
  dir: "dist/data",
  sources: {
    documents: textDocumentsSource({ org: "Example", repo: "meta", slugs: ["privacy"], langs: ["en", "cs"] }),
    rates: moneyRatesSource({ base: "CZK", currencies: ["EUR"] }),
  },
},
```

Each source reads what the last build wrote through the `cached` it is handed, so a missing document keeps the words that were there before rather than dropping the page, and returns a `detail` line the bundler logs.

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

`PageOutline` takes `items` of `{ id, label }`, lists the sections of a page and marks the one being read. `PageOutlineLayout` takes the same `items` and the page content, and lays them out side by side: the list in a column on the left, the content beside it, the column sticking to the top of the viewport while the reader scrolls. A click scrolls smoothly to the section, instantly under reduced motion, moves focus to it so the keyboard carries on from there, and replaces the fragment in the address bar rather than stacking a history entry per jump. The column appears from 1024px, where there is room beside the content; below that the layout is a single column and the list renders nothing, because the page is still read by scrolling. Called with no items the layout renders the content alone.



Below 1024px the rail is hidden and the outline becomes a dock: a small button in the bottom corner shows the current section and opens the same outline in a popover above it, and slides away when the document leaves the screen. Choosing a section, tapping outside or pressing Escape closes it. When the current section changes, its name slides in from the direction the reader is moving. It needs at least two sections. `PageOutlineDock` renders it on its own.
### Site Links

Every link in the site chrome is declared once, under `links` in the frontend config, and the header, its sitemap sheet and the footer all read that one declaration. A link is a key, an `href`, and whether it is `external`; a label never lives in a component. An external link opens in a new tab with `rel="noopener noreferrer"`, never soft-navigates, and carries the external-link icon after its label in the bar, the sheet, the menu and the footer alike.

```ts
// .trebired/frontend/links.ts
import type { FrontendLinksConfig } from "@trebired/frontend/config";
import cs from "./../../src/frontend/components/chrome/site/i18n/cs";
import en from "./../../src/frontend/components/chrome/site/i18n/en";

export const links: FrontendLinksConfig = {
  links: {
    about: { href: "/about" },
    discussions: { external: true, href: "https://github.com/orgs/Example/discussions" },
    downloads: { href: "/downloads", site: "app" },
    home: { href: "/" },
    privacy: { href: "/privacy" },
  },
  categories: { community: ["discussions"], organization: ["about"], legal: ["privacy"] },
  messages: { cs: cs.links, en: en.links },
  sets: {
    main: {
      header: ["home", "about", { group: "everything", search: true, sitemap: true }],
      footer: { columns: [["organization", "community"], ["legal"]], note: ["privacy"] },
    },
    app: { header: ["downloads"], footer: { columns: [["organization"]], site: ["downloads"] } },
  },
};
```

- `links` maps each key to its `href`, its `site` when the path belongs to one of several sites built from the same code, and `external`.
- `categories` groups link keys under a heading. A footer column is a list of categories; the sitemap is a list of categories too, all of them unless a set names its own under `sitemap`.
- `sets` name what each site shows: its `header` (link keys, and groups with `links` or `sitemap: true`, optionally `search: true`), its `footer` (`columns`, the `note` links and the `site` band) and the `site` it renders on, which is the set's own name unless given.
- `messages` holds, per locale, `links` (every link's label), `descriptions` (the line under a label in the sitemap), `categories` (every category's heading) and `groups` (every header group's label). Point them at the application's own i18n files rather than writing copy into the config.
- `icon` replaces the external-link icon, `remixicon:external-link-line` by default.

The config is checked when it is read: a key a set or category names that no link defines, a link, category or group without a label in some locale, or a header group with neither links nor the sitemap is refused with the path that is wrong. At runtime the application hands the same object to `configureSiteLinks(links, { set, origins })` once, in its server entry and its client entry, the way it hands over its language and money config. `set` names the set this site renders. A link whose `site` is not the set's own is written with that site's origin from `origins`, and with the reader's locale handed over, so a product site's footer can link to the organization site that builds it.

### Link Categories

A footer group and a section in the header's mobile menu are the same link category: a heading and the links under it. Both render `SiteLinkCategory`, so the space between the heading and its links and the space between the links are the same in both places. `components.shell.category.gap` sets the first and `components.shell.category.linksGap` the second; without them the category reads `components.shell.footer.column.gap` and `components.shell.footer.links.gap`, and then `gap-sm`. Categories that follow each other in the menu are spaced like the groups in a footer column: `components.shell.category.spacing`, else `components.shell.footer.column.groups.gap`, else `gap-lg`.

### Site Footer

`SiteFooter` takes a `brand`, a `tagline`, `social` links and a `note`; its columns of links, the links of a site band and the links beside the note come from the links config (see Site Links). On a site that stands for itself they fill the whole footer: the brand on the left, the columns on the right. A site that belongs to someone else passes `site` as well, carrying that site's own `brand`, `tagline` and `social`, and its set lists the site's own links under `footer.site`. That becomes a band above the first, with a rule between them: this site on top, and under it the owner's mark, one line saying who builds the site, and the columns that belong to the organization rather than to the product. One footer, one ground, two parts.

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

### Containers

`containers` config declares the boxes an application lays its pages out with, and the package emits a class for each one. A container is the application's own: it names it, it owns the name, and nothing is imported to use it. `<div class="card">` is the whole API.

```ts
containers: {
  card: {
    style: { display: "flex", flexDirection: "column", gap: "var(--tbf-gap-md)", padding: "var(--tbf-gap-md)" },
    on: { hover: { borderColor: "var(--tbf-focus)" } },
    at: { md: { padding: "var(--tbf-gap-sm)" } },
    parts: { header: { style: { display: "flex", justifyContent: "space-between" } } },
    variants: { muted: { style: { background: "var(--tbf-surface-muted)" } } },
  },
}
```

That emits `.tbfm-card`, `.tbfm-card:hover`, `.tbfm-card__header`, `.tbfm-card--muted`, and the `md` block inside the matching `@media (max-width: …)` query. The config names the container `card`; the package writes the prefix.

Two prefixes, because there are two kinds of ownership. `tbf-` is what the package owns outright, and an application may never write into it. `tbfm-` is tbf-managed: the application names the container, owns it and changes it, and the package only turns it into CSS. A container name may not start with either prefix. `style` is the base, `on` keys a selector suffix (`hover`, `focus-visible`, or anything starting with `:`, `[` or `&`), `at` keys a breakpoint the design declares, `parts` are `__element` children and `variants` are `--modifier` siblings.

`tone: "light"` or `tone: "dark"` on a container, a part or a variant gives it the package's own palette for that tone, the same mixin the package uses internally. A light surface inside a dark band says `tone: "light"` and stays readable; nothing is copied.

Every value comes from the config token helpers, and a package token written as a string is refused when the config is read:

```ts
import { defineContainers } from "@trebired/frontend/config";

const card = {
  style: { background: token.frontend("page"), border: token.border(semantic.borderSurface1), padding: token.gap("md") },
  tone: "light",
};
export const containers = defineContainers({ card });
```

`token.css` composes one value out of several, for example `token.css\`min(${token.variable("band-max")}, 100%)\``.

A container name is kebab-case and may not start with `tbf-` or `tbfm-`, both of which the package writes itself. An unknown field, an undeclared breakpoint and a non-scalar value are all refused when the config is read, with the path that is wrong.

Use it for every box an application would otherwise wrap in a component of its own: a card, a band, a panel, a cell, a row. The package ships no such components, so there is nothing to import and nothing to keep in step.

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

### Systems on Demand

`bindFrontendRuntime` binds graphs, logs, code blocks, editors, fullscreen targets, source-language breakdowns and live cards and lists only when a bound root carries their markup, and imports each system the first time it does. Each system is its own chunk: a page without a graph never downloads Chart.js, and a page without logs never downloads the log viewer or the socket client. Binding these systems is asynchronous; everything else binds synchronously as before.

### Indented Flow

`typography.indent.flow` indents paragraphs and quotes that follow a heading among the same siblings, by the given step; it is zero by default. Set it once in the components config and every heading in the application carries its text one step in, without a class on any component. Structure decides what moves: text that is a sibling after a heading moves, everything else stays on the heading's edge.

The step is not a fixed distance. `flow` and `size` name the indent for body text under an `h2`, and the package scales it to what it moves: by the size of the indented text against the root size, and by the square root of the size of the largest heading in the same block against an `h2`. A list of small links under an `h5` steps in a little; a lead under a page title steps in more. The heading sizes are the `typography` heading tokens, so a heading restyled by a class still counts as its level. Browsers that cannot divide lengths in `calc()` use the configured step as it is.

### Island Preparation

`mountLiveIsland({ prepare })` awaits `prepare` before the island renders or hydrates, on the first mount and on every remount after a soft navigation. It receives `url`, the address the island is about to render: during a soft navigation that is the target, which the browser history does not show until the new content is in place, so read the route from `url` rather than from `location`. Load what the island renders there, such as the page module of the current route, and the server markup hydrates against it without a mismatch.

## Public API

Entrypoints:

- `@trebired/frontend`
- `@trebired/frontend/config`
- `@trebired/frontend/react`
- `@trebired/frontend/server`
- `@trebired/frontend/code`, `/editor`, `/explorer`, `/fullscreen`, `/graph`, `/live`, `/logs`, `/realtime`, `/socket`

The root entrypoint exports browser runtime binders, namespace helpers, and static icon cache registration. The config entrypoint exports config loading, normalization, generated CSS, and dependency collection. The React entrypoint exports generic UI components. The server entrypoint exports frontend-related backend helpers plus build-time static icon cache helpers.

Each system subpath exports that system whole, its runtime and its React components together: `@trebired/frontend/graph` carries `GraphPanel`, the chart presets, `buildChartConfig` and `mountGraphCards`. The root and `/react` entrypoints do not re-export them, because a bundler keeps a re-exported system in every page the moment anything else is imported from the same entrypoint.

## Migration Notes

Applications import public APIs only from the package root, `/config`, `/react`, `/server`, and the system subpaths. There is no public Sass, style, or internal component subpath API.

**28.0.0 moved the heavy systems to their own subpaths.** Graphs, logs, editors, the file explorer, code text, fullscreen, live cards and lists, realtime and the socket client are no longer exported from `@trebired/frontend` or `@trebired/frontend/react`. Import them from `@trebired/frontend/graph`, `/logs`, `/editor`, `/explorer`, `/code`, `/fullscreen`, `/live`, `/realtime` and `/socket`. The names are unchanged; only the import path moves. `LiveIslandMount`, `LiveRegion` and the fullscreen buttons stay on `/react`.

**27.0.0 removed every container component.** `PageBand`, `Card`, `CardHeader`, `CardBody`, `CardFooter`, `HairlinePanel`, `HairlineCell`, `ActionRow`, `TrackList`, `TrackItem`, `PinnedSplit`, `IconTile`, `Tag`, `AccentRule`, `Frame`, `FrameCover`, `FrameScrim`, `FrameCaption`, `FrameAction` and `CanvasPanel` are gone, and so are the `tbf-band`, `tbf-tile`, `tbf-tag`, `tbf-rule`, `tbf-action-row`, `tbf-track` and `tbf-frame` classes. Declare what the application needs under `containers` and write the class. `HeadingScope` is now exported, because a container no longer opens a heading level: wrap a section in it where a nested title should step down.

## What It Does Not Do

This package does not:

- Own product routes, copy, data, or persistence policy.
- Own application colors outside the supplied frontend config.
- Provide compatibility bridges for removed application-local UI attributes.
- Expose package Sass or internal component subpaths as public API.
- Provide CORS, CSP, security-header, nonce, or HTTP request-log middleware. Use `@trebired/security` for these.
