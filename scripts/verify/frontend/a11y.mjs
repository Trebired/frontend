import assert from "node:assert/strict";

function verifyAttributes(api) {
  assert.equal(api.A11Y_REDUCE_MOTION_ATTR, "data-tbf-reduce-motion", "the resolved motion state is namespaced");
  assert.equal(api.A11Y_MOTION_PREF_ATTR, "data-tbf-motion-pref", "the choice is kept apart from the resolved state");
  assert.equal(api.A11Y_TEXT_SIZE_ATTR, "data-tbf-text-size");
  assert.equal(api.A11Y_HIGH_CONTRAST_ATTR, "data-tbf-high-contrast");
  assert.equal(api.A11Y_MAIN_ID, "tbf-main-content", "the skip link and the main element agree on one id");
}

function verifyMotionResolution(api) {
  const root = document.documentElement;
  root.removeAttribute(api.A11Y_REDUCE_MOTION_ATTR);
  assert.equal(api.motionReduced(), false, "with no attribute and no media query, motion is allowed");
  root.setAttribute(api.A11Y_REDUCE_MOTION_ATTR, "on");
  assert.equal(api.motionReduced(), true, "the resolved attribute wins over the media query");
  root.setAttribute(api.A11Y_REDUCE_MOTION_ATTR, "off");
  assert.equal(api.motionReduced(), false, "an explicit allow survives an operating system that asks for less");
  root.removeAttribute(api.A11Y_REDUCE_MOTION_ATTR);
}

function verifySettings(api) {
  assert.deepEqual(
    api.normalizeA11ySettings({ contrast: "nonsense", motion: "reduce", textSize: 150 }),
    { contrast: "system", motion: "reduce", textSize: 150 },
    "an unknown value falls back to following the system rather than guessing",
  );
  assert.deepEqual(
    api.mergeA11ySettings(api.EMPTY_A11Y_SETTINGS, { textSize: 999 }),
    { contrast: "system", motion: "system", textSize: 100 },
    "a text size nobody offers is refused",
  );
}

function verifyAnnouncer(api) {
  assert.equal(api.announce(""), false, "an empty announcement is not made");
  assert.equal(api.announce("Reduced motion on"), true);
  const node = document.querySelector(`[${api.ANNOUNCER_ATTR}]`);
  assert.ok(node, "the announcer is created on first use");
  assert.equal(node.getAttribute("aria-live"), "polite");
  assert.equal(node.textContent, "Reduced motion on");
  assert.equal(document.querySelectorAll(`[${api.ANNOUNCER_ATTR}]`).length, 1, "one announcer per document");
  api.announce("High contrast on");
  assert.equal(document.querySelectorAll(`[${api.ANNOUNCER_ATTR}]`).length, 1);
}

function verifySkipTarget(api) {
  const main = document.createElement("main");
  document.body.append(main);
  api.ensureSkipTarget(document);
  assert.equal(main.id, api.A11Y_MAIN_ID, "the skip link always has somewhere to land");
  assert.equal(main.getAttribute("tabindex"), "-1", "the target takes focus without entering the tab order");
  main.remove();
}

function verifyBootScript(api) {
  const source = api.createA11yBootScript({ defaults: { contrast: "system", motion: "reduce", textSize: 150 } });
  for (const attribute of [
      api.A11Y_MOTION_PREF_ATTR,
      api.A11Y_REDUCE_MOTION_ATTR,
      api.A11Y_TEXT_SIZE_ATTR,
      api.A11Y_HIGH_CONTRAST_ATTR,
      api.A11Y_CONFIG_ATTR,
  ]) {
    assert.ok(source.includes(attribute), `the first paint already knows ${attribute}`);
  }
  assert.ok(source.includes(api.A11Y_STORAGE_KEY), "the stored choice is read before anything renders");
  assert.ok(
    source.includes('"motion":"reduce"') && source.includes('"textSize":150'),
    "the configured defaults reach the script rather than being flattened to the empty settings",
  );
}

function verifyRuntimeConfig(api) {
  assert.deepEqual(
    api.configureFrontendA11y({ cookie: true, defaults: { motion: "reduce" }, textSizes: [100, 200] }),
    { cookie: true, defaults: { contrast: "system", motion: "reduce", textSize: 100 }, textSizes: [100, 200] },
    "the config block becomes a runtime config the boot script and the panel can both read",
  );
  assert.deepEqual(
    api.configureFrontendA11y(undefined).textSizes,
    [...api.TEXT_SIZES],
    "a site that configures nothing still offers every text size",
  );
}

function verifyLocaleBootCarriesA11y(api) {
  const without = api.createLocaleBootScript({}, { language: {} });
  assert.ok(
    !without.includes(api.A11Y_REDUCE_MOTION_ATTR),
    "a site that does not ask for the settings does not pay for them",
  );
  const withA11y = api.createLocaleBootScript({}, { a11y: { defaults: { motion: "reduce" } }, language: {} });
  assert.ok(
    withA11y.includes(api.A11Y_REDUCE_MOTION_ATTR) && withA11y.includes(api.A11Y_CONFIG_ATTR),
    "the one boot script a site installs carries the accessibility state, so there is no flash and no second script",
  );
}

function verifyApplied(api) {
  const root = document.documentElement;
  api.applyA11ySettings({ contrast: "high", motion: "reduce", textSize: 200 });
  assert.equal(root.getAttribute(api.A11Y_REDUCE_MOTION_ATTR), "on");
  assert.equal(root.getAttribute(api.A11Y_HIGH_CONTRAST_ATTR), "on");
  assert.equal(root.getAttribute(api.A11Y_TEXT_SIZE_ATTR), "200");
  assert.equal(root.getAttribute(api.A11Y_MOTION_PREF_ATTR), "reduce", "the choice is kept beside the resolution");
  api.applyA11ySettings({ contrast: "normal", motion: "full", textSize: 100 });
  assert.equal(root.getAttribute(api.A11Y_REDUCE_MOTION_ATTR), "off", "an explicit full beats the system");
  assert.equal(api.motionReduced(), false);
}

function verifyContrastRatio(api) {
  const black = api.contrastRatio("#000000", "#ffffff");
  assert.ok(Math.abs(black - 21) < 0.01, "black on white is the full 21:1, which a gamma-naive luma never reaches");
  const grey = api.contrastRatio("#767676", "#ffffff");
  assert.ok(grey >= 4.5 && grey < 4.6, `#767676 on white is the 4.5:1 boundary, measured ${grey}`);
  assert.ok(
    Math.abs(api.contrastRatio("rgb(119, 119, 119)", "#fff") - api.contrastRatio("#777", "#ffffff")) < 0.001,
    "the same colour written three ways measures the same",
  );
  assert.ok(
    api.contrastRatio("rgba(0, 0, 0, 0.5)", "#ffffff") < api.contrastRatio("#000000", "#ffffff"),
    "a translucent ink is measured over its backdrop rather than as if it were opaque",
  );
  assert.equal(api.contrastRatio("transparent", "#fff"), null, "a colour nobody can measure is refused, not guessed");
  assert.equal(api.contrastRatio("var(--whatever)", "#fff"), null, "an unresolved variable is refused");
  assert.equal(api.meetsContrast(grey), true, "4.5:1 passes body text");
  assert.equal(api.meetsContrast(api.contrastRatio("#949494", "#ffffff")), false, "3.1:1 fails body text");
  assert.equal(api.meetsContrast(api.contrastRatio("#949494", "#ffffff"), "non-text"), true, "3:1 passes a border");
}

async function renderMarkup(importDist, component, props) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const react = await importDist("react");
  return renderToStaticMarkup(createElement(react[component], props));
}

async function verifyFieldWiring(importDist) {
  const html = await renderMarkup(importDist, "status_input", {
      help: "We never publish it.",
      label: "Email",
      name: "email",
      statusIcons: true,
  });
  assert.ok(html.includes('for="email-field"') && html.includes('id="email-field"'), "the label points at the field by id");
  assert.ok(
    html.includes('aria-describedby="email-field-help email-field-error"'),
    "the field names both its help text and its error slot, so neither is read out of nowhere",
  );
  assert.ok(html.includes('aria-invalid="false"'), "a field starts out valid rather than unstated");
  assert.ok(html.includes('aria-required="true"'), "a required field says so to a screen reader, not only to the browser");
  assert.ok(
    html.includes('role="alert"') && html.includes('id="email-field-error"'),
    "the error is a live region beside the field, not only a tooltip on an icon",
  );
  const optional = await renderMarkup(importDist, "status_input", { label: "Note", name: "note", required: false });
  assert.ok(!optional.includes("aria-required"), "an optional field is not announced as required");
  assert.ok(
    optional.includes('aria-describedby="note-field-error"'),
    "a field with no help text still points at its error slot",
  );
}

async function verifyDropdownRoles(importDist) {
  const html = await renderMarkup(importDist, "dropdown", {
      id: "country",
      label: "Country",
      name: "country",
      options: [{ label: "Czechia", value: "cz" }, { label: "Poland", value: "pl" }],
  });
  assert.ok(html.includes('role="combobox"'), "the value a visitor reads is the control a screen reader announces");
  assert.ok(html.includes('role="listbox"'), "options sit in a listbox rather than loose in the document");
  assert.ok(html.includes('role="option"'), "each option keeps its role");
  assert.ok(html.includes('aria-expanded="false"'), "the closed state is stated before any script runs");
  assert.ok(html.includes('aria-haspopup="listbox"'), "the control says what opening it produces");
  assert.ok(html.includes('aria-controls="country_options"'), "the control names the list it owns");
  assert.ok(html.includes('id="country_options_opt_0"'), "every option carries an id, which aria-activedescendant needs");
  assert.ok(html.includes('tabindex="0"'), "the control is reachable by keyboard at all");
  assert.ok(
    html.includes('role="presentation"'),
    "the placeholder and section rows are not announced as options a visitor could pick",
  );
  const disabled = await renderMarkup(importDist, "dropdown", { disabled: true, id: "d", name: "d", options: [] });
  assert.ok(disabled.includes('tabindex="-1"'), "a disabled control is taken out of the tab order");
}

function verifyDirection(root) {
  assert.equal(root.languageDirection("ar"), "rtl");
  assert.equal(root.languageDirection("ar-EG"), "rtl", "a region subtag does not hide the script direction");
  assert.equal(root.languageDirection("cs"), "ltr");
  assert.equal(root.languageDirection(""), "ltr", "an unknown language is left alone rather than guessed as rtl");
}

async function verifyChromeVariant(importDist) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const react = await importDist("react");
  const panel = renderToStaticMarkup(createElement(react.AccessibilityMenu, { id: "probe", lang: "en" }));
  assert.ok(
    panel.includes("tbf-btn") && panel.includes("tbf-chrome"),
    "the accessibility trigger is the chrome button variant, not a look of its own",
  );
  assert.ok(
    (panel.match(/tbf-chrome/gu) || []).length > 1,
    "the choice rows take the same variant as the trigger, so the panel has one configured chrome",
  );
  assert.ok(
    panel.includes("data-tbf-modal=\"\"") && panel.includes("role=\"dialog\""),
    "the accessibility settings open as a modal dialog",
  );
  assert.ok(
    panel.includes("data-tbf-modal-open") && panel.includes("aria-haspopup=\"dialog\""),
    "and the trigger says so, so a screen reader announces a dialog rather than a menu",
  );
  assert.ok(
    /aria-labelledby="[^"]+"/u.test(panel) && /<h4[^>]*id="[^"]+"/u.test(panel),
    "the dialog is named by its own heading",
  );
  assert.equal(
    (panel.match(/<h5/gu) || []).length,
    3,
    "each group of settings is a heading under that one, not a paragraph dressed as a title",
  );
  assert.equal(
    /data-tbf-popover[=\s]/u.test(panel),
    false,
    "nothing of the popover it used to be is left behind",
  );
}

async function verifyA11y(importDist, importDistRoot) {
  const api = await importDist("");
  verifyAttributes(api);
  verifyRuntimeConfig(api);
  verifyBootScript(api);
  verifyLocaleBootCarriesA11y(api);
  verifyApplied(api);
  verifyMotionResolution(api);
  verifySettings(api);
  verifyAnnouncer(api);
  verifySkipTarget(api);
  verifyContrastRatio(api);
  await verifyFieldWiring(importDist);
  await verifyDropdownRoles(importDist);
  await verifyChromeVariant(importDist);
  const root = await importDistRoot();
  verifyDirection(root);
}

export { verifyA11y };
