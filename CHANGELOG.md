# Changelog

All notable package changes are documented here.

## 4.0.1

- Changed flash defaults to render Remix Icon status glyphs and keep semantic flash coloring scoped to icons only.
- Removed flash type-color fallbacks from titles and countdown progress bars.
- Removed source-level brand string construction from config/logging helpers and split oversized utility/verifier files.

## 4.0.0

- Replaced styled component defaults with neutral structural defaults so app frontend config owns palette and tone values.
- Added flash component token generation and removed package hardcoded palette-family fallbacks from generic UI styling.

## 3.0.0

- Removed the flash close button from runtime and React flash markup.
- Restored flash countdown bars so the default color follows the flash level, with explicit progress-tone overrides still supported.
- Restored compact flash spacing, title coloring, and header support-link rendering closer to the legacy platform styling.
- Renamed the public config helpers to brand-neutral names: `defineFrontendConfig()`, `normalizeFrontendConfig()`, `loadFrontendConfig()`, `findFrontendConfig()`, and `generateFrontendScss()`.
- Added a discipline rule banning hardcoded brand wording outside package metadata.

## 2.0.0

- Added config-driven component tokens for buttons, cards, tabs, action buttons, and surface components so package defaults can match the legacy platform UI without app-side CSS overrides.
- Added flag icons to the package language selector, with locale-region and language-code country resolution plus per-locale overrides.
- Routed package button, card, and advanced tab styles through component tokens while preserving legacy defaults for backgrounds, spacing, borders, radii, and font inheritance.
- Added typed primitive layout/class APIs for buttons, cards, card rows, stacks, inline rows, grids, and text.
