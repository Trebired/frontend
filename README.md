# @trebired/frontend

Generic browser runtime systems for DOM binding, actions, overlays, theme state, live refresh, inputs, upload, and React rendering in the Trebired ecosystem.

`@trebired/frontend` owns reusable browser behavior, generic icon rendering, and package-owned overlay/runtime primitives. Callers own product routes, product copy, storage keys, persistence, navigation, logging, domain icon maps, and backend response contracts beyond the documented generic JSON shape.

## Install

Runtime support: Bun 1+.

```sh
bun i @trebired/frontend
```

## Quick Start

Bind the canonical runtime after your document shell is available:

```ts
import { bindFrontendRuntime } from "@trebired/frontend";

bindFrontendRuntime(document, {
  adapters: {
    navigation: {
      navigate(url) {
        window.location.assign(url);
      },
    },
  },
});
```

Configure the generic systems in `.trebired/frontend/config.ts`. `@trebired/bundler` reads that structured config and includes package-owned CSS through an internal virtual entry; products do not import package Sass paths directly.

Markup stays normal HTML:

```html
<form method="post" action="/api/save" data-tbf-action>
  <input name="title" />
  <button type="submit" data-tbf-confetti="true">Save</button>
</form>

<button type="button" aria-controls="settings" data-tbf-modal-open>
  Settings
</button>
<div id="settings" class="tbf-modal" data-tbf-modal aria-hidden="true">
  <div class="tbf-modal__content" data-tbf-modal-content>
    <button type="button" data-tbf-modal-close>Close</button>
  </div>
</div>
```

TSX components are available from the React entrypoint when a product wants package-owned default markup:

```tsx
import { UploadField } from "@trebired/frontend/react";

export function AvatarUpload() {
  return (
    <UploadField
      name="avatar"
      accept="image/png,image/jpeg"
      crop={true}
      preview={true}
      drop={true}
      emptyToggle={{ name: "avatar_empty", value: "1" }}
    />
  );
}
```

## Concepts

### Runtime Ownership

The package exposes feature binders such as `bindActionForms(root)`, `bindTooltips(root)`, `bindModals(root)`, `bindUploads(root)`, and the root `bindFrontendRuntime(root, options)` binder. Binders are idempotent and accept `Document`, `HTMLElement`, or `DocumentFragment` roots.

### Adapter Boundary

Options accept adapters for logger, i18n, navigation, reload, progress, flash, theme persistence, and live skip checks. Defaults stay browser-generic. Runtime logging uses `@trebired/logger-adapter` and emits under `trebired.frontend.*`.

### Data Attributes

The package-owned selectors use `data-tbf-*` attributes. They never require custom elements.

### Markup Components

React components render real HTML with `data-tbf-*` attributes and `tbf-*` classes. They are exported from `@trebired/frontend/react`, so the root runtime stays browser-behavior only.

Upload markup includes hidden file and directory inputs, mixed file/folder buttons, multiple-file support, drag/drop slots, accepted-format metadata, preview slots, list output, clear-current-preview state, crop config, a crop hidden field, and an empty-toggle hidden field.

## Configuration

### Project Config

Projects can define `.trebired/frontend/config.ts`:

```ts
import { defineTrebiredFrontendConfig } from "@trebired/frontend/config";

export default defineTrebiredFrontendConfig({
  prefix: "tbf",
  icons: {
    endpoint: "/__icons/svg",
    packs: ["remixicon", "simple-icons"],
  },
  systems: {
    actions: true,
    flash: true,
    fullscreen: true,
    icons: true,
    inputs: true,
    layer: true,
    layout: true,
    modal: true,
    popover: true,
    progress: true,
    sidebar: true,
    theme: true,
    tooltip: true,
  },
  theme: {
    cssVariables: true,
    tokens: {},
  },
});
```

`@trebired/frontend/config` exports `defineTrebiredFrontendConfig()`, `normalizeTrebiredFrontendConfig()`, `loadTrebiredFrontendConfig()`, `findTrebiredFrontendConfig()`, `generateTrebiredFrontendScss()`, `collectConfigDependencies()`, and `THEME_MODE_ATTRIBUTE`. Missing config files use package defaults. Bundlers should consume the generated SCSS string in memory and emit normal bundled CSS; projects do not need a `.trebired/frontend/generated/styles.scss` file.

`loadTrebiredFrontendConfig()` resolves the config file's relative import graph, returns it as `dependencies`, and keys its compile cache on the contents of every file in that graph. A project can therefore keep design tokens in a sibling module and edit them without stale output:

```ts
// .trebired/frontend/tokens.ts
export const surface = { dark: "#101014", light: "#ffffff", sepia: "#f4ecd8" };
```

### Theme Modes

`theme.modes` declares an open set of named modes. Each mode owns a token block and, optionally, a `label` and a `scheme` (`"dark"` or `"light"`). Anything other than `label`, `scheme`, and `tokens` inside a mode is rejected, so custom properties always live under `tokens`.

```ts
import { defineTrebiredFrontendConfig } from "@trebired/frontend/config";
import { surface } from "./tokens.js";

export default defineTrebiredFrontendConfig({
  prefix: "app",
  theme: {
    cssVariables: true,
    defaultMode: "sepia",
    tokens: { radius: { md: "6px" } },
    modes: {
      dark: { tokens: { color: { surface: surface.dark } } },
      light: { tokens: { color: { surface: surface.light } } },
      sepia: { label: "Paper", scheme: "light", tokens: { color: { surface: surface.sepia } } },
    },
  },
});
```

`generateTrebiredFrontendScss()` emits shared tokens in `:root {}` and one `[data-tbf-theme="<mode>"] {}` block per declared mode, each carrying its own `color-scheme`. It also emits `--<prefix>-theme-modes`, `--<prefix>-theme-default`, and `prefers-color-scheme` fallbacks scoped to `:root:not([data-tbf-theme])` so unbooted documents still resolve.

`theme.dark` and `theme.light` name which registered modes answer `prefers-color-scheme`. When omitted, the first mode of each scheme wins. Declaring no `theme.modes` keeps the previous single `:root {}` output.

### Runtime Options

`bindFrontendRuntime(root, options)` accepts:

- `adapters.logger`
- `adapters.loggerAdapter`
- `adapters.defaultLogger`
- `adapters.i18n`
- `adapters.navigation`
- `adapters.reload`
- `adapters.progress`
- `adapters.flash`
- `adapters.sidebarPersistence`
- `adapters.themePersistence`
- `adapters.live`
- `sidebar`
- `theme`
- `live`
- `observe`
- `frontend_quiet`
- `quiet`

Set `frontend_quiet: true`, `quiet: true`, `globalThis.frontend_quiet = true`, or `<html data-tbf-frontend-quiet="true">` to disable package runtime logging.

## Runtime

### Binding Order

The canonical runtime binds theme, layout, layer roots, icons, progress, flash, inputs, uploads, tooltips, popovers, modals, sidebars, actions, fullscreen controls, and live refresh in that order.

### Layout

Ecosystem apps should use the package layout components for the document shell shape instead of owning separate layout HTML. The app still supplies product-specific header, sidebar link content, page body, and bottom-bar children.

```tsx
import {
  Layout,
  LayoutBootScript,
  LayoutContent,
  LayoutDocument,
  Sidebar,
  SidebarLink,
  SidebarList,
  SidebarShell,
} from "@trebired/frontend/react";

export function Document({ body, header }: { body: React.ReactNode; header: React.ReactNode }) {
  return (
    <LayoutDocument title="App" scripts={<LayoutBootScript hasLeftSidebar />}>
      <Layout
        header={header}
        leftSidebar={
          <SidebarShell id="main_sidebar" side="left">
            <Sidebar aria-label="Navigation">
              <SidebarList>
                <SidebarLink href="/dashboard">Dashboard</SidebarLink>
              </SidebarList>
            </Sidebar>
          </SidebarShell>
        }
      >
        <LayoutContent>{body}</LayoutContent>
      </Layout>
    </LayoutDocument>
  );
}
```

### Theme

Theme runtime works against a caller-supplied mode registry rather than a fixed light/dark pair. The registry defaults to `["dark", "light"]`, so existing callers keep their behavior.

```ts
import { bindThemeRuntime } from "@trebired/frontend";

await bindThemeRuntime(document, {
  modes: ["dark", "light", { key: "sepia", label: "Paper", scheme: "light" }],
  dark: "dark",
  light: "light",
  defaultTheme: "sepia",
  persistence,
});
```

Passing `modes`, `dark`, or `light` to `bindThemeRuntime()` registers them process-wide, so `setTheme()`, `nextTheme()`, and control syncing can be called later without repeating the list. `configureThemeModes(registry)` registers them directly; `configureThemeModes(null)` restores the default pair. `<ThemeBootScript>` publishes the registry it renders with, so a server-rendered page hands its modes to the client before first paint.

- `setTheme(key, options)` validates `key` against the registry and falls back to system preference when it is not registered.
- `nextTheme(options)` cycles through the registry in declaration order.
- `data-tbf-theme` accepts any registered key; `color-scheme` is set from the mode's `scheme`, not from its name.
- `systemThemeKey(options)` maps `prefers-color-scheme` onto the registry's `dark` / `light` members.
- `bindThemeControls(root, options)` binds both `[data-tbf-theme-button]` cyclers and `[data-tbf-theme-select]` pickers; `bindThemeToggles()` and `bindThemeSelects()` bind one kind each.

A `[data-tbf-theme-select]` element is either a `<select>` whose option values are mode keys, or a container of `[data-tbf-theme-value]` options. Both stay in sync with the active mode. `<ThemeToggle>` remains the two-mode control and now accepts a `labels` record for registries larger than two; `<ThemeSelect>` renders the multi-choice picker in either `select` or `buttons` form.

### CSS

There is no aggregate CSS file and no public Sass subpath API. Package-owned CSS is selected by `.trebired/frontend/config.ts`, then emitted by `@trebired/frontend/config` as SCSS for `@trebired/bundler` to compile in memory.

Default CSS is intentionally plain: `tbf-*` classes, generic utility classes, CSS variables, black/white fallback colors, and square radius fallbacks. Products own visual polish by declaring config tokens or writing component-specific CSS.

### Upload Crop

Upload crop uses `cropperjs` only through the upload crop path. The root runtime import does not load cropper or TSX component modules until a crop session opens.

### Icons

Canonical icon specs use `pack:name`:

- `remixicon:add-line`
- `remixicon:settings-3-line`
- `simple-icons:github`
- `simple-icons:cloudflare`

Browser runtime:

```ts
import { bindIcons, renderIconElement } from "@trebired/frontend";

bindIcons(document);
await renderIconElement(document.querySelector("[data-tbf-icon]")!, "remixicon:add-line");
```

React:

```tsx
import { Icon } from "@trebired/frontend/react";

export function SaveIcon() {
  return <Icon spec="remixicon:save-3-line" label="Save" />;
}
```

Server:

```ts
import { createIconMiddleware, renderIconHtml } from "@trebired/frontend/server";

const html = renderIconHtml("simple-icons:github", { label: "GitHub" });
const middleware = createIconMiddleware();
```

The icon system supports explicit colors, simple-icons brand colors, source-color preservation, browser fetch/cache rendering, server HTML rendering, and an Express-compatible `/__icons/svg` middleware.

## Public API

Entrypoints:

- `@trebired/frontend`
- `@trebired/frontend/config`
- `@trebired/frontend/react`
- `@trebired/frontend/server`

## What It Does Not Do

This package does not:

- define custom elements
- render Markdown or MDX
- export markup components from the root entrypoint
- ship an aggregate `styles.css`
- own product routes, domains, copy, or storage keys
- own product-specific icon maps
- migrate an existing application to consume the package
- replace framework-specific component libraries
