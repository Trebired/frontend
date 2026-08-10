# Frontend Package

Generic browser runtime systems for DOM binding, actions, overlays, theme state, live refresh, inputs, upload, layout, and React rendering.

The package owns reusable browser behavior, icon rendering, overlay/runtime primitives, layout chrome, and generic UI components. Callers own product routes, copy, storage keys, persistence, navigation, logging adapters, domain icon maps, and backend response contracts beyond the documented generic JSON shape.

## Runtime

Bind the root runtime after the document shell exists:

```ts
import { bindFrontendRuntime } from "<package-name>";

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

Feature binders such as `bindActionForms()`, `bindTooltips()`, `bindModals()`, and `bindUploads()` are idempotent and accept a `Document`, `HTMLElement`, or `DocumentFragment`.

## Configuration

Projects configure package-owned systems through the frontend config file consumed by the bundler.

```ts
import { defineFrontendConfig } from "<package-name>/config";

export default defineFrontendConfig({
  prefix: "tbf",
  assets: {
    icons: {
      endpoint: "/__icons/svg",
      packs: ["remixicon", "simple-icons"],
    },
  },
  design: {
    interactions: {
      activePress: {
        enabled: false,
        brightness: 0.9,
      },
    },
  },
  runtime: {
    theme: {
      defaultMode: "dark",
      modes: {
        dark: { scheme: "dark" },
        light: { scheme: "light" },
      },
    },
  },
  systems: {
    actions: true,
    flash: true,
    layout: true,
    modal: true,
    popover: true,
    sidebar: true,
    theme: true,
  },
});
```

The config entrypoint exports `defineFrontendConfig()`, `normalizeFrontendConfig()`, `loadFrontendConfig()`, `findFrontendConfig()`, `generateFrontendScss()`, `collectConfigDependencies()`, and `THEME_MODE_ATTRIBUTE`.

## Components

React components render normal HTML with `data-tbf-*` attributes and `tbf-*` classes. Use the React entrypoint for package-owned default markup:

```tsx
import { UploadField } from "<package-name>/react";

export function AvatarUpload() {
  return (
    <UploadField
      name="avatar"
      accept="image/png,image/jpeg"
      crop={true}
      preview={true}
      drop={true}
    />
  );
}
```

## Styling

There is no public Sass subpath API. Package-owned CSS is selected by the frontend config, then emitted by the config entrypoint as SCSS for the bundler to compile in memory.

Generic app UI such as headers, mobile nav, breadcrumb, disclosure, tabs, dropdown/search controls, graph shells, cards, canvas panels, flash messages, and sidebar link lists is available from the React entrypoint.
