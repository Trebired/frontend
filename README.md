# @trebired/frontend

Generic browser runtime systems for DOM binding, actions, overlays, theme state, live refresh, inputs, upload, and React rendering.

`@trebired/frontend` owns reusable browser behavior. Callers own product routes, product copy, storage keys, icon systems, persistence, navigation, logging, and backend response contracts beyond the documented generic JSON shape.

## Install

Runtime support: Bun 1+.

```sh
bun i @trebired/frontend
```

## Quick Start

Bind the canonical runtime after your document shell is available:

```ts
import { bindFrontendRuntime } from "@trebired/frontend";
import "@trebired/frontend/styles.css";

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

## Concepts

### Runtime Ownership

The package exposes feature binders such as `bindActionForms(root)`, `bindTooltips(root)`, `bindModals(root)`, `bindUploads(root)`, and the root `bindFrontendRuntime(root, options)` binder. Binders are idempotent and accept `Document`, `HTMLElement`, or `DocumentFragment` roots.

### Adapter Boundary

Options accept adapters for logger, i18n, navigation, reload, progress, flash, theme persistence, and live skip checks. Defaults stay browser-generic.

### Data Attributes

The package-owned selectors use `data-tbf-*` attributes. They never require custom elements.

## Configuration

### Runtime Options

`bindFrontendRuntime(root, options)` accepts:

- `adapters.logger`
- `adapters.i18n`
- `adapters.navigation`
- `adapters.reload`
- `adapters.progress`
- `adapters.flash`
- `adapters.themePersistence`
- `adapters.live`
- `theme`
- `live`
- `observe`

## Runtime

### Binding Order

The canonical runtime binds theme, layer roots, progress, flash, inputs, uploads, tooltips, popovers, modals, actions, and live refresh in that order.

### CSS

Use `@trebired/frontend/styles.css` for the package-owned UI used by flash, progress, overlays, tooltip, popover, and upload.

## Public API

Entrypoints:

- `@trebired/frontend`
- `@trebired/frontend/dom`
- `@trebired/frontend/http`
- `@trebired/frontend/actions`
- `@trebired/frontend/flash`
- `@trebired/frontend/progress`
- `@trebired/frontend/layer`
- `@trebired/frontend/tooltip`
- `@trebired/frontend/popover`
- `@trebired/frontend/modal`
- `@trebired/frontend/inputs`
- `@trebired/frontend/theme`
- `@trebired/frontend/live`
- `@trebired/frontend/react`
- `@trebired/frontend/styles`
- `@trebired/frontend/styles.css`

## What It Does Not Do

This package does not:

- define custom elements
- own product routes, domains, copy, or storage keys
- require a specific icon system
- migrate an existing application to consume the package
- replace framework-specific component libraries
