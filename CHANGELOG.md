# Changelog

All notable package changes are documented here.

## 5.0.5

- Made advanced tabs prefer URL route state over an explicit default initial value during SSR.

## 5.0.4

- Added selected-option styling for the product shell theme popover.
- Let layout documents provide the server request URL to advanced tabs so query-string tab state renders correctly in SSR.

## 5.0.3

- Kept product shell theme triggers on the generic button primitive while only applying icon-button sizing to icon-only triggers.

## 5.0.2

- Rendered the product shell theme trigger through the generic button primitive so it matches locale switcher button styling.
- Restored icon-only button icons to the configured button icon color.

## 5.0.1

- Kept icon-only package buttons aligned with the control text color instead of forcing `--tbf-button-icon-color`.

## 5.0.0

- Added `components.progress` tokens so top-level progress styling no longer depends on generic theme token overrides.
- Changed flash titles from `strong` to `span`, added a title font-weight token, and raised the default flash icon size.
- Changed product shell theme controls into popover triggers with theme options instead of one-click toggle buttons.
- Scoped package button active styling to explicit `data-tbf-active="true"` or `aria-pressed="true"` state instead of broad `.active` classes.

## 4.0.5

- Removed pressed state from command-style theme toggle buttons while keeping current theme sync on explicit data attributes.
- Added flash/theme regression coverage to verify flash toasts do not mutate the active document theme.

## 4.0.4

- Preserved component icon classes during runtime icon rebinds so flash status icons keep configured icon colors.

## 4.0.3

- Kept flash stacks on the desktop bottom edge by scoping the mobile bottom-bar safe offset to mobile layout.
- Matched active tab styling to ARIA/data-selected tab markup.
- Applied flash level icon colors to inline SVG icon variables as well as the icon host.

## 4.0.2

- Removed remaining flash type-color fallback variables so semantic flash colors apply only through icon color tokens.

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
