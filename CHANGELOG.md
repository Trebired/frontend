# Changelog

## 13.25.0

- `SiteHeader` gained a `surface` prop: `"solid"` (the default, unchanged), `"transparent"` or `"blurred"`. It emits `data-tbf-site-header-surface` and the stylesheet applies the chosen surface to the header root **and** its mobile menu in the same rule, so the menu can no longer end up a different material from the bar it hangs off. `"blurred"` is a translucent tint plus `backdrop-filter`, not an opaque fill: a header over a dark hero stays dark, because the page shows through rather than being painted over.
- The tint and the filter are tokens, `--tbf-shell-header-surface-bg`, `--tbf-shell-header-surface-backdrop-filter` and `--tbf-shell-header-surface-border-color`, so a site that wants a dark material sets the tint rather than forking the component. The default tint is 12% of `--tbf-page`, which is low enough that it does not force the header light.
- The page-load progress bar can be inverted. It resolved to one colour forever, which is only ever right on half a site: a bar fixed to the top of the viewport sits over whatever the header sits over, so a black bar disappears on a dark page. `--tbf-runtime-progress-color` (`--progress-color`, defaulting to the focus colour) is now paired with `--tbf-runtime-progress-color-inverse` (`--progress-color-inverse`, defaulting to the page colour), and `data-tbf-progress-inverse="true"` on the progress root selects the second.
- The attribute is driven by `progress.setInverse(on)` / `progress.inverse()`, exported as `setProgressInverse` and `readProgressInverse`, or set once at boot through `bindProgress({ inverse })` and the new `progress` field on the frontend runtime options. The bar transitions its colour, so flipping it mid-navigation does not flash.

## 13.24.0

- Added a locale handoff between sites. `LOCALE_HANDOFF_QUERY`, the `setlang` query parameter, tells a site which locale the visitor is reading in right now. The boot script honours it whatever the url strategy is, writes it to storage and the cookie so it sticks, and removes it from the url so the address stays clean and sharing it cannot force a language on someone else.
- `setlang` is deliberately not `lang`. A `lang` url is a view of a page, so a visitor's own saved choice still outranks it, exactly as before, and that is now covered by a test rather than left implicit. A handoff is a live statement from a sibling site as the visitor follows a link, so it outranks the saved choice and replaces it.
- This is what a group of sites on separate origins needs: browser storage is per origin, and a cookie set on one domain does not reach another, so without a handoff the language was lost on every hop between sites.

## 13.23.0

- `EmbedFrame` splits its failure state into a fixed headline and the reason on its own line beneath it, instead of running both into one sentence.
- The failure reason is now one of four rather than two. Pairing the element's `error` event with a `no-cors` probe of the same URL separates a server that answered but will not be framed (CSP `frame-ancestors`, `X-Frame-Options`, or a 404) from one that could not be reached at all (closed port, bad DNS, TLS failure); `navigator.onLine` splits off the case where the visitor is simply offline; and a deadline with no event at all stays the timeout. The keys are `embedFailedRefused`, `embedFailedUnreachable`, `embedFailedOffline` and `embedFailedTimeout`, under the shared `embedFailed` headline.
- `embedFailedBlocked` is removed. It carried the wording "This content refused to load here", which was both vague about the cause and untrue for an unreachable host.
- The Czech strings for these keys carry their diacritics. The rest of the shared message table is written without them, which is wrong for text this visible on a public page.

## 13.22.0

- `EmbedFrame`'s failure text is no longer something a caller can set. `labels.error` is removed from `EmbedFrameLabels`; a refused or unresponsive embed now shows one of two fixed, translated messages owned by the package itself, distinguishing why it failed: `embedFailedBlocked` when the content raised an error (a CSP `frame-ancestors` or `X-Frame-Options` refusal, or a genuine connection failure) and `embedFailedTimeout` when it never responded within the deadline. The unused `labels.open` field is removed as well; nothing ever read it.
- Added a `lang` prop, resolved the same way `Carousel` resolves its `lang` (an explicit prop, falling back to the ambient locale context), so the fixed failure text renders in the visitor's language instead of always in English.
- `loading` and `fullscreen` stay overridable through `labels`, since those describe the host page's own wording, not the reason an embed failed.
- `MapEmbed` gained the same `lang` prop and passes it straight through.

## 13.21.1

- `EmbedFrame` no longer blanks an embed that has already loaded. The timeout fired regardless of the state it found, so it cleared the source of a working embed once the deadline passed. It is cancelled on load and returns early if the state has settled.

## 13.21.0

- `EmbedFrame` now renders the embed in an `<object type="text/html">` instead of an `<iframe>`, so a refused embed raises an `error` event and the component shows its own failure state. An `<iframe>` gives the embedding page nothing to act on: a document blocked by `frame-ancestors` or `X-Frame-Options` fires `load` exactly like a successful one, and `contentWindow.location`, `contentDocument` and `origin` throw in both cases, so the browser's own "refused to connect" page was the only thing a visitor ever saw.
- The failure state now covers refusal as well as timeout, and its default text says so. `labels.error` still overrides it.
- The status marks are Remix Icon artwork, inlined rather than resolved through the icon runtime so they render on static sites with no icon endpoint. The failure mark is `error-warning-line`.
- `allowFullScreen` is honoured with a hover-revealed control that fullscreens the embed's own wrapper through the frontend fullscreen system, because `<object>` carries no `allowfullscreen` attribute. `labels.fullscreen` sets its label.
- Passing `sandbox` keeps the old `<iframe>` element, since `<object>` cannot carry a sandbox. Failure detection is unavailable in that mode.
- `MapEmbed` no longer sets `referrerPolicy`, which `<object>` does not carry and which only restated the browser default.

## 13.20.0

- Smooth scrolling no longer animates the browser's scroll restoration. With `design.scrollBehavior: "smooth"`, reloading a page that was scrolled made the browser ease its way back to the saved position over a few hundred milliseconds, which looks like the page sliding or fading itself into place. The generated stylesheet now pairs `html { scroll-behavior: smooth }` with `html[data-…-scroll-settling] { scroll-behavior: auto }`, so the restore lands in one frame.
- The settling window now ends on the first user input — `pointerdown`, `keydown`, `wheel` or `touchstart` — instead of on `load`. Scroll restoration frequently lands after `load` fires, so ending the window there left the animation in place on slower pages. Any scroll or anchor click a visitor makes is preceded by one of those events, so smooth scrolling is active by the time it can matter.

## 13.19.0

- The scroll-state boot script now gets the state right on a reload or a back/forward navigation. The browser restores the scroll position after the boot script runs, so the first value was always "not scrolled"; the script now remembers the position in `sessionStorage` on `pagehide` and seeds the state from it when the navigation is a reload or a history traversal, and the real position takes over as soon as the page has loaded.
- Added `data-…-scroll-settling`, set on `<html>` until the page has loaded and the state has settled. Styles that transition on the scroll state can switch the transition off while it is present, so a late correction lands in one frame instead of animating.
- The boot script also re-reads the state on `DOMContentLoaded`, on `pageshow` and in the first animation frame.

## 13.18.0

- Added the scroll-state system, so a header that changes appearance once the page is scrolled no longer has to compute that in React. `createScrollStateBootScript()` returns a boot script that sets `data-…-scrolled` on `<html>` before the first paint and keeps it current from then on, so the correct header is painted immediately even when a reload restores a scrolled position.
- `bindScrollState()` binds the same state from the runtime for apps that do not use a boot script, and does nothing when the boot script already owns it. `bindLayouts` calls it, with the threshold configurable through `scroll` in the layout runtime options.
- `applyScrollState()`, `readScrollState()`, `SCROLL_STATE_ATTRIBUTE` and `SCROLL_STATE_SELECTOR` are exported for stylesheets and code that need the state directly. The threshold defaults to 24 pixels.

## 13.17.0

- The locale boot script no longer keeps the document hidden until `DOMContentLoaded`. It still hides the page when the visitor's stored locale differs from the rendered one, but `LocaleProvider` now clears that pending state as soon as the localized tree has committed, so the hidden window lasts only until the correct text is on screen instead of until every deferred script has run.
- Added `clearLocalePending()` for apps that apply the locale themselves and want to reveal the document at that point.
- Added `hideUntilReady` to `createLocaleBootScript`'s boot options. It defaults to `true`, matching the previous behaviour; setting it to `false` marks the document as pending without ever hiding it, for sites that prefer a brief flash of the rendered locale over a blank page.

## 13.16.0

- Soft-redirect links are no longer marked with a `data-…-soft-redirect-bound` attribute. The binding is tracked in a `WeakSet` instead, so the DOM a browser holds after a soft redirect matches the server-rendered markup exactly.
- This removes a React hydration mismatch: the runtime binds the freshly swapped links before the rehydrate event fires, so any chrome that re-hydrates after a navigation used to find an attribute React had not rendered.
- `SOFT_REDIRECT_BOUND_ATTR` is still exported for compatibility but is no longer written to any element.

## 13.15.0

- Added `EmbedFrame`, the embed system every site should use instead of writing an `<iframe>` by hand. It assigns the `src` only once the host document has finished loading, so a slow or unreachable embed can no longer hold the page's `load` event open and leave the browser tab spinning.
- `EmbedFrame` shows the standard `loader-circle` while the frame is loading, and on timeout it blanks the frame to cancel the pending request and shows a warning mark with an explanatory message. The timeout defaults to 10 seconds and is set with `timeoutMs`.
- `labels.loading` and `labels.error` override the built-in English strings, and `onState` reports `loading`, `ready` or `error` to the host.
- `MapEmbed` now renders through `EmbedFrame`, so existing map embeds get the loading, timeout and failure handling without a code change. It gained optional `labels` and `timeoutMs`.

All notable changes to `@trebired/frontend` will be documented here.

This project follows semantic versioning once published.

## 13.14.0

- Select cards now select. `card_select` rendered a selected and an excluded state but nothing switched it, so every page wired its own clicks, and one that looked only for native buttons left the cards dead. The input runtime now owns them: a click or Enter/Space selects a card, arrow keys move the selection and skip disabled cards, and the `selected`/`excluded` classes, `aria-selected`, the card data attributes and the roving `tabindex` follow. A change fires `SELECT_CARD_EVENT` once, with the chosen value.
- Added `name` to `card_select`. A named group renders a hidden field that carries the selected value, so the cards submit with a form.
- With nothing selected, the first enabled card is focusable, so the group is reachable from the keyboard.
- Added `bindSelectCards`, `selectCard`, `selectedCardValue`, `SELECT_CARD_EVENT`, `SELECT_CARD_SELECTOR` and `SELECT_CARDS_SELECTOR`.

## 13.13.0

- Added `Title` and `HeadingScope`. Heading levels now follow nesting instead of being chosen at every call site, where the same card was `h3` on one page and `h4` on another. A heading outside any card and a card's own title are `h3`, each card nested inside another adds a level, and a modal starts over at `h3`. Every `Card` adds a level to its contents, and `ModalContent` resets it.
- `copy_card`, `copy_code_card`, graph cards, graph stat group labels, entity lists, the log entry modal, the language panels, the editor surface, steps and `TitleDescription` take their level from the same rule. A graph records its level on its mount, so the title the runtime draws in the browser matches. `titleAs` and `level` remain as explicit overrides, meant for a page hero title.
- Programmatic modals (`createModal`, the image crop modal) title themselves `h3`, like every other modal.

## 13.12.0

- `copy_card` and `copy_code_card` take `titleAs` (`"h2"` to `"h6"`, default `"h3"`), so a copy card nested under a section heading can use a smaller title than the section it sits in. An unknown value falls back to `h3`.
- Wrapped code blocks (`code_block` with `wrap`, which `copy_code_card` uses) now actually wrap. The code element kept `min-width: max-content`, which lets unwrapped code scroll sideways but also held wrapped code at its longest line, so a known-hosts entry or public key ran past the card edge. Wrapped code may now shrink, breaks long unbroken tokens, and after highlighting its spaces are ordinary spaces again: the highlighter writes non-breaking spaces, which left a line nowhere to break except at hyphens.

## 13.11.2

- Avatars inside cards are round again. The card icon rule that rounds a card's image into a soft square also matched avatars, and being more specific than `.avatar` it replaced their circle with the square radius, so every user card showed a square picture. The rule now leaves avatars alone.

## 13.11.1

- The graph unit dropdown really is as wide as its unit now. 13.11.0 widened the element the dropdown mounts into, but a dropdown lays its label over the field absolutely and its root is full width, so the control stayed as narrow as its padding and "Mb/s" was cut to "M". A dropdown given the `dropdown-fit` class puts the label in flow and takes its width from it, which is what the unit control uses.

## 13.11.0

- Graphs have no fullscreen control. A graph card is already as large as its page gives it, and the button sat in every title row, so `extendId` and `extendGroup` are gone with it. Fullscreen itself is unchanged for the components that need it, such as media and logs.
- The unit dropdown in a graph's title row is as wide as the unit it shows. It was pinned to a fixed narrow width, which cut "KB/s" down to "K".

## 13.10.0

- A graph card no longer takes `rootClassName`, `bodyClassName` or `scroll`. They let one page give its graphs a different height, padding, gap and scrolling than every other page's, which is what the platform's bandwidth graphs did: taller cards with `padding-xs` inside while the hardware, storage and deployment graphs used the card's own spacing. Every graph is now the same card, and the uniform-shell test compares the rendered class lists instead of checking them one at a time.

## 13.9.0

- The header's sizes are fixed for every site instead of being tokens: the bar is 5rem tall, a brand logo 3.5rem, navigation links 0.875rem and menu links 1rem, the measurements machynka.cz already used. A header that reads as the same component on four sites should not be a different height on each. Colors, fonts, borders, spacing and the brand's own type size stay configurable, since a brand is a logo on one site and fluid text on another.

## 13.8.1

- The mobile menu toggle is one fixed size everywhere: a 3rem button with a 2rem icon, the size machynka.cz already used. It was a per-site token, so each site could pick a different hit target for the same control; the built-in burger grew to match. Only the toggle's color and radius remain tokens.

## 13.8.0

- Added `SiteHeader`, which owns a content site's whole header: the sticky bar, the brand, the desktop navigation, the actions and the mobile menu behind the toggle. Sites described their own header in markup and CSS, and their mobile menus drifted apart: two of them centred and shrank the open menu because the panel's `margin: 0 auto` let it collapse to its content, indenting the links and stranding the divider mid-row, and neither offered the language menu on a phone. The menu is now one full-width panel under the bar that lists the links, repeats the actions in a footer row, and closes on a link, on Escape, on a press outside the header and when the viewport grows past 768px. Links are passed as data.
- `siteHeaderRootHtml(html)` and `SITE_HEADER_ROOT_SELECTOR` wrap the server-rendered header for hydration. The wrapper is `display: contents`, so the header keeps sticking to the viewport.
- Added `BottomBar`, the mobile bottom bar built from an `items` array: links, mobile-nav toggles, buttons and custom nodes. The bar existed only as `ProductShellBottomBar`, whose items were fixed to one product's apps, notifications, profile and menu; that component is now this one with those items.
- Every value a site would restyle in either component is a token: `components.shell.header` (`root`, `height`, `maxWidth`, `paddingInline`, `brand`, `link`, `toggle`, `menu`, motion) and `components.shell.bottomBar` (height, background, border, radius, shadow, item colors).

## 13.7.0

- Added `languageName(code)`, exported from the package root: the name of a language written in that language ("Čeština", "Deutsch"), capitalised with that language's casing rules and identical on the server and in every browser. It is what the language switcher uses, and apps with their own language menus can use it instead of hardcoding language names. It returns an empty string when the runtime cannot name the language.

## 13.6.1

- The language switcher names each language in that language ("Čeština", "Deutsch", "Polski") instead of in English ("Czech"). A speaker looking for their own language can now recognise it whatever the page's current language is. Names come from `Intl.DisplayNames` with the language itself as the display locale; the first letter is capitalised with that language's casing rules, so the server and every browser render the same text (runtimes disagree on whether "čeština" is capitalised). A `label` on the locale option is used only when the runtime cannot name the language.

## 13.6.0

- `copy_card` titles render as an `h3`, matching other cards, instead of a small label.
- `copy_card` takes `rows` (the standard key/value rows) and renders them itself. Its copy button then copies those rows as `Label: value` lines, read from the page at the moment of the click, so values a page updates live are copied as currently shown; rows hidden inside the card are skipped. `emptyText` is shown when `rows` is an empty array, and the copy button is left out when there is nothing to copy.
- `copy_card` also takes `actions` (extra header content beside the copy button), `intro` (content above the rows) and `id`, which now names the card itself; its rows container derives `<id>_rows`.
- Key/value rows carry `data-tbf-key-value-row`, `data-tbf-key-value-label` and `data-tbf-key-value-value` markers. Copy buttons whose target has `data-tbf-copy-mode="rows"` read them.
- The copy components moved into their own module; imports from `@trebired/frontend/react` are unchanged.

## 13.5.0

- Added `copy_value`: an inline value with the fixed small copy button beside it, for commit hashes, URLs, fingerprints, commands and similar values inside rows and lists (`copy_card` covers the titled card). It shows the value as code by default or renders `children` (a link, a pill), and copies the text actually shown, so a value a page updates in place is copied as it currently reads. Pass `copyValue` to copy something different from what is shown, such as a full commit hash behind a short one. Without an `id`, a stable id is derived from the value so server and client markup match.

## 13.4.0

- Added `copy_card`: a card with a title on the left, a fixed small copy button on the right, an optional description, and any content below. `copy_code_card` is now built on it, so both share one header layout and one button size. Pass `target` (the element to copy) and optionally `value`, `tooltip` and `description`.
- Graph time axes label themselves from the data. When `bottomDetails` is not given and the points are timestamped, the first, middle and last ticks show the real, localised age of those samples ("41s ago", "5m ago", "now") instead of fixed strings that were wrong whenever the sampling rate or window changed.
- The graph card uses the card's own default padding (`card` class) instead of a padding utility, and its detail groups do the same.

## 13.3.1

- The graph's fullscreen button now sits in the title row, next to the title and unit control, instead of in a row of its own above the card. It is rendered by the graph card and calls the fullscreen API directly, switching between its open and exit states from the fullscreen events, so it works for cards mounted after the runtime has bound. The graph's fullscreen id and group travel to the card in its boot payload (`fullscreen_id`, `fullscreen_group`).
- Graph cards use the default `sm` spacing: the shell, plot frame, header, legend, detail groups and state overlays move from `padding-xs`/`gap-xs` to `padding-sm`/`gap-sm`.

## 13.3.0

- Graph cards now mount themselves when the runtime binds, so a graph that arrives through a soft navigation initialises like one on a freshly loaded page. Until now only page code calling `createGraphRoot` mounted a card, and the SPA never re-runs a page's script after the first visit, so returning to a page left every graph as an empty frame until a hard reload. Added `mountGraphCards(root)`; `createGraphRoot` reuses the controller already mounted for a card instead of mounting a second React root over it.
- Every graph renders the same shell. The card previously had two layouts — a plain one, and a richer one that appeared only when the caller happened to pass `toolbarContent`, `extendId`, `rootClassName`, `rootAttrs` or `scroll` — so graphs differed in structure and spacing depending on props unrelated to layout. There is now one shell for all of them.
- Fullscreen is part of that shell: a graph gets its own fullscreen target and button without the caller wiring `extendId`/`extendGroup`. Pass them to group graphs deliberately, or `extendId: false` to opt out. A toolbar holding only the fullscreen button no longer renders as a bordered strip above the plot.
- A graph never renders as a blank canvas. With no renderable points or datasets it shows an icon and "No data yet." on both the server-rendered card and after live updates, without the caller opting in; `state`, `stateIcon` and `stateMessage` still override it. The error fallback shows an error icon alongside its message.
- `readGraphBootData` no longer depends on the `HTMLTemplateElement` global, which threw where that global is absent.

## 13.2.6

- Graph cards accept `state: "empty"`, which draws a muted icon and an optional `stateMessage` over the empty plot area instead of leaving a blank canvas with no explanation. The existing `warning` state now shows its message too, and both read `stateMessage` (falling back to `description`).

## 13.2.5

- Brand-coloured icons no longer cause a hydration mismatch. The server styles such an icon with its brand colour, but the client seeds its icon cache from the server markup and kept only the SVG, so the client render produced no `style` and React reported the attribute as unmatched. A server-rendered brand icon now carries its colour in `data-tbf-icon-brand-color`, and harvesting reads it back into the cache.

## 13.2.4

- `Icon` no longer uses hooks, so calling it as a plain function (`icon({ spec })`, the call style this component API invites) is safe. Its `useRef`/`useEffect` pair became a ref callback — `renderIconElement` already returns early when the same spec is rendered — and a `useMemo` whose dependencies included objects rebuilt on every render was dropped. Rendered as a function, those hooks counted as the *calling* component's, so a component whose icon count changed between renders crashed React with "Rendered more hooks than during the previous render" / "Expected static flag was missing", and any state or effect in that component was misattributed. Rendering `<Icon />` as an element behaved correctly before and is unchanged.

## 13.2.3

- Fixed modals appearing without their fade-in, which once it started happened to every modal on the page. Closed modals carry `visibility 0s linear <duration>` so a closing modal stays visible while it fades out. `openModal` sets `data-opening` and then `data-open` a frame later, and the opening state only changed `visibility`, so it kept that delayed transition. When the browser recalculated styles between the two steps, the switch to visible waited the full duration: the fade played while the modal was still hidden, and the modal then appeared at once. Whether that recalculation happened was incidental. `promoteZIndex` reads the computed z-index of every layer it has promoted, so on a fresh page (nothing promoted yet) modals animated, and after the first popover or modal had been promoted every later open recalculated and lost its animation.
  - The opening state now uses the open state's `visibility 0s`, so a modal is visible from its first frame, at opacity 0.
  - `openModal` commits the opening state itself instead of depending on whether something else forced a style recalculation.
  - `moveLayerElementToTop` no longer re-inserts an element that is already the last one in the layer root; re-inserting a node discards the computed style a transition starts from.
- Hidden layers (`aria-hidden="true"`) no longer count when `promoteZIndex` picks the next z-index. Closed modals and popovers kept their inline z-index and stayed in the set, so every open climbed another step (1100, 1110, 1120, …) for the life of the page.
- Action forms ignore a submit while the same form is still saving, so pressing Enter again or clicking twice no longer sends a second request. `submitActionForm` returns `null` for the ignored submit.

## 13.2.2

- Fixed save modals flickering closed and open again and then leaving the page unusable. When a live update re-rendered a page while its modal was open, rebinding ran `prepareModal` over every modal and stripped `data-open` from the open one. The live overlay state then saw it as closed and reopened it, restarting its animation. If the save response closed the modal while that reopen was still pending, the queued open frame set `data-open` again after the close, and the close timer then marked the modal `inert`. The result was a modal that looked open but was `inert` and no longer tracked, so it ignored clicks and Escape.
  - `prepareModal` (and so `bindModals` and `rehydrate`) now leaves a modal that is currently open untouched.
  - `openModal` on a modal that is already open on top does nothing instead of restarting its animation.
  - A pending open frame is dropped if the modal was closed in the meantime, and the close timer no longer makes a modal that was reopened during its close transition `inert`.
  - `createLiveOverlayState().restore()` skips modals that are already open and modals closed since the snapshot was taken, so it only restores state that a DOM replacement actually lost. Added `modalCloseCount(modal)`; snapshots carry an optional `closeCount`.

## 13.2.1

- Opening a modal no longer scrolls a sticky header out of view. The scroll lock set `overflow: hidden` on `<body>`, which turns body into a scroll container; a `position: sticky` header then sticks to body instead of the viewport, and on a scrolled page it was carried away with the content (at 600px scrolled, the header sat at `top: -600px` until the modal closed). The lock now goes on the root element, whose overflow applies to the viewport without creating a new scroll container.
- Modals, fullscreen panels and the media lightbox now share one reference-counted scroll lock (`lockBodyScroll`, which keeps its name). Each used to save and restore `overflow` on its own, so closing overlays out of order could restore another overlay's `hidden` and leave the page unable to scroll — for example a modal opened from a fullscreen panel and closed after the panel. The scrollbar-width padding that fullscreen already applied now applies to every lock, so opening a modal no longer shifts the page sideways. Code that read `document.body.style.overflow` to detect a lock should read `document.documentElement.style.overflow`.

## 13.2.0

- Added tab route helpers. `tabRouteUrl(url, steps)` (root and server entrypoints) writes a `tab-<familyKey>` query parameter for each `{ familyKey, route }` step, keeping the URL's other parameters and hash, so a link can point straight at a nested tab. `@trebired/frontend/server` adds `redirectToTabs(req, res, { target, steps, status })` and `tabSectionRedirect({ sections, target, param, status })`, an express-style handler that maps a path segment (`:section` by default, matched case-insensitively) to tab steps and redirects to the tabbed page with the request's query preserved. Unknown sections call `next()`. Soft navigation already follows the redirect, so the SPA lands on the selected tab as well.
- Card icons that are images now get a rounded corner (`--tbf-surf-card-icon-radius`, falling back to the medium radius) and `object-fit: cover`, instead of rendering as a square.
- A card whose body holds only a title — no subtitle, segments or extra content — now centers that title vertically against its icon. It previously stayed pinned to the top where the missing detail rows would have started. Such bodies carry a `title-only` class.

## 13.1.23

- Removed the loaded-count pill from the logs toolbar entirely, along with everything that only existed to feed it: the `loaded` id in the logs view model, the client's `loadedEl` element handle and the stats code that wrote the count into it, and the `loadedSuffix` message. The loaded count remains available in the stats tabs. Anything that looked the pill up by id (such as `#logs-view-loaded`) now finds nothing and should drop that reference.

## 13.1.22

- Fixed fullscreen panels appearing with no entrance animation while still animating on close. The panel's entry state (`opacity: 0`, a slight scale-down) is declared on the same rule that carries the transition, so setting it started a 240ms fade *out* from the panel's current appearance; a frame later the open state set opacity back to 1 and the two cancelled out. The backdrop was unaffected because a freshly inserted element cannot transition from its initial style, which is why only the panel looked instant. The entry state is now applied with transitions suppressed, so the panel has a committed starting frame and animates in the way it animates out.

## 13.1.21

- The logs toolbar's loaded-count pill no longer carries a fixed width. It was rendered with a `width-xs` class, so the pill stayed one size no matter what it held and the count sat in a box wider than its text. The pill is `inline-flex` and already refuses to wrap, so it now sizes to its own content.

## 13.1.20

- A tooltip no longer comes back when the modal its trigger opened is closed. 13.1.18 hid it on pointer press, but closing a modal restores focus to the trigger, and once the overlay is gone the browser replays `mouseenter` on whatever sits under the still-stationary pointer — so the tooltip reappeared and stayed until the pointer happened to move. Both signals are synthetic, so tooltips now require real intent: a hover opens one only after the pointer has actually moved since the last press, and focus opens one only when the user moved focus themselves — focus that the app restores (closing a modal, leaving fullscreen) no longer counts. Hovering, moving between elements and tabbing through controls behave as before.

## 13.1.18

- Fullscreen panels now take a z-index above whatever is currently on top instead of a fixed base value. The base sat below the modal range, so fullscreening a panel that lives inside an open modal (a logs view, a graph) put the expanded panel underneath the modal it came from. Overlay and panel now climb above the current top layer, the same way tooltips, popovers and dropdowns already did.
- Modals do the same when they open, so a modal opened from inside a fullscreened panel lands above it. Modals still stack among themselves in open order.
- Tooltips now hide on any pointer press and when the tab stops being visible. A tooltip shown by hovering a button stayed on screen after the button was clicked, because opening a modal over the pointer never produces a `mouseleave`.

## 13.1.17

- Graph detail rows now render their `id` and `attrs` onto the value element, matching what `key_value` already did with `id`. Until now the graph renderer kept only the label and the formatted value, so a row's identifier never reached the DOM and nothing could address it afterwards — every live updater targeting `#someRowId` or `[data-something]` inside a graph's stat groups wrote to elements that did not exist, leaving the rendered numbers frozen at their server-rendered values.
- Added `softRedirect` to `BreadcrumbItem`. With it the item's link carries the same soft-redirect marker `TextLink` emits, so the SPA runtime handles the click instead of the browser performing a full page load. Items without the prop are unchanged.

## 13.1.16

- Fixed tooltips appearing with no entrance animation while still animating on close. Before showing a tooltip the runtime measured the layer by writing inline `transform`, `opacity`, `transition: none` and `left`/`top` onto it and reading `getBoundingClientRect()`. That read forced a style flush while the layer was held at the open transform, so the browser took that as the state to animate from and the opening slide and scale had nothing left to travel. The layer is now measured with `offsetWidth`/`offsetHeight`, which needs no style mutation at all, so the closed state is intact when `data-open` is set and the tooltip animates in exactly as it animates out.
- Fixed a hydration mismatch for every icon rendered inside a hydrated React island. On the server `Icon` inlines the SVG through the active server renderer; in the browser the icon cache starts empty, so the same component rendered no children and React found the server's `<svg>` unmatched, discarded the tree and rebuilt it on the client. The runtime now harvests the server-rendered SVG markup out of the DOM into the icon cache before an island hydrates (and at the start of `bindIcons`), so the client render carries the same markup and React skips those children instead of failing. This also spares those icons a `/__icons/svg` round trip. Exposed as `harvestInlineIcons` / `icons.harvestInline`.

## 13.1.15

- Added `contextFields` to `status_input`'s `statusCheck`. It maps request body keys to element ids; the check sends those elements' current values with the field and runs again when one of them changes. A repository name can now be checked against the owner picked in the same form. Inputs without `contextFields` send the same body as before.

## 13.1.14

- Moved to `@trebired/logger-adapter` 0.6.0, which depends on `@trebired/logger` 3.0.0.
- Updated the shipped `.trebired/logger/config.ts` `forVersion` to `3.0.0`. The logger checks `forVersion` by major and minor version, so under `@trebired/logger` 3.0 the old `2.7.0` value failed the check and this package's log prefix was dropped.

## 13.1.13

- Fixed the favicon ignoring dark mode in Chromium browsers when both `assets.favicon.light` and `assets.favicon.dark` are configured. 13.1.12 only reordered the svg links, but Chromium (Chrome, Brave, Edge) never used them: whenever any raster `rel="icon"` link is present it takes the `.ico` or PNG, which is baked from the default svg and cannot follow the color scheme. It also ignores `media` on icon links. Both were confirmed against a real Brave 153 favicon database under forced light and dark schemes.
- With both variants configured, `favicon.svg` is now one adaptive svg composed from the light and dark sources, switching with `prefers-color-scheme` inside the file, and it is the only `rel="icon"` link. `favicon.ico` and the PNG sizes are still written for surfaces that request them directly, and `apple-touch-icon` stays linked. `favicon-light.svg` and `favicon-dark.svg` are still emitted. Configuring only one variant is unchanged.

## 13.1.12

- Fixed the dark-mode favicon never showing when both `assets.favicon.light` and `assets.favicon.dark` are configured. The generator always added an unconditional `<link rel="icon">` to the default svg ahead of the two scheme-scoped links; having no `media` attribute, it always matches, so it sat as a third same-type candidate and browsers could settle on it regardless of the visitor's color scheme. That link is no longer emitted once both variants exist; its `id` (the one `syncFavicon` targets) moves onto the light variant's link instead. Configuring only one of `light`/`dark` is unaffected.

## 13.1.11

- Fixed graphs showing the loading spinner forever when a series legitimately has no data. `renderGraphRenderState` treated "no points" as "still loading", so a metric that is empty because nothing is being measured (a deployment's GPU usage when the process never touches the GPU) could never leave the loading state. An explicitly passed `loading` value is now authoritative; callers that omit it keep the previous inference.

## 13.1.10

- Changed the fullscreen restore animation to clear itself from the panel's own animation duration instead of a fixed 320 ms, so a theme with a slower `transition-normal` no longer has the animation cut off part way. The duration parser the close already used is now shared between the two.

## 13.1.9

- Added an animation to the swap between a fullscreened panel and the placeholder that holds its place in the page. The placeholder fades in and scales up when the panel leaves, and the panel does the same when it returns, so closing fullscreen no longer snaps the original content back into the page with no transition. With `prefers-reduced-motion: reduce` both appear without motion. Switching directly from one fullscreen panel to another restores the first one without the animation.

## 13.1.8

- Fixed the page shifting sideways when panel fullscreen opened and closed. Locking the page scroll added padding to the body to stand in for the scrollbar it hides, but the root already reserves that space with `scrollbar-gutter: stable`, so the padding moved the whole layout by a scrollbar width and moved it back on close. The padding is now only added when the root does not reserve the gutter.

## 13.1.7

- Added an open and close animation to panel fullscreen. The panel fades in and scales up from 98.5% when it opens, and fades back out before it returns to its place when it closes. The close now waits for the panel's own transition instead of a fixed 180 ms, so the fade is no longer cut off. With `prefers-reduced-motion: reduce` the panel appears and disappears without motion.
- Changed the canvas panel header to show the title above the toolbar instead of beside it. The title is a plain `span` with no special weight, and the gap between the title and the toolbar, like the gap between the logs toolbar rows, is `gap-xs`. The subtitle has its own class, so the muted subtitle style no longer applies to every span in the header.

## 13.1.6

- Fixed panel fullscreen being unusable. The target moves into the layer root, which is `pointer-events: none`, and nothing turned pointer events back on, so every click fell through to the dimming overlay and closed fullscreen. The target was also stacked under that overlay: `applyZIndex()` treated a missing `behind` reference as the fallback itself and returned fallback minus one step, so the overlay got 1110 and the target, asking for 1121, got 1101. A missing `behind` or `ahead` reference is now ignored, so `applyZIndex({ fallback })` returns the fallback exactly. Every layer placed that way sits one step higher than before, in the same order.
- Changed the fullscreen base z-index from 1120 to 1010, below popovers and modals. A modal opened from a fullscreened panel, such as a log's detail, used to open behind it.
- Fixed a fullscreened panel keeping its inline height instead of filling the screen. Its direct children now grow to the full height.
- Fixed the logs view ignoring fullscreen: its search field and toggle rules still used the removed `.extend-target` class, so the search field never appeared in fullscreen. They now follow the fullscreen-active attribute.
- Changed the canvas panel header, which holds the toolbar, to a `.card`. It was transparent over the panel's dot grid. It keeps `overflow: visible` so toolbar dropdowns are not clipped.
- Improved the logs view. Each render filtered every loaded log twice (for the rows and again for the stats), rebuilt every row view and re-rendered every row. Rows are now memoized, keep their view object until their entry, marker, highlight or metadata setting changes, and share stable handlers, so an update only re-renders what changed. Timestamp labels are cached and the loaded logs are filtered once per render. Opening a log's detail no longer waits for its code blocks to be highlighted: the modal opens first and the highlighting follows two frames later. Opening a detail dropped from about 200 ms to 50 to 125 ms with 200 rows loaded.
- Improved how the runtime binds added markup. Both the runtime observer and `bindElements()` ran a full bind pass over every added node, so mounting 200 log rows meant 200 passes of every binder. Added nodes are now grouped: a parent that gained more than eight children is bound once, and nodes inside another added node are skipped. `collectAddedBindRoots()` is exported from the `dom` entry. Re-rendering 200 log rows went from about 170 ms to about 115 ms of scripting.

## 13.1.5

- Changed the verification scripts and examples to print through `@trebired/logger-adapter` instead of `console` and `process.stdout`.

## 13.1.4

- Fixed the interface not responding after a soft navigation into a page with different chrome, such as signing in. Soft navigation replaced only the content and the configured `chromeIds`, so everything a page renders at the top level of the body stayed as the previous page left it. Arriving from the sign-in page, the user menu, the notifications modal and its template, and the mobile bottom bar were never inserted, and their triggers opened nothing until a full reload. Soft navigation now mirrors the new page's body-level shell and configured chrome: it replaces what both pages render, inserts what is new beside the same neighbours it has in the new page, and removes what the new page no longer renders. A chrome element the previous page lacked, such as the sidebar after signing in, used to be inserted at the top of the body; it now lands in its own container. Scripts, the content region and the runtime roots (layer, progress, flash) are left alone.
- Soft navigation now closes every open modal, popover, dropdown, tooltip and mobile navigation before swapping the page, and removes portaled overlays whose original container left the document, such as the theme menu of a replaced sidebar. Flash messages are not overlays and stay.
- Fixed the address bar keeping the requested URL when the server redirected a soft navigation. A soft reload of the sign-in page that the server redirects to the home page rendered the home page but kept showing `/login`; the address bar now follows the redirect.
- Fixed the menu item in `ProductShellBottomBar` rendering as a framed button instead of a bar item. The toggle took only the application's `itemClassName` and always carried the button surface, so it never got the bar item's layout and stood out from Apps and Profile. It now carries the bar item class and no surface.
- Added `surface` to `MobileNavToggleButton`. It defaults to `true`, so a standalone toggle keeps the button look; `false` drops the button surface.
- Buttons used as bottom bar items, such as an application's notifications slot, now reset the browser's button background, border and font, so they match the link items instead of showing a grey box.

- Restored `mediaState()`, `mediaImage()` and `mediaAvailable()` and the `MediaState` type. They read an image URL and an availability flag from a media value (a URL string, or an object carrying `image`, `url`, `avatar_url` or `avatarUrl` and `available`). 12.16.0 replaced `src/media/index.ts` with the image, lightbox and carousel primitives and dropped them without a changelog entry, so applications resolving avatars and organization icons through them failed to typecheck from 12.16.0 on. The verification now asserts they stay exported.

## 13.1.2

- Added `currentRoutePath()` and `stripLocalePrefix()`. A page served at a locale URL such as `/en/about` is prerendered from the `/about` route, but an application reading `location.pathname` rendered `/en/about` on the client, so the hydrated tree did not match the prerendered one and React discarded it. Resolve the route with `currentRoutePath()`; it removes a configured non-default locale segment and a trailing slash.

## 13.1.1

- `createLocaleShellRoutes()` and `createLocaleBootScript()` now accept every `@trebired/seo` `localeStrategy`, so the site config can be passed through unchanged. 13.1.0 typed the strategy as `"none" | "prefix"`, which rejected seo's `"query"`. With `"query"` each route is served once and the boot script reads the `lang` query parameter, so a crawler following a `?lang=` alternate renders that locale; as with `"prefix"`, a saved choice wins and the browser language is not used.

## 13.1.0

- Added `createLocaleShellRoutes()`, so a statically prerendered site can have every language indexed without sending visitors anywhere. It renders each route once per locale and returns the documents to write. With `strategy: "none"` each route is served once in the default locale. With `strategy: "prefix"` each non-default locale also gets its own URL (`/en`, `/en/about`), rendered in that locale with the others as switchable templates and carrying that locale's head, so its canonical URL and `hreflang` links come from `@trebired/seo`. Pass `@trebired/seo`'s `localeStrategy` as the strategy; that config is the one switch.
- Visitors are never redirected to those URLs. Switching language still re-renders in place and leaves the URL alone; a visitor arriving on a locale URL from a search result sees their saved language if they have one.
- `createLocaleBootScript()` takes the same `strategy`. With `"prefix"` it no longer picks the browser language, so a crawler rendering a page with an English browser indexes each URL in its own language instead of seeing it swapped. A saved choice still applies.

## 13.0.0

- Statically prerendered sites now serve every language from one URL and switch language in place. 12.15.0 gave each locale its own prefixed URL and changed language by navigating to it, so every switch reloaded the page and a saved preference redirected before paint.
- `createLocaleDocumentBody()` composes a route's prerendered bodies: the default locale as live markup, every other locale in an inert `<template>`, a title and description per locale, and a short inline script. `createLocaleBootScript()` resolves the locale before first paint (stored choice, then the `ui_lang` cookie the server runtime also reads, then the browser language) and sets `<html lang>`. When that differs from the prerendered locale, the inline script swaps the matching template in while the document is still parsing, so a reload shows the right language without waiting for the application bundle. Templates are inert, so their images and frames do not load and crawlers index the default locale.
- `setCurrentLocale()` no longer navigates. It persists the choice, updates `<html lang>`, the title and the description, and notifies `onLocaleChanged()` listeners. `LocaleProvider` and `useLocale()` follow it, so every React root re-renders in place. Pass `locale` to `LocaleProvider` only when rendering on the server.
- Soft navigation applies the same swap to the document it fetches, so moving between routes stays in the chosen language.
- Removed `parseLocalePathname()`, `buildLocalePathname()`, `localeShellRoutes()`, `localeShellOutFile()`, `normalizePathname()` and `localeHref()`. Prerender each route once per locale and pass the bodies to `createLocaleDocumentBody()`; set `@trebired/seo`'s `localeStrategy` to `"none"`.
- The server-backed `bindLocaleSwitchers()` model is unchanged.

## 12.18.0

- Added the `components.media` token group, so an application can shape `ExpandableImage` and the lightbox from its frontend config instead of overriding package CSS. `expandableImage.icon` sets the hover badge's size, radius, background and blur. `lightbox` sets the backdrop colour and blur, the close and navigation controls (size, wide-screen size, radius, background, blur, hover background), the image radius and shadow, and the caption colour, size and weight. The defaults are the values the styles used before, so an application that sets nothing renders exactly as it did.
- Fixed the `md` button size being ignored. `surfaceClass` emits `--md` like the other sizes, but there was no rule for it, so a default-size button fell back to the root height and font size and rendered smaller than the configured `sizes.md`.

## 12.17.1

- Fixed the lightbox showing an empty dark overlay. The viewer that holds the image starts transparent for the enter transition, and only the backdrop was ever marked visible, so the image loaded but was never shown. Every `ExpandableImage` since 12.16.0 was affected. The verification now opens a lightbox and asserts the viewer becomes visible.

## 12.17.0

- Added `controlsPlacement` to `Carousel`. `"sides"` keeps the existing arrows at either edge and the dots centred; `"bottom"` groups the previous and next buttons at the bottom left, moves the dots to the bottom right, gives the controls a frosted background, and lays a dark gradient over the lower part of the image so they stay legible on bright slides. It defaults to `"sides"`, so existing carousels are unchanged.

## 12.16.5

- Added `MEDIA_ICON_SPECS`, the icon specs the media system renders internally. An application enabling `media` had to know that `ExpandableImage` draws `remixicon:fullscreen-line` and the lightbox draws the chevrons, and register them in its own `assets.icons.specs`. Without them the client had no glyph for those icons while the server render did, so every page carrying a gallery failed hydration and regenerated the tree. Spread `MEDIA_ICON_SPECS` into the application's spec list.

## 12.16.4

- Restored Czech diacritics in the media labels (`Zvětšit fotografii`, `Předchozí`, `Další`, `Zavřít`, `Snímek`). They were added without them in 12.16.0, which regressed the labels for the application implementations they replaced.

## 12.16.3

- `ExpandableImage`, `Lightbox` and `Carousel` now take their language from `LocaleProvider` when no `lang` prop is given. They previously defaulted to English, so a Czech page that did not pass `lang` explicitly rendered English control labels.

## 12.16.2

- Added `media` to the system allow-list. 12.16.0 registered the system's styles and type but not its key, so declaring `systems: { media: true }` failed the build with `unsupported system media`.

## 12.16.1

- Retargeted the local `.trebired/bundler/config.ts` at 5.13.1. It still named 5.11.2, so a fresh install of `@trebired/bundler` 5.13 failed the build.

## 12.16.0

- Added a `media` system owning the image and slideshow primitives every Trebired site was otherwise hand-rolling: `ExpandableImage` (a gallery lightbox with previous/next), `Lightbox`, `Carousel` and `MapEmbed`, all exported from the React entrypoint, with their styles behind the new `media` system key.
- The lightbox now renders through a portal, traps Tab inside the dialog, moves focus in on open and restores it to the trigger on close. The application implementations it replaces did none of that, so background content stayed reachable behind an `aria-modal` dialog.
- Body scroll locking is reference counted through `lockBodyScroll()`, which returns an idempotent release and restores the previous `overflow` value rather than clearing it. Two overlapping locks no longer unlock each other.
- The lightbox close timer is cleared on unmount and on reopen, so closing and unmounting within the animation window no longer leaves a pending timer.
- `Carousel` honours `prefers-reduced-motion` and pauses on hover and focus. It renders nothing for an empty slide list and omits controls for a single slide.
- Labels for all of the above resolve through the package message tables in Czech and English instead of being hardcoded by the consuming application.

## 12.15.0

- Added locale-prefixed routing, so a statically prerendered site can serve the visitor's language from the server instead of correcting it after hydration. `createLocaleBootScript()` emits a blocking head script that resolves the locale before first paint and redirects to the prefixed URL, mirroring `createThemeBootScript()`. `localeShellRoutes()` expands a route list into one prerendered document per locale, `parseLocalePathname()` and `buildLocalePathname()` convert between prefixed and bare paths, and `configureLocaleRouting()`, `currentLocale()` and `setCurrentLocale()` own the runtime state.
- Added `LocaleProvider` and `useLocale()` to the React entrypoint. The provider supplies the locale during server rendering and again at hydration, so the two agree and the island is never re-rendered to correct the language.
- The existing `bindLocaleSwitchers()` server model (`POST /ui/lang/set` plus reload) is unchanged. Applications with a backend keep using it; statically prerendered sites use the routing API.

## 12.14.2

- Updated the shipped `.trebired/logger/config.ts` `forVersion` to `2.7.0` and the `@trebired/code-discipline` / `@trebired/configs` ranges to `^7.2.0` / `^0.4.0`. The logger config named an older release, so under `@trebired/logger` 2.7 the version check threw and this package's log prefix was dropped.
- Retargeted the local `.trebired/bundler/config.ts` at 5.11.2. It named 5.9.0, so a fresh install of `@trebired/bundler` 5.11 failed the build.
- Attached a rejection handler to the tab pane animation's `finished` promise. Cancelling a pane animation (any rapid tab switch) rejected it with an `AbortError` that nothing owned, surfacing as an unhandled rejection in the browser console.

## 12.14.0

- Added `assets.favicon` to the frontend config. It names one source SVG per browser colour scheme (`default`, plus optional `light` and `dark`), with optional `sizes` and `ico` size lists. A bare string is shorthand for `default`. Sources must be `.svg`; anything else fails normalization.
- Added `generateFaviconAssets()`, exported from `@trebired/frontend/config`. It reads the configured SVGs and returns the files to emit plus the `<link>` descriptors to render, so a consuming build never writes generated icons back into the source tree.
- Added raster output: PNG at each configured size (180 is emitted as `apple-touch-icon.png`) and a hand-built `favicon.ico` container, since the rasterizer cannot write ICO.
- Added `sharp` as an optional peer dependency. When it is absent the generator returns the SVG sources and their links and reports `rasterized: false` instead of failing the build.
- Changed the `.trebired/bundler/config.ts` `forVersion` from `5.6.3` to `5.9.0`, which had drifted behind the installed bundler and was failing `prepare:generated`.

## 12.13.0

- Changed the `forVersion` check to pass the config object to `resolveForVersion()`, which `@trebired/utils` 0.9.0 requires. A config that does not declare `forVersion` as its first key now fails instead of loading.
- Updated the `@trebired/utils` dependency range to `^0.9.0`.

## 12.12.7

### Fixed

- A card's `actions` slot rendered next to the title instead of at the right edge of the card. The
  slot is wrapped in `.right` (`margin-left: auto`), but `card_body`'s content column was a flex
  item with the default `flex-grow: 0`, so it shrank to its content (107px inside a 1319px card)
  and left `margin-left: auto` no free space to distribute. The column now uses `Stack`'s existing
  `grow` option, so it fills the card body and both the `width: "full"` and width-fit title paths
  put actions flush right.

## 12.12.6

### Fixed

- Soft navigation to a URL carrying a fragment (`/page#section`) reset scroll to the top and
  dropped the fragment from the history entry. A real document load lands on the anchor and keeps
  it in the address bar, so soft navigation now does the same: `replaceContent()` scrolls to the
  target element when the requested URL has a fragment, falling back to the top when it matches
  nothing, and `applyHistoryMode()` restores the fragment that `fetch()` strips from `response.url`.
  Applications no longer need an `onPageChange()` handler to scroll to the anchor themselves.

## 12.12.5

### Fixed

- Theme switching is now one page-level cross-fade instead of a transition per element,
  superseding 12.12.4's approach, which did not fix the stagger and made the switch slow and
  laggy. Forcing a shared duration onto `*` meant a page's worth of simultaneous
  `background-color`/`box-shadow` transitions — all main-thread paint work, so the switch janked
  and the stagger came back as paint landed in chunks — while a root `transitionend` listener took
  one bubbled event per element per property (8012 of them on a 4000-element page). It also could
  never be complete: anything without a transitionable property (gradients, images, native
  scrollbars) still snapped instantly while everything else animated. `applyTheme()` now runs the
  switch through the View Transitions API, cross-fading the whole page as a single
  compositor-driven animation with per-element transitions suppressed underneath — uniform by
  construction, since there is one animation rather than thousands. On the same 4000-element page
  this takes bubbled `transitionend` events from 8012 to 0 and roughly halves the worst frame
  time. Browsers without the API fall back to one shared duration across the color-affecting
  properties (`box-shadow` excluded, being the expensive one). `prefers-reduced-motion` switches
  instantly, as before.
- `getEffectiveTheme()`/`currentDomTheme()` now report the theme a switch has already committed to
  while that switch is still in flight. A view transition applies the DOM change from a callback
  the browser runs a frame later, so without this a second toggle click landing inside that window
  read the old value and computed `nextTheme()` back to where it started.

## 12.12.4

### Fixed

- Switching theme mode (light/dark) transitioned every element at its own locally-configured
  color/background/border-color duration — tuned per component for hover/focus feedback (120ms on
  the sidebar, 180ms on surfaces, undeclared and instant elsewhere) — because a theme switch just
  changes the CSS vars those same properties read, and the browser can't tell "this changed from a
  theme switch" from "this changed from a hover." The result looked staggered: some elements
  settled into the new colors well before others. `styles/utils/base.scss` already had a
  `[data-theme-switching="true"]` rule scaffolded for this, but nothing ever set that attribute,
  and the rule itself disabled transitions entirely (`transition: none !important`) rather than
  unifying them — trading "staggered" for "no transition," not a fix. `theme/apply.ts`'s
  `applyTheme()` now sets `data-tbf-theme-switching="true"` for the duration of a switch (cleared
  on `transitionend`, debounced, with a fallback timeout for e.g. `prefers-reduced-motion` where
  nothing transitions at all), and the CSS rule forces one shared `transition-normal` duration for
  every color-affecting property instead of disabling transitions.

## 12.12.3

### Fixed

- `bindIcon()` (`src/icons/index.ts`) had no `isInUnhydratedIsland()` guard, unlike the
  tabs/dropdown/checkbox/search/soft-redirect binders — it mutated an icon host's attributes
  (`applyElementAttrs()` sets every non-excluded key from the bind options as a raw attribute,
  including `mode`) unconditionally, even for icons inside an island still mid-hydration. Same
  failure shape as the 12.12.2 soft-redirect-link fix, just a sibling binder that had been missed:
  a `mode="static"` (or any other passed-through icon attribute) mismatch warning on every
  navigation for icons inside a `LiveIslandMount`-wrapped region. `bindIcon()` now skips elements
  inside `[data-live-island-hydrated='false']`, matching every other binder; the island's own
  post-hydration rebind picks them up once it's safe.

## 12.12.2

### Fixed

- `replaceContent()`/`replaceLiveRegions()` (`src/spa/navigate.ts`) call `replaceChildren()` on a
  swap zone, which replaces its contents but never its own attributes. An app that points
  `LiveIslandMount`'s `rootId` at the SPA's own content selector (`DEFAULT_CONTENT_SELECTOR` is
  `#live_content` among others, and that's a natural id to reuse) gets a wrapper that's never
  itself replaced — only its children are — so `data-live-island-hydrated` flips to `"true"` on
  the first navigation and then stays `"true"` forever. Every later swap inherited that stale
  `"true"` on brand-new unhydrated children: `watchIslandRemount` stopped re-mounting the island
  after the first navigation (the 12.12.1 fix for the soft-redirect-link mismatch warning made
  this worse, not better — the same guard that now correctly skips premature binding also now
  correctly keeps skipping *forever*, since nothing was resetting the flag), and the
  tabs/dropdown/checkbox/search/soft-redirect binders bound the fresh markup as if it were already
  hydrated. Added `syncIslandRootHydration()`, called right after each swap resets a live-island
  root's `data-live-island-hydrated` back to whatever the freshly fetched markup says (always
  `"false"` for a fresh `LiveIslandMount` render), so a coincident content/island root now behaves
  the same as a nested one.

## 12.12.1

### Fixed

- `bindPopstate()` (`src/spa/index.ts`) treated every `popstate` event as a real navigation and
  called `softRedirect()` unconditionally. Chromium also fires `popstate` for a same-document
  fragment change (clicking a same-page `<a href="#section">`), which `softRedirectTarget()`
  (`src/spa/links.ts`) already excludes from *click* handling but `bindPopstate()` had no
  counterpart exclusion for. A same-page hash click therefore triggered a wasted fetch,
  `replaceContent()` cycle, and progress-bar flash against the current page. `bindPopstate()` now
  tracks the last known pathname+search (updated by every `applyHistoryMode()` call as well as by
  the handler itself) and, when only the hash changed, scrolls to the target element directly
  instead of re-fetching.
- `rehydrate()` (`src/spa/navigate.ts`) ran `runSpaRebind()` — which binds soft-redirect links,
  among other things — before dispatching `"tbf:rehydrate"`, the event `mountLiveIsland`'s
  `watchIslandRemount` (`src/react/index.ts`) listens for to know when to (re)hydrate a React
  island. Rebinding a soft-redirect trigger inside swapped content added
  `data-tbf-soft-redirect-bound`/`role`/`tabindex` attributes to that DOM before the island
  hydrated over it, so React logged a hydration-mismatch warning for every soft-redirect link
  inside a React-hydrated region on every soft navigation. `bindSoftRedirectLink()`
  (`src/spa/links.ts`) now skips elements inside `[data-live-island-hydrated='false']`, the same
  guard the tabs/dropdown/checkbox/search binders already use — the island's own
  `IslandRuntimeBinder` effect re-runs `runSpaRebind()` scoped to the island once it hydrates, so
  those links still end up bound.

## 12.12.0

### Fixed

- `Card` (`src/surface/components/index.tsx`) accepted a `tone` prop and emitted `.tbf-card--<tone>`
  via the same `surfaceClass()` helper `Button` uses for its own tones, but only the button side of
  that pairing had a config-driven generator (`renderButtonToneRules`) producing matching CSS. A
  configured card tone (`components.surfaces.card.tones.<name>`) therefore added a class with
  nothing to select it: accepted, silently inert. Added `renderCardToneRules`, mirroring the button
  generator exactly.
- `classic-field-base` (the mixin every "classic" field — input, textarea, checkbox, radio,
  dropdown — shares) hardcoded `padding: 7px 9px` and `font-size: 14px` as plain values with no
  token indirection, unlike the button's full `ui-btn-root-*` treatment. Reconfiguring a field's
  default padding or font size meant opting every input into a `size` variant; there was no way to
  change the *default*. Both now read `ui-input-root-padding`/`ui-input-root-font-size`
  (`components.primitives.input.root.{padding,fontSize}`), falling back to the previous values.

### Added

- `textarea()` (and `Textarea` via `@trebired/frontend/react`), a primitive for the `.textarea.classic`
  styles `styles/input.scss` already shipped with no component to reach them. Consumers needing a
  multi-line field previously had to either hand-write the package's own `className="textarea classic"`
  (which the Trebired Writing Standard forbids: reaching for CSS or copied class names over a
  package primitive) or hand-roll the field. Supports `tone`, matching `input()`; does not support
  `size`, since that mixin sets a fixed `height`, which would fight a textarea's natural multi-line
  growth — `min-height` remains the textarea's own sizing knob.
- `flag()` (and `Flag` via `@trebired/frontend/react`), a primitive rendering the `.flag\:<COUNTRY>`
  class `assets.flags` already generates. Previously the only way to use a configured flag was to
  hand-write that class name into application markup.

## 12.11.1

### Fixed

- Soft navigation's scroll reset is now explicitly instant instead of inheriting the root
  `scroll-behavior`. `softRedirect()` reset scroll with `window.scrollTo(0, 0)`, and both that and
  the object form default to the CSS value, so under the default `smooth` the fresh page painted
  at the previous page's scroll offset and then visibly glided to the top — something a real
  document load never does. A scroll reset is not a scroll the user asked for, so it opts out
  directly; consumers no longer have to set `design.scrollBehavior: "auto"` globally, and give up
  smooth anchor scrolling, just to make router navigation behave.

## 12.11.0

### Added

- `design.scrollBehavior` (`"smooth"` | `"auto"`, default `"smooth"`) makes the root
  `scroll-behavior` configurable. It was hardcoded in the static base stylesheet since 11.0.0 with
  no way to override it from config. Because programmatic scrolls that pass no explicit
  `behavior` — `window.scrollTo({ top: 0 })`, `element.scrollIntoView()` — inherit the CSS value,
  that silently animated *every* such call in consuming apps, including scroll resets a
  client-side router needs to be instant: the new page painted at the previous page's offset and
  visibly glided to the top. Set `"auto"` and no declaration is emitted at all, so those scrolls
  are instant and callers that do want animation opt in per call. The declaration is now also
  scoped to `html` rather than `html, body` — the viewport takes `scroll-behavior` from the root
  element, so the `body` copy was redundant and only made the value harder to override.

### Changed

- `@trebired/utils` stays on `^0.8.0`; the rest of the `@trebired` packages moved onto that same
  range, so projects combining them no longer resolve two copies of `@trebired/utils`.

## 12.10.2

### Fixed

- App-shell overlays (a header's notifications modal, the user menu) stopped working after
  any soft navigation — their triggers stayed clickable but did nothing, because the
  overlay element had been deleted from the DOM. `replaceContent()` sweeps portaled
  overlays it considers stale, and judged staleness by "is this node inside the content
  root being replaced?". A portaled node lives in a layer root and is therefore *never*
  inside the content root, so the test matched every portaled overlay indiscriminately,
  shell-owned ones included. It only bit overlays that had been opened at least once,
  since opening is what portals them — which is why the failure looked arbitrary.
  `portalElement()` now records where each element was portaled from, and the sweep
  removes only overlays that originated inside the root being replaced. Overlays with no
  recorded origin (authored inside a portal root, or created detached) are left alone.
- Chrome-hosted overlays re-rendered by `swapChrome()` (a sidebar's theme and language
  menus) accumulated one duplicate copy per soft navigation. `reconcilePortaledDuplicates()`
  is meant to collapse exactly this, but skipped any candidate satisfying
  `root.contains(node)` — and it runs as `rehydrate(document)` during soft navigation,
  where that is true of every node in the page, making it a no-op on the one path that
  needed it. It now distinguishes copies by portal-root membership instead, so a freshly
  rendered inline copy correctly supersedes the stale portaled one.

## 12.10.1

### Fixed

- `.card-row[role="button"]` (the select-card layout used by `select()`, e.g. "Empty
  repository" / "Upload or import" / "Clone repository" mode pickers) never showed
  `cursor: pointer` despite being interactive — plain `cursor: auto` throughout. Added
  `cursor: pointer` (and `cursor: not-allowed` for the `aria-disabled="true"` case).
- The static dropdown's options panel could render far from its trigger when flipped to
  open *above* it, worse the more times the same dropdown was opened/closed. Root cause:
  `.dropdown-list li` uses `content-visibility: auto` (a real perf win for long lists), but
  right after the panel goes from collapsed to measured/shown, the browser doesn't always
  have an up-to-date relevance check yet, so `positionStaticOptions()`'s
  `getBoundingClientRect()` measurement could read a stale/placeholder height instead of
  the option list's true rendered height — worse and inconsistent on repeated opens of the
  same dropdown. The flip-above offset is computed directly from that height, so a wrong
  measurement lands the panel well off from the trigger once flipped, overlapping whatever
  else is on the page above it. Fixed by forcing `content-visibility: visible` on the list
  items specifically while the panel is being measured or is shown (`data-dropdown-measuring`
  / `data-dropdown-show`), leaving `auto` deferral in place for the collapsed/hidden state
  where it doesn't matter because nothing is visible anyway.

## 12.10.0

### Fixed

- The confirm/prompt flash dialogs (`confirm()`, `prompt()`, and the "type the name to
  confirm" deletion flow) built their input and buttons with raw DOM (`document.createElement`)
  and styled them with `frontendClassName("input"/"button")`. That's a separate, more generic
  fallback class (`tbf-input`/`tbf-button`) with its own CSS — different token names than the
  `input()`/`button()` primitives' real output (`input classic`/`btn`/`btn highlight`), so these
  dialog controls visibly drifted from the rest of the app's inputs (buttons happened to look
  right only because `tbf-button`'s fallback tokens coincidentally alias the same `--tbf-ui-btn-*`
  tokens `btn` uses). They now use the exact literal classes the primitives emit.

### Added

- `input({ size, tone })`: `size` (`sm`/`lg`, base/`md` unchanged) and `tone` (`red`/`yellow`/
  `green`/`highlight`, reusing the same generic tone-color tokens as pills/dots/icons) bring
  `input()`'s configurability toward parity with `button()`'s `size`/`tone` props, so consumers
  don't need to hand-roll one-off input CSS for compact fields or validation states.

## 12.9.1

### Fixed

- `closeModal` on the React `action_form`/`action_button` components (and the underlying
  `ActionForm`/`ActionButton`) was silently dropped: neither component destructured or
  forwarded it, so it fell into `...rest` and was spread onto the DOM `<form>`/`<button>` as
  an unrecognized React prop (visible as a "React does not recognize the `closeModal` prop"
  console warning) instead of reaching `submitActionForm`'s `options`/`config`. The
  vanilla `actionForm()`/`actionButton()` JS APIs added in 12.9.0 worked correctly; only the
  React wrappers were affected. `ActionForm` now includes `closeModal` in its
  `data-tbf-action-config` JSON, and `ActionButton` now sets `data-tbf-close-modal`,
  matching how both already handle `confirm`.

## 12.9.0

### Fixed

- Save-policy's unsaved-changes flash could stay visible forever after a genuinely
  successful save. `showUnsavedFlash()` reused a constant id across calls but never passed
  `update: true`, so `completeSave()`'s brief re-show (dirty is still true for one tick
  before `captureBaseline()` clears it, inside `setSaving`) created a second toast element
  sharing that id. Dismissal only ever removes the first DOM match for an id, so the
  original toast was orphaned and never cleaned up. `showUnsavedFlash()` now passes
  `update: true`, matching the flash system's own dedup-by-id convention.

### Added

- `actionForm({ closeModal: true })` and `actionButton({ closeModal: true })` close the
  nearest containing modal after a successful (or no-op) response, matching `confirm`'s
  existing opt-in pattern. Also available declaratively via `data-tbf-close-modal` on the
  form/button, or `closeModal: true` in a form's JSON action config. Opt-in and off by
  default, since most modal-hosted forms (uploads, connect-provider, template rows) should
  stay open after a successful sub-action.

## 12.8.3

### Fixed

- Search filter-bar inputs (`search()`) now show the search icon. They rendered a raw
  `<input type="search">` instead of going through the shared `input()` primitive, which is
  what actually adds the `input-search-wrap`/`input-search-icon` markup — the same primitive
  the dropdown's own search box already used. The filter bar's search field is the only one
  that had drifted from it.

## 12.8.2

### Fixed

- Live islands mismatched hydration whenever the URL carried tab route state
  (`?tab-<family>=<route>`, written by the tabs runtime on every tab switch via
  `history.replaceState`). The full-page server render is wrapped in
  `RenderCurrentUrlProvider` with the request URL, so `useRenderCurrentUrl()` (used by the
  React tabs implementation to pick the active tab) renders against it. `mountLiveIsland()`
  hydrates the island as a separate React root with no such ancestor, so it fell back to
  the empty default and always computed the first tab as active — mismatching the real
  server HTML the instant the URL pointed at any other tab. Reproduced directly: switch to
  a non-default tab, hard reload, hydration warning fires and the wrong tab briefly shows.
  `mountLiveIsland()` now wraps the island in `RenderCurrentUrlProvider` sourced from
  `window.location.href`, matching what produced the server HTML exactly.

## 12.8.1

### Changed

- Modal content now uses the `scroll-min` thin scrollbar styling by default, matching the
  dropdown panels and other scrollable inputs. Previously it used the browser's default
  scrollbar, which stood out against the rest of the UI.

## 12.8.0

### Fixed

- Live islands are re-mounted after a soft navigation. A soft navigation replaces the
  island with fresh server HTML, but the page's client module is not re-executed because
  its script src is already loaded, so nothing re-mounted the island. React never hydrated
  it and every control inside — tabs, dropdowns, checkboxes, search — stayed dead until a
  full page load. `mountLiveIsland()` now re-mounts when a rehydrate leaves an unhydrated
  island behind.

## 12.7.5

### Fixed

- Dropdown labels could render their option's raw JSON config. An option carries its config
  in a child `<script type="application/json">`, and the label fallback used `innerText`,
  which degrades to `textContent` while the option is hidden and therefore included that
  JSON. The fallback now reads the option text with scripts stripped.

## 12.7.4

### Fixed

- The post-hydration rebind added in 12.7.3 ran before React committed, so the tabs binder
  wrote `data-tabs-owner`, `data-tabs-ready` and `role` into the tree mid-hydration and
  produced a mismatch. `hydrateRoot()` returns before commit, so the rebind now runs from
  an effect inside the island instead.

## 12.7.3

### Fixed

- Tabs, advanced dropdowns, advanced checkboxes and search were permanently dead inside
  every live island. `LiveIslandMount` renders `data-live-island-hydrated="false"` and all
  four binders refuse to bind inside an island still marked unhydrated, but
  `mountLiveIsland()` only ever set the prefixed `data-tbf-live-hydrated`, so the declared
  attribute was never flipped. It is now set on hydration.
- `mountLiveIsland()` re-binds the frontend runtime over the island once hydrated. The
  binders had already run and bailed during bootstrap, so a page previously had to call
  `rehydrate()` itself to get working controls.

### Added

- `runSpaRebind` is exported from the package root.

## 12.7.2

### Fixed

- Soft navigation away from a page with React-rendered modals or popovers threw
  `NotFoundError: Failed to execute 'removeChild'`. `replaceContent()` swept stale portaled
  overlays before unmounting React roots, but a portaled overlay lives in the layer root,
  which is never inside the content root, so every React-owned overlay node was removed
  before React could unmount it. React roots are now unmounted first and the sweep only
  collects what is genuinely orphaned.

## 12.7.1

### Fixed

- Confirmations declared with `confirmationVariantAttrs()` were silently skipped. The
  action form and action button gates only accepted `data-tbf-confirm` or
  `data-tbf-confirm-title`, but `confirmationVariantAttrs()` emits
  `data-tbf-confirm-variant` / `-mode` / `-target` / `-text`, so the gate returned early
  and submitted without asking. Every variant-declared confirmation was affected,
  including repository, database, organization and app deletion. Both gates now use
  `hasElementConfirmRequest()`, which already recognised those attributes.

## 12.7.0

### Changed

- Unsaved changes now always prompt with the browser's own dialog, on every exit path.
  The flash confirm is gone. `softRedirect()` performs a real navigation instead of an
  in-place swap while unsaved work is pending, which lets `beforeunload` fire naturally,
  so an in-app link and a reload now show the same dialog.

### Removed

- `bindGuardedReload()`, `registerNavigationGuard()`, `navigationAllowed()`,
  `navigationPending()` and the F5 / Ctrl+R key interception. Chrome ignores
  `preventDefault()` on the reserved reload shortcut, so it never prevented a reload.
- Save-policy labels `leaveText`, `stayText`, `leaveDescription`, and the `confirm`
  member of `SavePolicyFlash`.

### Added

- `registerUnsavedWork(check)` / `hasUnsavedWork()` replace the guard registry.
- `bindFrontendWidgets` isolates each bind step and logs the failing step name, so one
  throw no longer silently skips every later bind.

## 12.6.1

### Fixed

- Confirming Leave on a guarded reload no longer triggers the browser dialog as well. The
  save policy `beforeunload` handler now stands down once the flash confirm has already
  approved the reload, so the user is asked once rather than twice.

## 12.6.0

### Added

- Keyboard reload shortcuts (F5, Ctrl+R, Cmd+R) now run through navigation guards, so an
  unsaved-changes flash appears instead of the browser dialog. Interception only happens
  when a guard reports pending work, so an ordinary reload is untouched.
- `registerNavigationGuard(guard, { pending })` takes a cheap predicate used to decide
  whether a reload shortcut is worth intercepting. `navigationPending()` exposes it.
- `bindGuardedReload()` is bound automatically by `bindFrontendRuntime`.

### Changed

- Default flash icon size raised from 15px to 18px.

### Note

- The browser reload button, tab close, and address-bar navigation still show the native
  dialog. Only `beforeunload` can hook those, and it cannot be customised or awaited.

## 12.5.0

### Changed

- The unsaved-changes prompt on soft navigation is now a flash confirm dialog with Stay and
  Leave buttons instead of a native `window.confirm`. `window.confirm` remains the fallback
  when no flash confirm is available.
- Navigation guards may return a promise; `softRedirect()` awaits each one. `navigationAllowed()`
  is now async.
- New save-policy labels: `leaveDescription`, `leaveText`, `stayText`.

### Note

- A real reload, tab close, or navigation to an external URL still shows the browser native
  dialog. `beforeunload` cannot be customised or deferred for async UI, so the flash dialog
  covers in-app navigation only.

## 12.4.0

### Added

- `registerNavigationGuard(guard)` lets code veto a soft navigation before it starts.
  `softRedirect()` consults every guard first and returns `false` if any declines; pass
  `{ force: true }` to bypass them.

### Fixed

- Unsaved changes now prompt on soft navigation, not only on reload. The save policy
  installed a `beforeunload` handler, which browsers fire only for a real document unload,
  so an in-app `softRedirect` discarded edits silently. It now also registers a navigation
  guard using the same condition as `beforeunload` (dirty and not currently saving).

## 12.3.2

### Fixed

- Added the missing `grow` utility rule. `primitiveStackClassName({ grow: true })` and its
  siblings emit a `grow` class, but no stylesheet ever defined it, so every layout relying
  on it silently kept `flex-grow: 0`. The editor viewer was the visible case: its content
  pane collapsed to its intrinsic width and left the rest of the row empty. Every other
  utility in that set (`no-shrink`, `no-stretch`, `fit-content`, ...) was already defined.

## 12.3.1

### Fixed

- `AdvancedTabPanel` called a hook conditionally. `props.hidden === true || useTabPanelHidden(...)`
  short-circuits, so the hook ran on some renders and not others, varying the hook count for
  one component. That violates the Rules of Hooks and surfaced as "Internal React error:
  Expected static flag was missing", corrupting fiber state and leaving controls dead.
- Path-derived page titles no longer capitalise after a sigil. `humanizeFromPath` used
  `\b[a-z]`, and a word boundary sits between `@` and the name, so `@user` became `@User`.
  Only the start of the string and words after whitespace are capitalised now, and
  `humanizeFromPath(path, { capitalize: false })` skips casing entirely.

## 12.3.0

### Fixed

- Buttons with an `actionTrigger` now fire. The trigger attributes were placed on a wrapper
  `span` around the `button`, and the action runtime deliberately ignores a click whose
  target is an interactive element nested inside the trigger, so a button always suppressed
  its own action. The attributes now sit on the `button` itself, which the trigger runtime
  already treats as a native host. This affected every `button({ actionTrigger })`.
- The advanced roadmap no longer emits the prefixed `roadmap` classes alongside its own.
  Its absolutely positioned marker left the grid defined by `roadmap__item`, so the body
  was placed in the fixed 16px marker column and rendered as a narrow strip.

## 12.2.0

### Changed

- Card titles are styled by an opt-in `card-title` class instead of the `h2` element.
  `.card h2` forced 15px/700, so an `h2` rendered smaller and heavier than an `h3` beside
  it and the heading scale was inverted inside every card. Headings in cards now follow
  the normal `h1`-`h6` scale. The `surfaces.card.title` tokens are unchanged and now apply
  to `card-title`; add that class to any element that should keep the compact label look.

## 12.1.2

### Fixed

- SPA navigation now dispatches the `live-navigation` event. It had listeners but no
  dispatcher, so save policies were never torn down on a page switch and the
  unsaved-changes flash persisted across pages. Root-scoped page cleanup could not cover
  this because a portaled modal lives outside the replaced content root. This also
  restores the SPA document-title fallback, which listened for the same dead event.

## 12.1.1

### Fixed

- Modal content no longer collapses its sections. Direct children of a scrollable modal
  body are now `flex-shrink: 0`, so a card with `overflow: hidden` can no longer be
  squeezed down to its `min-height` and clip its own content.
- A save policy is now torn down when its root leaves the page. It registered no page
  cleanup and relied on a `live-navigation` event that nothing ever dispatched, so the
  unsaved-changes flash and its `beforeunload` handler survived SPA navigation.
- Breadcrumbs take a font size from `shell.breadcrumb.fontSize` (`--tbf-shell-breadcrumb-font-size`),
  defaulting to `14px` instead of inheriting the surrounding 16px.

## 12.1.0

### Added

- The modal backdrop is now blurred by default, and the radius is configurable through
  `components.overlay.modal.backdrop.blur` (CSS variable
  `--tbf-overlay-modal-backdrop-blur`). Defaults to `8px`; set it to `0px` to turn the
  blur off.

## 12.0.12

### Fixed

- A configured dropdown selected-option background is now used exactly as given. It was
  previously blended 70/30 with the accent colour, so a configured grey rendered tinted
  with the focus blue. The accent blend is now only the fallback for consumers that do not
  configure the token, leaving the default appearance unchanged.

## 12.0.11

### Added

- `tooltip` on button props now accepts a string, rendering the tooltip marker and
  `aria-description` server-side instead of relying on a native `title` attribute.

### Fixed

- Icon button tooltips no longer cause React hydration mismatches. The tooltip runtime
  rewrote `title` into `aria-description` on hover, which could land before a live island
  called `hydrateRoot`. Declared tooltips now render their final semantics during SSR, so
  the runtime has nothing left to mutate.
- An explicitly declared tooltip is never stripped from a control that has text content.

## 12.0.10

### Fixed

- Tab lists now use the `gap-xs` spacing token by default instead of `gap-sm`.

## 12.0.9

### Fixed

- Product shell About controls now emit the explicit soft-redirect marker so sidebar About links use SPA navigation.

## 12.0.8

### Added

- Added a package-owned `data-tbf-soft-redirect` link marker and runtime binder. `TextLink` can now render `softRedirect={true}` so callers explicitly opt a link into SPA navigation without page-local click interception.

## 12.0.7

### Fixed

- Select cards now render as action-system div hosts instead of native buttons, so disabled select cards can contain real interactive children without browser-disabled button suppression.

## 12.0.6

### Fixed

- Header brand links now invoke `softRedirect` from the header runtime, matching sidebar-owned soft navigation without restoring document-wide anchor interception.

## 12.0.5

### Fixed

- Removed document-wide anchor interception. Sidebar links now invoke `softRedirect` from their owning runtime without navigation attributes or delegated document click handling.

## 12.0.4

### Fixed

- SPA anchor handling now runs in the capture phase so same-origin links inside selectable cards or other controls still route through `softRedirect` instead of falling through to native navigation.

## 12.0.3

### Changed

- Same-origin anchor clicks are now handled directly by the SPA runtime with `softRedirect`. Sidebar links render as plain anchors and no longer emit action-trigger navigation attributes.

## 12.0.2

### Fixed

- Log views now keep scrolling on the log stream itself instead of the canvas-panel wrapper. This avoids nested scroll targets that could prevent wheel and trackpad scrolling inside logs panels.

## 12.0.1

### Fixed

- Modal trigger buttons now render `aria-haspopup="dialog"` before hydration, matching the modal binder's runtime attribute and avoiding React hydration warnings for live islands that contain modal open buttons.

## 12.0.0

### Breaking

- Socket.IO connections created through `@trebired/frontend` now use websocket transport only. Caller-provided transport lists are overridden to `["websocket"]`; HTTP long-polling fallback is no longer exposed.
- Removed `connectLiveRefresh()` and the related live HTML refresh helpers. Live updates now have to carry socket payloads instead of triggering page/fragment fetches.

### Added

- `createLiveSocketServer()` now exposes `defineResource()`, a package-owned live resource API for idempotent room authorization, room naming, payload broadcasting, and change-source binding.

## 11.7.2

### Fixed

- Live-room subscriptions now use websocket transport by default. `subscribeRoom()` previously let Socket.IO start with HTTP long-polling before upgrading, which could surface periodic network requests even for socket-backed live views. Callers can still override `socketOptions.transports` explicitly.

## 11.7.1

### Fixed

- The top progress bar now starts during full page loads through the normal frontend runtime binding.
- Browser `fetch()` requests are wrapped once by the progress runtime, so ordinary GET/POST requests show the same top loader. `csrfFetch()` and `requestJson()` still support `progress: false` and strip that internal option before calling the native fetch implementation.

## 11.7.0

### Fixed

- Soft navigation shows the progress bar. `softRedirect()`, `softReload()`, and `softRefresh()` fetch a document and swap the page in place, but never touched the progress handle, so replacing a full page load also removed all of its loading feedback. They now drive the same bar a document load would.
- JSON requests show the progress bar by default. `progress.begin()`/`end()` was called from exactly one place, `actions/request.ts`, so anything going through `requestJson()` directly — every non-action fetch in an app — ran with no indication. `requestJson()` now drives it, with `progress: false` to opt out. The handle is refcounted, so callers that already wrap a request do not double-count and overlapping requests keep the bar up until the last one settles.

## 11.6.4

### Fixed

- Tooltips stay on one line until the text is genuinely long. The panel had a `max-width` but no intrinsic width, so it took whatever width the layout gave it and wrapped short labels like "Toggle theme" across two rows. It now sizes to `max-content`, capped by the existing `min(380px, 100vw - 24px)`, so it grows to fit the text on a single line and only wraps once it would exceed the cap.

## 11.6.3

### Fixed

- Heading variants now declare the variables their rules read. `renderHeadingVariantRules()` emitted only the rule block, referencing `--<prefix>-heading-<variant>-<token>`, while the configured values reached `:root` through the generic component-token path as `--<prefix>-typography-heading-variants-<variant>-<token>`. The two names never met, so every `.<prefix>-heading--<name>` rule resolved to nothing and headings silently fell back to the `h1`-`h6` element defaults. The renderer now emits its own `:root` declarations under the names the rules read, matching how `--<prefix>-surf-btn-tone-*` works for button tones and how `renderContainerRules()` beside it already behaved.
- `lineHeight` in a heading variant now applies. The declaration side abbreviates it to `line-h` via `componentTokenCssName()`, while the rule side paired the property with the unabbreviated `line-height`, so the value was dropped even once the names otherwise matched. Token names on both sides are now derived through the same abbreviation table, which covers every entry rather than the one that happened to be noticed.

### Added

- The generator refuses to emit CSS that references an undeclared variable. Any `var(--<prefix>-…)` without a fallback in the generated output must be declared either in that same output or by the package's own token stylesheets, otherwise `generateFrontendScss()` throws. Emitting half of a declaration/reference pair is silent — the rule simply does nothing — which is how the heading-variant defect shipped.

## 11.6.2

### Fixed

- `@font-face` blocks now carry `unicode-range`. The font emitter wrote one block per subset per weight per style, identical in `font-family`, `font-style`, and `font-weight` and differing only in `src`. With no `unicode-range` those blocks describe the same face, so the last one declared wins and every earlier subset's file is never requested — its glyphs fall back to the next family in the stack. A config declaring `subsets: ["latin", "latin-ext"]` therefore had one subset dead in the browser, and text mixing the two rendered from two different font resources, which also defeats kerning across the boundary because the shaper has no pair to consult. The ranges come from the `unicode.json` that every `@fontsource` package ships, keyed by the same subset names the config uses. Single-subset configs now carry their range too, so adding a second subset later cannot silently break.
- Fontsource packages are dependencies of the consuming app rather than of this package, so the metadata is resolved from the project root before falling back to this package's own resolution. A package without `unicode.json` degrades to the previous behaviour instead of failing the build.

## 11.6.1

### Fixed

- React event handlers inside `PopoverPanel` and `ModalRoot` fire again. Opening either one called `portalElement()`, which imperatively appends the node to `#tbf_layer_root` under `document.body`. React 17 and later delegate events at the container passed to `createRoot()`, so a node moved outside that container bubbles `body` → `html` → `document` and never reaches the listener: every `onClick` inside a popover or modal was dead, while the binder's own DOM listeners kept working, so the panel opened and closed but nothing inside it responded. Both components now render through `createPortal()` into the layer root, which keeps the node in the React tree — events bubble by tree position rather than DOM position — and makes the binder's `element.parentNode !== root` move a no-op. The portal is applied after mount, so the server render and the first client render still match.
- `showPopover()` re-resolves its panel by `aria-controls` id instead of trusting the element captured at bind time, so a panel that was remounted (by the portal above, or replaced by a live navigation) is still found.

## 11.6.0

### Added

- `design.breakpoints`, a named map of widths. Defaults are `xs2: 380, xs: 560, sm: 640, md: 768, lg: 900`. Each emits a `--<prefix>-bp-<name>` token, and generated responsive rules read the configured widths, so an app can align to the package instead of guessing.
- `components.typography.container.px` accepts a single value or a per-breakpoint map (`{ base, md, xs, ... }`) and emits `--<prefix>-container-px`, wrapping each step in the matching media query. Replaces the padding ramp every app restated on its page container.
- `components.typography.heading.variants.<name>` emits `.<prefix>-heading--<name>`, the same shape as `surfaces.button.tones.<name>`. Slots are `color`, `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing`, `lineHeight`, and `textTransform`; suffixing a slot with a breakpoint name (`fontSizeMd`) emits that value inside the breakpoint's media query. Heading treatment is now independent of heading level, so a hero title, a card title, and an uppercase eyebrow are variants rather than element overrides.
- `.sr-only` and `.sr-only-focusable` utilities in `styles/utils/a11y.scss`.
- `[id] { scroll-margin-top: … }` in the base reset, reading `--<prefix>-anchor-offset`, then `--<prefix>-layout-top-offset`, then `--<prefix>-header-height`, so in-page anchors clear a sticky header without app CSS.
- Base reset now sets `-webkit-font-smoothing: antialiased` / `-moz-osx-font-smoothing: grayscale` on `html, body`, `overflow-x: clip` on `html`, and `max-width: 100%; display: block` on `img`.

## 11.5.0

### Added

- Static icons no longer require a generated file in the consumer's source tree. `assets.icons.specs` declares the icon specs an app uses, and with `assets.icons.mode: "static"` the cache is materialized in memory at build time and reached through the `@trebired/frontend/static-icons` subpath. The app writes one side-effect import and calls nothing; there is no `src/**/generated/` folder to gitignore, regenerate before each build and dev boot, or sequence ahead of the bundler. Requires `@trebired/bundler` 5.7.0 or newer, which resolves the specifier during the build.
- `@trebired/frontend/static-icons` ships as a real no-op module, so the import type-checks and runs harmlessly when the build step is absent or the mode is not `"static"`.
- `generateStaticIconsModule(config, { rootDir })` is exported from `@trebired/frontend/config` for build tooling that wants the generated source directly.

`writeStaticIconCacheModule()` is unchanged, for consumers who deliberately want a checked-in artifact.

## 11.4.0

### Changed

- Locale flag CSS is now emitted only for the countries an app actually uses. `language/styles/index.scss` pulled in `country-flag-icons/3x2/flags.css` wholesale, which shipped background rules for 257 countries — 190KB of data-URIs, 52% of the generated `frontend.css` — to render the two flags a typical app shows. The generated config CSS now emits the base sizing rule plus one `.flag\:XX` rule per configured country, reading the SVGs from the `country-flag-icons` dependency the package already had. The default is `["GB", "CZ"]`, matching the built-in locale list, so a default app drops from 257 rules to 2.

### Added

- `assets.flags` config: an array of country codes (`assets: { flags: ["US", "DE"] }`), an object with `countries` and a `ratio` of `"3x2"` (default) or `"1x1"`, or `false` to emit nothing. Codes are validated as two-letter and de-duplicated; a country with no SVG in the dependency is skipped rather than failing the build.

## 11.3.0

### Added

- Every action trigger now shows a pointer cursor. `[data-<prefix>-action-trigger]`, `[data-<prefix>-href]`, and `[data-<prefix>-external-href]` get `cursor: pointer` from the actions system, so any element wired as a trigger looks clickable without the application restating it. Descendants inherit the cursor, which matters because the base reset gives `p` and headings `cursor: default` and they would otherwise show an arrow inside a clickable row. A trigger marked `aria-disabled="true"` gets `cursor: not-allowed`.

## 11.2.0

### Added

- The package now ships default values for every design scale, so an app no longer has to declare them to get a working system. `scales.height`, `lineHeight`, `padding`, `radius`, `spacing`, `textSize`, `width`, and `zIndex` previously all normalized to an empty object when omitted, which meant a config without a `scales` block emitted no `--space-*`, `--radius-*`, or `--height-*` tokens and none of the `.gap-*`, `.radius-*`, `.padding-*`, `.text-*`, or `.lh-*` utility classes. The defaults are the values the Trebired apps were each restating locally, including the `4 / 8 / 12 / 24 / 40` spacing steps that `styles/tokens.scss` already assumed as its `--tbf-gap-*` fallbacks. A declared scale still replaces the default for that scale wholesale, so existing configs are unaffected.

## 11.1.0

### Changed

- The favicon and the native scrollbar now follow the device's `prefers-color-scheme` instead of the theme selected in the app. Both are chrome the browser paints outside the page, so they are detached from the in-app theme: on a dark OS they stay on the dark variant even when the user picks light mode in the app, and vice versa. `applyTheme()` sets `color-scheme` from the device preference rather than the applied mode's scheme, the inline boot script does the same so there is no flash of the wrong scrollbar before hydration, and favicon sync reads `systemThemeKey()` rather than the effective app theme. A `prefers-color-scheme` change now re-syncs both immediately, without touching the app theme.
- The `theme_effective` cookie is unchanged and still carries the in-app theme, since server rendering depends on it.

### Added

- `deviceScheme()`, `applyDeviceScheme()`, and `onDeviceSchemeChange(handler)` exported from `@trebired/frontend/theme`, for anything else that should track the OS appearance rather than the app theme.

## 11.0.2

### Fixed

- Restored three exports that 11.0.0 removed but consumers legitimately use: `createLiveOverlayState` and `removeStalePortaledOverlays` (preserving and cleaning up portaled modals/popovers around a live content update) and `rehydrate` (re-binding a subtree after the app replaces DOM itself). They now come from `spa/`. The 11.0.0 note listing `rehydrate` and the overlay helpers as removed was wrong.

## 11.0.1

### Fixed

- Live cards and live lists subscribe again. 11.0.0 removed `FrontendRuntimeOptions.live`, which was the only way to pass a `subscribe` implementation to those two widgets, so they bound but never connected. The subscription function is now a single `adapters.subscribe` on `bindFrontendRuntime`, shared by both widgets, replacing the previous `live.cards.subscribe` / `live.lists.subscribe` pair. Both widget option types use one `LiveSubscribe` signature.

## 11.0.0

### Breaking

- The SPA/live-navigation surface is replaced. `src/live/` exported 83 symbols; the system is now six functions. Removed: `bindLiveRouter`, `createLiveNavigationAdapter`, `softVisit`, `refreshLive`, `replaceLiveContent`, `replaceLiveRegions`, `rehydrate`, `contentRoot`, `injectNewScripts`, `seedLoadedScripts`, `isFullReloadOptOut`, `beginLiveNavigation`, `retargetLiveNavigation`, `dispatchLiveNavigation`, `dispatchLivePageDispose`, `dispatchLiveContentUpdated`, `onLivePageDispose`, `currentLivePage`, `isCurrentLivePage`, `livePageIdFromUrl`, `captureFormState`, `restoreFormState`, `captureWizardSteps`, `restoreWizardSteps`, `importChildNodes`, `findMatchingRegion`, `shouldSkipLiveElement`, `bindLiveRefresh`, `bindLiveCardHost`, `disconnectLiveCardHost`, `disconnectLiveCardsWithin`, `swapLiveCardHtml`, `bindLiveListHost`, `disconnectLiveListHost`, `disconnectLiveListsWithin`, `unmountReactRootsWithin`, `disconnectLogsPartialsWithin`, and the `LiveOptions`/`LiveNavigationOptions` types.
- New API: `configureSpa(options)` once at bootstrap, then `softRedirect(url, options?)`, `softReload(options?)`, `softRefresh(options?)`, `onPageChange(handler)`, `currentPage()`, and `registerPageCleanup(root, dispose)` for components that hold page-scoped resources.
- `bindFrontendRuntime` no longer brokers navigation. `FrontendRuntimeOptions.live` and `adapters.live` are removed, and `adapters.navigation`/`adapters.reload` now default to the configured SPA, so an app that calls `configureSpa()` does not wire them at all. The runtime registers itself as the rebind hook, so navigated-in content is re-bound automatically.
- `src/live/overlays.ts` is deleted. Its five exports (`captureLiveOverlayState`, `createLiveOverlayState`, `removeStalePortaledOverlays`, `restoreLiveOverlayState`, `restoreMovedLiveOverlays`) were reachable only through a blanket `export *` and were called by nothing.
- Modules that were never navigation moved out of `live/`: `socket.ts`, `connections.ts`, and `subscriptions.ts` to `realtime/`, and `scroll-overflow.ts` to `primitives/`. Their exports are unchanged and still re-exported from the package root, so only deep import paths are affected.

### Fixed

- Component-specific navigation logic is gone from the framework. `LiveOptions` carried `cards` and `lists` fields and the runtime special-cased those two widgets by name; live cards, live lists, React islands, log partials, and the dynamic sidebar each carried a private copy of the same `live-page-dispose` listener plus its own `disconnect*Within` helpers. All five now call `registerPageCleanup()` at bind time, or `onPageChange()` where they only needed to react after a swap. Adding a new live widget no longer requires a framework change.
- Sidebar back links soft-navigate. `dynamicSidebarLinkActionTrigger()` refused a soft trigger whenever `item.navIgnore === true`, but `navIgnore` means "do not participate in active-state highlighting" (`dynamicSidebarLinkActive`), not "do not soft-navigate". Back links set it for the former and lost the latter, so every back link did a full document load. Both sidebars now share one `isSoftNavigableHref()` rule instead of two divergent copies.
- Browser back/forward soft-navigates. `bindLiveRouter` was the only thing that bound `popstate` and it was exported but never called by anything, so history navigation always did a full load. `configureSpa()` binds it.
- `softRedirect` drops the dead `updateUrl` option, which was declared on the old options type and never read, and the redundant `push` boolean that duplicated `history`.

## 10.3.0

### Added

- Four more `components.surfaces.button.root` tokens: `letterSpacing`, `textTransform`, `whiteSpace`, and `width`, reading `--<prefix>-surf-btn-root-*` with the `--<prefix>-ui-btn-root-*` primitive fallback like the existing `font-*` tokens. `white-space` was previously hardcoded to `nowrap`, so a long button label could not wrap on a narrow screen; it now defaults to `nowrap` and is overridable. The other three make uppercase, tracked, or full-width buttons reachable from config instead of application CSS.
- `components.surfaces.button.tones.<name>` accepts `borderWidth` and `borderStyle`, emitting `border-width` and `border-style` in the tone rule. A tone could previously only change border *colour*: both `border` and `borderColor` normalize to the same `--<prefix>-surf-btn-tone-<name>-border` slot, which the rule consumed as `border-color`, so a shorthand like `border: "1px solid red"` compiled to `border-color: 1px solid red` and was dropped by the browser. Use `borderWidth`/`borderStyle` for weight and style; `border`/`borderColor` remain the colour slot. Both new slots are emitted only when declared, so a tone never overrides a `root.border` shorthand it did not ask to change.
- `--<prefix>-transition-easing` token, defaulting to `ease`, alongside `--<prefix>-transition-fast` and `--<prefix>-transition-normal`. The surface button transition now reads it, so easing is themeable rather than fixed.

## 10.2.0

### Changed

- Sidebar links now soft-navigate. `SidebarLinkList` rendered plain `<a href>` elements with no trigger attributes, so every sidebar link — including back links — did a full document load while the rest of the app navigated softly through the action-trigger adapter. Internal links now also carry `data-<prefix>-href`, which the existing `bindActionTriggers()` selector already matches and routes through `options.navigation.navigate`. The `href` attribute is unchanged, so the link is still a real link for middle-click, "open in new tab", copy-link, and no-JS. External hrefs, absolute URLs, protocol-relative URLs, in-page `#` anchors, `target` other than `_self`, `download` links, and disabled items are left alone and navigate natively. The existing `data-<prefix>-full-reload` opt-out still forces a hard load.

### Fixed

- Modifier and non-primary clicks on an action trigger that is a real `<a href>` now fall through to native browser behavior instead of being turned into a same-tab soft navigation. `handleTrigger()` called `preventDefault()` on every click regardless of `metaKey`, `ctrlKey`, `shiftKey`, `altKey`, or mouse button, so ctrl/cmd-click and middle-click could not open a link in a new tab. Triggers that are not anchors with an href are unaffected.

## 10.1.0

### Added

- `components.surfaces.button.tones.<name>` now emits a `.<prefix>-button--<name>` modifier rule, so a consumer can declare its own named button tones from `defineConfig`. Previously only `highlight` had a rule, hardcoded as `--strong` in `surface/styles/index.scss`, so config could recolor that one tone but never declare another. Each declared tone gets a base rule and a `:hover` / `[aria-pressed="true"]` / `[data-<prefix>-active="true"]` rule, both reading `--<prefix>-surf-btn-tone-<name>-*` with the `--<prefix>-ui-btn-tone-<name>-*` primitive fallback, matching the existing `--strong` shape. The hardcoded `--strong` rule is unchanged.

### Fixed

- React-rendered action triggers now carry `role` and `tabIndex` in the server markup instead of having them injected by `bindActionTriggers` after load. `ensureTriggerSemantics()` set them imperatively on any non-native trigger element, which for an SSR-ed page mutated the DOM before React hydrated — React then found `role="button"` and `tabindex="0"` on nodes its element tree never had, and reported an attribute hydration mismatch on every card row. The values are identical to what the binder produced (`link` when a href is present, otherwise `button`), native elements are still skipped, and an author-supplied `role` or `tabIndex` still wins. The binder's `hasAttribute` guards make it a no-op now.
- `bindTooltips()` no longer rewrites `title` into `aria-description` at bind time. It did this eagerly while caching tooltip text, so on an SSR-ed page it stripped `title` from elements before hydration and React reported a mismatch on every `has-tooltip` element. The rewrite now happens on first hover or focus, which fires well before the browser's native tooltip delay, so the native tooltip is still suppressed and the accessible description is unchanged — `title` simply remains the description source until the tooltip is first used.

## 10.0.0

### Breaking

- Flow elements are reset to `margin: 0`. `blockquote`, `dd`, `dl`, `fieldset`, `figure`, `hr`, `ol`, `p`, `pre`, and `ul` previously kept their user-agent margins — a `<p>` carried `margin: 1em 0`, so every paragraph contributed 16px of vertical space above and below itself, and `ul` and `hr` behaved the same way. `h1`-`h6` were already reset, which made the inconsistency easy to miss. Layouts that relied on those inherited margins for vertical rhythm will close up after upgrading; use `gap` on the containing flex or grid parent, or the `m-*`/`my-*` utilities where a margin is genuinely wanted.

## 9.1.1

### Fixed

- `applyScriptNonce()` no longer injects a nonce into non-executable `<script>` blocks. It rewrote every nonce-less script tag in the rendered HTML, including the `type="application/json"` config blocks that components such as the dropdown, search controls, and search filter emit inside the hydrated React tree. Those nonces are not in React's element tree, and browsers blank a script's `nonce` content attribute after parsing, so React saw a stray `nonce=""` on the DOM node during hydration and reported an attribute mismatch on every such block. Scripts that CSP actually governs — no `type`, `module`, the JavaScript MIME types, `importmap`, and `speculationrules` — are unchanged; JSON and other data blocks are now left alone, which is correct since they are never executed and `script-src` does not apply to them.

## 9.1.0

### Fixed

- `bindThemeRuntime()` now seeds its mode registry from the generated CSS when the caller passes no theme options. It previously fell through to `DEFAULT_THEME_MODE_REGISTRY` (`{dark: "dark", light: "light"}`), so a single-mode app on a visitor with a dark OS preference had `data-<prefix>-theme="dark"` stamped on the document — a mode with no generated stylesheet behind it. Every palette token vanished, and because stamping the attribute also breaks the `:root:not([data-<prefix>-theme])` guard, both `prefers-color-scheme` fallbacks died with it. The config already reached the browser as `--<prefix>-theme-modes`; the runtime simply never read it.
- Added a `transition` declaration to the surface button. It reads `--<prefix>-surf-btn-root-transition`, falling back to `--<prefix>-ui-btn-root-transition` and then to `background-color`/`border-color`/`color` at `--<prefix>-transition-fast`, matching the properties the button's hover and pressed states actually change. Hover animation no longer has to be supplied by application CSS.

### Added

- `configureThemeModesFromCss()` and `readCssThemeModeOptions()` are exported from `@trebired/frontend/theme`. The first seeds the registry from `--<prefix>-theme-modes` and returns the resulting registry, or `null` when no frontend CSS is present; the second returns the parsed options without applying them.

## 9.0.0

### Breaking

- Heading base styles no longer use `!important`. `styles/utils/base.scss` set `margin`, `font-weight`, and `font-size` on `h1`-`h6` with `!important`, so no application stylesheet could override them at any specificity — every heading on a consuming site was clamped to the reset's sizes. The declarations are unchanged in value but now lose to ordinary application CSS, so headings an app already styled will render at the app's sizes after upgrading.
- Removed the exported `LiveSocketLogger` type from `@trebired/frontend/server`. `LiveSocketServerOptions.logger` is now typed `FrontendServerLoggerInput`, which accepts any logger-adapter logger, so existing call sites are unaffected.

### Fixed

- Heading font sizes are tokenized. `h1`-`h6` now read `--<prefix>-h1-font-size` through `--<prefix>-h6-font-size`, with the previous literals as fallbacks, so they can be set from `defineConfig` via `design.semantics.h1.fontSize`. The `max-width: 640px` overrides read `--<prefix>-h{n}-font-size-mobile` and fall back to the desktop token, so setting only the desktop token applies at every width.
- `design.semantics` keys are now kebab-cased like component tokens. `tokenDeclarations()` emitted flattened keys verbatim while `componentTokenDeclarations()` ran them through `componentTokenCssName()`, so `semantics.heading.fontWeight` produced `--<prefix>-heading-fontWeight` and silently did nothing. It now produces `--<prefix>-heading-font-weight`. Keys already written in kebab-case are unaffected.
- `createLiveSocketServer()` now stamps its own log source. The `live namespace attached` record reports `origin.source` as `@trebired/frontend` instead of inheriting the consuming app's logger identity. `server/live-socket.ts` was the only server module that called the caller-supplied logger object directly rather than routing through `resolveFrontendServerLogger()`, so its records were attributed to whichever app passed the logger in. The `logger` option is the log sink only and can no longer change how this package's own records are attributed.

## 8.6.3

- Added package-owned SPA live page lifecycle events and APIs, including navigation/page IDs, old-page disposal before DOM replacement, and page-scoped cleanup for logs, live cards/lists, dynamic sidebar subscriptions, and React live islands.
- Added the `@trebired/frontend/live` export for direct lifecycle consumption.

## 8.6.2

- Updated logger-adapter and package tooling dependency ranges to the current Trebired releases so consumers do not retain stale nested logger packages.

## 8.6.1

- Updated the logger-adapter dependency so frontend logging uses the current shared adapter release.

## 8.6.0

- Added static icon cache registration so browser and React icon rendering can work without a live icon SVG endpoint.
- Added build-time static icon cache helpers from `@trebired/frontend/server`, including `buildStaticIconCache()` and `writeStaticIconCacheModule()`.
- Added `assets.icons.mode` with static mode support and documented which package surfaces work without a backend and which require backend services.

## 8.5.0

- Removed `server/security.ts`, `server/security/cors.ts`, `server/security/policy.ts`, `server/security/helpers.ts`, and `server/request-log.ts` along with their exports (`SecurityState`, `createSecurityState`, `applySecurityToLocals`, `attachSecurityMiddleware`, `createSecurityMiddleware`, `createCorsOptionsDelegate`, `defaultCorsOptions`, `attachNonceMiddleware`, `attachSecurityHeadersMiddleware`, `attachContentSecurityPolicyMiddleware`, `attachFrontendRequestLogger`). This package no longer carries CORS, CSP, security-header, nonce, or HTTP request-logging middleware — that generic Express/Node security layer now lives in `@trebired/security`, which product apps should depend on directly. `attachFrontendServerServices`'s optional `security` service is removed along with it (it only ever wired the now-deleted `attachSecurityMiddleware`).
- `server/http.ts` is now a thin re-export of `@trebired/utils`'s `redirectResponse`, `requestBody`, `requestCookies`, `requestHeader`, `requestQuery`, `responseSecure`, `sendJson`, `sendText`, `serverObject`, `serverString`, `setResponseHeader`, and the `CookieOptions`/`HeaderMap`/`ServerRequestLike`/`ServerResponseLike` types, which moved there so `@trebired/security` and this package can share one framework-agnostic req/res layer without a `@trebired/security` → `@trebired/frontend` dependency. Existing imports from `@trebired/frontend/server` are unaffected.
- Bumped the `@trebired/utils` dependency to `^0.8.0`.

## 8.4.3

- Increased the disclosure card's padding from `--tbf-gap-xs` to `--tbf-gap-sm`. In apps whose theme collapses `gap-xs`/`gap-xs2` down to the same very small value, `padding: var(--tbf-gap-xs)` rendered close enough to 0 that the card read as having no padding at all.
- Restored the sidebar's block-start padding (previously zeroed out), now exposed as `--tbf-sidebar-padding-block-start` (default `20px`) alongside the existing `--tbf-sidebar-padding-block-end`.

## 8.4.2

- Removed the disclosure trigger's hover color/underline on its label text, leaving the cursor as the only hover affordance now that the trigger has no box chrome of its own.
- Made the disclosure's arrow indicator bigger (`1.35em`) and muted (`--tbf-text-muted`) instead of matching the trigger's own text size/color.
- Fixed page content shifting horizontally when a modal opens or closes. The modal locked body scroll by toggling `overflow: hidden` and manually measuring/compensating for the scrollbar's width with `padding-right`, but `closeModal` reverted that compensation synchronously (before the 220ms close transition finished), so the scrollbar reappeared and the page visibly jumped left mid-animation. `html` now reserves `scrollbar-gutter: stable` unconditionally, so the scrollbar's width never changes the content width in the first place; the modal's manual scrollbar-width measurement and compensating `padding-right` are removed as no longer necessary.

## 8.4.1

- Fixed the sidebar rendering with a gap below the header on pages with a secondary header. The sidebar's top offset was wired to `--tbf-layout-top-offset`, which includes the secondary header's height, but the secondary header only renders inside the main content column (never full-width above the sidebar), so that extra height showed up as a dead gap. The sidebar now offsets by `--tbf-header-height` alone.
- Redesigned the disclosure's spacing and trigger: the card now uses a single uniform `--tbf-gap-xs` padding on all sides (replacing the previous asymmetric per-element padding), and `--tbf-gap-sm` now separates the trigger from the panel content. The trigger itself no longer has its own padding or a full-row hover background — only its label text responds to hover — so it reads as plain clickable text rather than a nested button/chip.
- Moved the disclosure's arrow indicator to the end of the trigger row (`margin-inline-start: auto`) and made it rotate 90° when open, so it now reflects the disclosure's state instead of being a static glyph.
- Fixed the disclosure panel losing its grid-based collapse when a consumer passed a `panelClassName` that set `align-items` (e.g. `inline-row`, used to lay out the 2FA manual-key/copy-button row) — the panel's own `align-items: stretch` is now asserted explicitly, since otherwise the panel content stopped stretching into the collapsed 0-height row and rendered at its natural height regardless of open/closed state.

## 8.4.0

- Fixed the fixed-position sidebar rendering underneath the fixed header instead of below it. `[data-tbf-sidebar]`'s `position: fixed` top offset defaulted to a bare `0`, so consuming apps that pair the sidebar system with a normal-flow header (rather than manually wiring `--tbf-sidebar-offset-block`) got the first ~header-height worth of sidebar content rendered behind the header and effectively invisible. It now defaults to the existing `--tbf-layout-top-offset` variable, which the layout system already keeps in sync with the actual header height.
- Removed the sidebar's block-start padding so the first sidebar item sits flush with the sidebar's own top edge instead of leaving a gap; block-end and inline padding are unchanged. Exposed as `--tbf-sidebar-padding-block-end` and `--tbf-sidebar-padding-inline` (replacing the single `--tbf-sidebar-padding` shorthand, which nothing overrode).
- Increased sidebar link inline-start padding from 11px to 16px so items no longer sit flush against the sidebar's edge. Exposed as `--tbf-sidebar-link-padding-inline-start`/`-end` (replacing `--tbf-sidebar-link-padding`, which nothing overrode).
- Gave the disclosure trigger its own style instead of sharing the dropdown-trigger/tabs-tab "chip" rule, which gave it its own border and background independent of the disclosure's own card wrapper — so a card disclosure visually looked like a bordered button nested inside another card rather than one seamless card. The trigger is now a plain full-width row (also resetting native `<button>` chrome, which the removed border had been masking).
- Added a real open/close animation to the disclosure panel using a `grid-template-rows` transition (0 to content height), replacing the previous instant `hidden`-attribute toggle. The panel now stays in the layout and is marked `inert` while closed instead of `hidden`, matching the `inert` convention already used by this package's modal/popover/wizard components.

## 8.3.1

- Bounded the icon server caches. The SVG markup, resolved colour, colour mode and composed HTTP response caches were plain unbounded maps keyed by icon spec, so their size was driven by request input rather than by application need; with several thousand icons available across the installed packs they could grow to tens of megabytes. Each is now a small LRU bounded to 512 entries, which covers the icon set a real page uses while keeping worst-case memory flat. Output is unchanged.

## 8.3.0

- Removed per-request filesystem and module-resolution work from the icon server. `resolveIconPackRoot()` ran full Node module resolution (`createRequire` + `require.resolve`) on every icon lookup because it was part of the SVG cache key, and `resolveIconColor()` re-read the icon file from disk with `readFileSync` on every call even when the SVG itself was already cached. Both are now memoised, the derived colour mode is cached, and `createIconSvgResponse()` caches its composed response body. Rendering an icon no longer performs any filesystem syscall after the first resolution, which matters most for server-rendered pages that emit many icons and for the `/__icons/svg` route. Output is byte-identical.

## 8.2.9

- Added `bindLiveLists`/`live.lists` runtime support so `entity_list`'s `<live-list>` marker (rendered whenever a list is given a `live: {room, event}` config) actually gets bound to something. Previously the marker was rendered but nothing ever subscribed to it, so lists relying on this feature silently never refreshed after the resource they list changed elsewhere (e.g. after creating a new item, the list stayed stale until a manual page reload). It now soft-reloads the current page on a matching live event, consistent with the existing `live.cards` wiring.

## 8.2.8

- Reversed the sidebar's bottom controls stacking order when the sidebar is minimized, so the first control (minimize) lands at the bottom instead of the top.
- Hid dynamic sidebar link count, state, and loader slots when the sidebar is minimized, matching the existing label/badge hiding so only the icon remains.

## 8.2.7

- Added a `minimized` prop to `ProductShellSidebar`, forwarded to `SidebarShell`, so consuming apps can render the sidebar's minimized state server-side instead of only correcting it client-side after mount, which caused a visible flash from expanded to minimized on full page loads.

## 8.2.6

- Fixed `ProductShellAboutButton` leaking its `productName` prop onto the rendered `<a>` element as an unrecognized DOM attribute, triggering a React warning. The label text already comes fully formed through `labels.about`, so `productName` was never read by this component.

## 8.2.5

- Fixed `mountLiveIsland`/`mountReactRoot` crashing with `TypeError: react.createElement is not a function` when a dynamic `import("react")` or `import("react-dom/client")` resolved to a CJS/ESM interop namespace object missing the top-level named exports. Both dynamic imports now fall back to `.default` when the expected export isn't found directly on the namespace.
- Fixed the sidebar's bottom controls row staying in a row and getting cut off when the sidebar is minimized; it now switches to a vertical column.

## 8.2.4

- Fixed dynamic sidebar links falling back to a full page navigation instead of SPA soft navigation. `wrapTriggerHostNode()` was called with a component reference rather than the raw `<a>` element, so it wrapped the link in an outer `data-tbf-href` span instead of setting the attribute on the anchor itself; the click handler's nested-interactive-element guard then saw the inner `<a>` as a separate element and declined to intercept the click. The action-trigger attributes are now applied directly on the anchor.

## 8.2.3

- Removed dead `config.creator` from `package.json`.
- Updated shared utilities to `@trebired/utils@^0.6.0` and replaced the removed `readPackageIdentity()` with `readPackageJsonUrl()` + `readOrganizationIdentity()`. No change to `frontendPackageName()`/`frontendConfigPath()`/`PACKAGE_VERSION` behavior.

## 8.2.2

- Fixed the dynamic sidebar loader crashing the page render when a link item has no loader path configured, which broke server-rendered navigation after sign-in and after completing the welcome flow.

## 8.2.1

- Fixed dropdown option registration running twice on bind, halving JSON config parsing and attribute writes on long option lists.
- Skipped redundant attribute writes when re-syncing dropdown option state that has not changed, cutting DOM writes on every selection change in long lists.
- Added scroll containment to dropdown option rows so browsers skip layout and paint for off-screen options in long lists.
- Fixed the dropdown search input collapsing instead of filling the available row width next to the clear button.

## 8.2.0

- Restored upload remote selections from an upload-owned hidden field slot after preserved live refreshes.
- Added remote upload selected-label configuration for app-owned external file sources.
- Cached generic search-panel records and scheduled search renders to reduce lag in long dropdowns.
- Moved search input icon wrapper styling into the shared input styles so dropdown search icons stay inside the field.
- Suppressed tooltips on text buttons while keeping icon-only controls and status indicators tooltip-enabled.

## 8.1.0

- Added upload remote-action rendering for app-owned external avatar sources.
- Added `setUploadRemoteSelection()` so apps can apply remote upload previews without package-specific lookup logic.

## 8.0.0

- Moved frontend namespace prefix ownership to `@trebired/bundler` generated TypeScript and Sass helpers.
- Removed user-facing frontend `prefix` config while keeping package DOM/CSS output under the package-owned `tbf` prefix.
- Replaced authored `tbf-*`, `data-tbf-*`, `--tbf-*`, and `tbf:*` source literals with namespace helpers.

## 7.1.17

- Updated shared utilities to `@trebired/utils@^0.4.4`.

All notable package changes are documented here.

## 7.1.16

- Updated shared utilities to `@trebired/utils@^0.4.3`.
- Moved frontend package identity/config path resolution onto the shared package identity helper.

## 7.1.15

- Kept text-link styling generic and token-driven while making hover/focus decoration changes apply instantly without package-owned animation.

## 7.1.14

- Made text-link hover feedback use animatable color and underline-color transitions instead of snapping underline style.

## 7.1.13

- Aligned advanced dropdown CSS selectors with the runtime attributes so hidden wizard-step dropdowns open and selected options style correctly.

## 7.1.12

- Tightened upload metadata text line-height and made upload metadata spacing use `gap-sm`.

## 7.1.11

- Bound dynamically assigned tooltip text so async status icons keep tooltips after preserved live refreshes.

## 7.1.10

- Removed stale portaled chrome overlays during preserved live refreshes.
- Prevented repeated locale soft-refreshes from leaving duplicate language/theme menus.

## 7.1.9

- Preserved file inputs and upload runtime state during locale-triggered live refreshes.
- Prevented upload-used pages from falling back to hard navigation during preserved soft reloads.

## 7.1.8

- Corrected `ViewportCenter` height inside padded layout content so it does not create unnecessary page overflow.
- Made href-only action triggers bind to the soft-navigation runtime and apply trigger attributes directly to host elements.
- Added pointer cursor feedback to upload cropper resize handles.

## 7.1.7

- Allowed the upload cropper stage to show resize handles when they sit on exact-fit edges.

## 7.1.6

- Kept upload cropper resize handles visible when the crop box touches the image boundary.

## 7.1.5

- Replaced upload cropper adaptive blending with paired black and white strokes for outer and inner guides.

## 7.1.4

- Made upload cropper internal guides stay above the crop face and use full adaptive contrast.

## 7.1.3

- Made upload cropper guides, borders, and handles use adaptive per-pixel contrast over the image.
- Reduced upload cropper selection lines from 4px to 2px.

## 7.1.2

- Corrected `ViewportCenter` centering when rendered inside padded layout content.

## 7.1.1

- Exported `ReloadAdapterOptions` through the public actions barrel.

## 7.1.0

- Added `ViewportCenter` as the shared viewport-centering component for layout content.
- Made locale-triggered SPA reloads request preserved live form and wizard state.

## 7.0.7

- Made locale switching use the configured SPA reload adapter and default to frontend soft reload instead of forcing a document reload.

## 7.0.6

- Fixed the upload stylesheet fallback so non-drop upload fields use solid borders even without app token overrides.

## 7.0.5

- Made upload fields use a solid border unless drag-and-drop is enabled.
- Added a visible drag-over state for drop-enabled upload fields.

## 7.0.4

- Added a tooltip panel shadow token so tooltips match other overlay surfaces.
- Made upload clear buttons use the generic localized Remove action label.
- Removed the empty upload filename native tooltip and tightened upload internal spacing.

## 7.0.3

- Made upload fields keep helper text, accepted formats, selected filenames, and single-file selections from expanding the component height.
- Added default upload button icons while keeping buttons on the configured `.btn` component styling.
- Made fixed-height wizard steps scroll overflowing content instead of clipping it.

## 7.0.1

- Updated the shared Trebired config dependency to `@trebired/configs@^0.1.2`.

## 7.0.0

- Renamed the public frontend config definer and loader helpers to `defineConfig()`, `findConfig()`, and `loadConfig()`.
- Updated generated namespace loading to use `@trebired/bundler/config`.
- Replaced the Code Discipline preset dependency with `@trebired/configs`.

## 6.16.0

- Added package-owned frontend request logging middleware for document requests, static-success suppression, and generic browser probe suppression.
- Added package-owned frontend performance middleware with request context counters, `Server-Timing`, slow-request summaries, and shared record helpers.
- Moved React document/component/root resolution observability into the frontend renderer when a package logger is supplied.

## 6.15.9

- Stopped frontend browser package logs from writing to the browser console by default, preventing dev runners from mirroring them into backend terminal logs.
- Switched frontend browser log source to the package name so browser log groups keep package-owned prefixes.

## 6.15.7

- Fixed wizard first-load height stability by hiding inactive SSR steps and removing runtime height measurement so CSS/SSR shell sizing stays stable through font readiness.

## 6.15.6

- Fixed wizard SSR sizing by rendering first/last step metadata and CSS-only initial footer visibility so the first paint matches the hydrated measured layout.

## 6.15.4

- Adopted the external `@trebired/configs` preset and updated Code Discipline tooling to `@trebired/code-discipline@^6.0.9`.
- Consolidated repeated frontend runtime helpers for boolean data attributes, close buttons, icon response locals, and React root caching.

## 6.15.3

- Updated the Code Discipline devDependency and lockfile to public `@trebired/code-discipline@^5.5.2`.
## 6.15.2

- Adopted the shared Trebired Code Discipline preset so package configs only keep repo-specific policy.
- Updated the Code Discipline devDependency and lockfile to public `@trebired/code-discipline@^5.5.1`.

## 6.15.1

- Fixed package static route resolution in runtimes that require `import.meta.resolve` to be called on `import.meta`.
- Kept wizard SSR sizing active until a real client measurement is available so early initialization cannot collapse the page before a later load pass corrects it.

## 6.15.0

- Added a configurable server React permission-state builder so apps can keep permission scope policy in config while the package owns render-shell serialization.

## 6.14.1

- Closed stale package modals and popovers before removing portaled overlay nodes during live DOM updates so overlay runtime state stays consistent.

## 6.14.0

- Added package-owned live overlay state helpers for preserving modal scroll, active tabs, portaled popovers, and portaled dropdowns around live DOM updates.

## 6.13.0

- Added package-owned live Socket.IO server helpers for resource rooms, room authorization, broadcasting, and sidebar live sync.
- Added reusable server security policy helpers for nonce middleware, security headers, content security policy, and CORS option delegation.
- Added verification coverage for the new live socket and security policy server APIs.

## 6.12.1

- Added server fallback helpers for HTML document detection, current render-mode path selection, and document-vs-JSON fallback dispatch.
- Reused package-owned sidebar-live route and protocol helpers so apps keep only their live room mapping and data resolvers.

## 6.12.0

- Added adjustable SEO defaults for indexability, robots directives, canonical URLs, social preview tags, verification tags, alternates, and JSON-LD structured data.
- Added package-owned SSR SEO head rendering for product-shell documents.
- Added optional robots.txt and sitemap.xml route helpers.
- Added backend framework helpers for frontend service attachment, sidebar-live routes, and render-mode UI application.

## 6.11.5

- Aligned browser logger transport writer types with logger transport return values.

## 6.11.4

- Preserved the concrete browser logger return type from `createLog` in the browser frontend logger factory.

## 6.11.3

- Added a generic browser frontend logger factory so apps provide only boot-data/config callbacks and the concrete logger creator while the package owns browser error binding and frontend log batch transport.

## 6.11.2

- Added generic product identity helpers for slug-derived frontend names, theme sync channels, theme headers, progress IDs, workflow paths, and repository IDE message types.

## 6.11.1

- Applied default icon aliases and icon server pack defaults when attaching icon server services.
- Allowed `attachFrontendServerServices({ icons: true })` so apps can enable package-owned icon services without local alias plumbing.

## 6.11.0

- Added shared default icon aliases for common ecosystem actions, entities, and status states.
- Added default icon server option builders for Remix Icon, Simple Icons, and Material Icon Theme file icons.
- Added generic entity-key and entity-icon alias helpers so apps keep only their entity registry data.

## 6.10.0

- Added bound theme, language, and sidebar server factories so apps configure frontend server state once and use package-owned helpers from that config.
- Added `attachFrontendServerServices()` for package-owned attachment of frontend security, navigation, locale, SEO, theme, language, sidebar, favicon, icon, Monaco, and static package routes.
- Added generic static directory and package static route helpers for frontend assets such as Monaco without app-owned Express/static wrapper logic.

## 6.9.0

- Added server helpers for attaching current-navigation locals and the full icon server system.
- Added `attachIconServer()` so apps can configure icon aliases, icon HTML locals, and the icon SVG route from package APIs.

## 6.8.0

- Added config-owned icon aliases under `assets.icons.aliases` so apps can define reusable icon names without local duplicate maps.
- Added root icon alias normalization/resolution helpers and a server helper for attaching icon aliases to app/response locals.

## 6.7.1

- Exported `iconSpec` and shared icon normalizers from the browser/root icon API for app-owned icon spec maps.

## 6.7.0

- Added configurable server icon packs so apps can opt into custom SVG packages such as `material-icon-theme`.
- Added Material Icon Theme helpers for resolving file, folder, language, and file-entry icon specs from package metadata.
- Loosened frontend icon config and runtime parsing to normalize custom icon pack specs while keeping server responses limited to configured packs.

## 6.6.1

- Re-exported React server renderer option/context types from `@trebired/frontend/server`.

## 6.6.0

- Added server framework helpers for asset responses, locale locals, page task timeouts, and adapter-based React document rendering.
- Exposed React SSR shell assembly hooks so apps supply product data, permission state, component resolution, and title rules without owning document orchestration.
- Added verification coverage for asset compression/cache behavior, locale middleware, page task fallback results, and React document rendering.

## 6.5.0

- Added public server helpers for frontend security locals and render-mode UI composition.
- Exported shared current-navigation matching helpers from the root package for browser and SSR chrome.
- Added verification coverage for security locals and framework render-mode middleware hooks.

## 6.4.0

- Added public server helpers for UI language cookies, language routes, SSR current-navigation state, and SEO/head middleware.
- Added verification coverage for language selection, active navigation, and SEO response headers.

## 6.3.0

- Added public server helpers for theme cookies, theme toggle handlers, sidebar preference handlers, themed favicon routes, and live-request detection.
- Added theme runtime browser sync options for effective-theme cookies and themed favicon href updates.

## 6.2.1

- Added a generic React fallback title boot script helper for apps using live navigation without owning local document-title boot code.
- Added a namespace event helper so package-generated event names come from the frontend prefix configuration.

## 6.2.0

- Added generic React `ProductShellLayout` and `ProductShellDocument` APIs so apps can pass product-specific render callbacks instead of owning layout/sidebar boot orchestration.
- Added `readProductShellLayoutState()` and `productShellCurrentPath()` for package-owned shell visibility, sidebar side, theme, and current-path state.
- Added package-owned default product-shell sidebar controls for minimize, theme, language, and about actions.

## 6.1.1

- Exported save-policy APIs from the root package entry.
- Added generic React `actionTrigger()` host markup for apps replacing local action-trigger wrappers.
- Loosened action request and decoded payload types for existing typed app callbacks while preserving package-owned event names.

## 6.1.0

- Added public action form/button request APIs, lifecycle events, response-action helpers, and action payload helpers so apps can drop local action runtime wrappers.
- Added package-owned live navigation, rehydration, live card, live region, socket, sidebar sync, scroll-overflow, and live field refresh helpers.
- Added generic save-policy, data, media, file, viewer, socket, and React asset helpers for ecosystem apps.
- Exposed page-load progress boot helpers through the package progress API.

## 6.0.8

- Added generic selector binding helpers, DOM element helpers, paged JSON fetching, and infinite observer utilities to the root frontend API.
- Moved dropdown hidden-input synchronization into the package action form runtime so apps no longer need local form-submit wrappers for package dropdowns.
- Reused the shared DOM helpers in logs/sidebar internals and kept the package free of custom-element registration behavior.

## 6.0.7

- Moved generated font-face CSS before package component styles so configured webfonts are discoverable before the first styled paint.

## 6.0.6

- Added configurable `components.overlays.modal` tokens for modal backdrop, content, and motion styling.
- Added Remixicon close and checkbox icons to upload cropper Cancel and Use image actions while keeping the normal `btn` class.

## 6.0.5

- Changed upload field trigger, clear, and cropper action buttons to use the normal `btn` primitive class instead of upload-specific button classes.
- Removed upload-specific button style tokens so upload customization stays scoped to layout, surface, preview, metadata, list, and cropper styling.

## 6.0.4

- Added structured `components.primitives.upload` tokens for upload fields, upload buttons, previews, drag/selected states, and cropper styling.
- Routed upload and upload cropper SCSS through the new component tokens so apps can customize upload styling from frontend config.

## 6.0.3

- Updated the package Code Discipline config to the platform-aligned rule set, including formatting, redundant path segment cleanup, removable comment checks, structural blank lines, and dry checks.
- Updated the Code Discipline devDependency and lockfile to the current public `@trebired/code-discipline@^5.3.0`.

## 6.0.2

- Routed generated font CSS custom property names through the frontend namespace helper.

## 6.0.1

- Routed file input button styling through `components.primitives.input.file.button` tokens instead of the removed flat file-input token namespace.

## 6.0.0

- Replaced the flat frontend config shape with structured `assets`, `design`, `runtime`, and grouped `components` sections.
- Removed legacy top-level config paths such as `fonts`, `icons`, `palette`, `scales`, `theme`, and `interactions`.
- Reworked component styling tokens into grouped namespaces for primitives, surfaces, overlays, feedback, shell, and data components.
- Moved active press feedback config to `design.interactions.activePress`, still disabled by default with `0.9` as the default brightness when enabled.
- Moved progress runtime tokens to `runtime.progress` and flash tokens to `components.feedback.flash`.

## 5.1.2

- Added `createFrontendTokenHelpers()` for typed frontend config references to palette scale, mode-suffixed palette, semantic variables, CSS variable fallbacks, borders, and color mixes.

## 5.1.1

- Made active press brightness opt-in by default while preserving `0.9` as the default brightness value when enabled.
- Added configurable header brand tag vertical offset tokens for apps that need to tune logo-adjacent tags.

## 5.1.0

- Added package-owned bundler prefix config and generated namespace helpers so the runtime prefix comes from config instead of being an implicit source convention.
- Made theme runtime binding idempotent so mutation-observer rebinding cannot revert a user-selected theme back to SSR/default state.
- Fixed popover hiding to release focused descendants before applying hidden/inert state.
- Added global config-driven active press feedback through `interactions.active`.

## 5.0.11

- Added a configurable `TextLink` primitive backed by `components.textLink` tokens and kept the legacy `text-link` class as the same package-owned style.
- Switched product shell support links to render through `TextLink` without overriding link color or decoration in shell-specific CSS.

## 5.0.10

- Added a combined React boot script component and document alias so apps can emit theme, layout, and sidebar boot scripts from one package API with component-level enable/disable flags.
- Added package-owned header logo/tag markup with horizontal or vertical tag alignment.
- Fixed tooltip arrow border rendering and first-frame tooltip positioning stability.
- Routed remaining source debug logging through the frontend logger adapter with no console fallback, and added verification against direct browser logging.

## 5.0.9

- Changed tooltips to use neutral surface/input tone defaults, added configurable tooltip component tokens, and added arrow styling with smoother placement-aware transitions.

## 5.0.8

- Split popover trigger binding from open state so SSR markup for closed popovers no longer carries an open-state attribute.

## 5.0.7

- Scoped header runtime and sticky selectors to real header elements so body-level SSR layout attributes do not affect hydration measurements.
- Forwarded configured theme mode keys through product shell theme controls so the active theme option is rendered correctly during SSR.

## 5.0.6

- Made product shell theme popovers render with popover data attributes during SSR so they are hidden and styled before client binding.
- Added SSR body/header layout state for primary and secondary headers so initial layout offsets no longer start from zero and then correct after boot.

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
