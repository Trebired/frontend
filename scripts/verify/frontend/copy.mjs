import assert from "node:assert/strict";

async function verifyCopyCardTitlesAndWrapping(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const react = await context.importDist("react");
  const smaller = renderToStaticMarkup(createElement(react.copy_card, { target: "#copy_probe", title: "Nested", titleAs: "h4" }));
  assert.ok(smaller.includes("<h4>Nested</h4>") && !smaller.includes("<h3>"), "copy_card takes a smaller title level");
  const bogus = renderToStaticMarkup(createElement(react.copy_card, { target: "#copy_probe", title: "Safe", titleAs: "div" }));
  assert.ok(bogus.includes("<h2>Safe</h2>"), "an unknown title level falls back to the depth the card sits at");
  const codeLevel = renderToStaticMarkup(createElement(react.copy_code_card, { id: "lvl", label: "Key", titleAs: "h5", value: "x" }));
  assert.ok(codeLevel.includes("<h5>Key</h5>"), "copy_code_card passes its title level through");
  assert.match(codeLevel, /<code[^>]*class="tbf-pre-wrap tbf-text-break"/u, "wrapped code also breaks long tokens such as keys");
  const codeStyles = await fs.readFile(path.join(context.distDir, "code", "styles", "index.scss"), "utf8");
  assert.ok(codeStyles.includes('#{ns.data("code-content")}#{ns.class("pre-wrap")} {\n  min-width: 0;\n}'),
  "wrapped code may shrink below its longest line");
}

async function verifyCopyComponents(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const react = await context.importDist("react");
  const copy = renderToStaticMarkup(createElement(react.copy_card, {
        target: "#copy_probe", title: "Token", tooltip: "Copy token",
        children: createElement("code", { id: "copy_probe" }, "abc"),
  }));
  assert.ok(copy.includes("<h2>Token</h2>"), "copy_card renders its title as a card heading");
  assert.ok(copy.includes('aria-controls="copy_probe"'), "copy_card wires the copy button to its target");
  assert.ok(copy.includes("tbf-btn tbf-icon tbf-sm") || copy.includes(" tbf-sm "), "copy_card uses the fixed small copy button");
  const inline = renderToStaticMarkup(createElement(react.copy_value, { value: "a1b2c3d4" }));
  const again = renderToStaticMarkup(createElement(react.copy_value, { value: "a1b2c3d4" }));
  assert.ok(/<code class="tbf-text-break" id="copy_value_[a-z0-9]+">a1b2c3d4<\/code>/u.test(inline), "copy_value shows the value as code by default");
  assert.ok(!inline.includes('"value":'), "copy_value copies what is shown, so live text updates are copied too");
  assert.equal(inline, again, "copy_value renders the same id on server and client");
  const short = renderToStaticMarkup(createElement(react.copy_value, {
        value: "a1b2c3d4", copyValue: "a1b2c3d4e5f6", children: createElement("code", null, "a1b2c3d4"),
  }));
  assert.ok(short.includes('"value":"a1b2c3d4e5f6"'), "copyValue copies a literal that differs from what is shown");
  await verifyCopyCardTitlesAndWrapping(context);
  const code = renderToStaticMarkup(createElement(react.copy_code_card, { id: "code_probe", label: "Remote", value: "git@x" }));
  assert.ok(code.includes("<h2>Remote</h2>") && code.includes("git@x"), "copy_code_card is built on copy_card");
  const actions = await context.importDist("actions");
  document.body.innerHTML = renderToStaticMarkup(createElement(react.copy_card, {
        title: "Details",
        rows: [{ label: "Name", value: "fedora-1" }, { label: "Memory", value: "47 GB" }],
  }));
  let copied = "";
  const previousClipboard = navigator.clipboard;
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async(text) => { copied = text; } } });
  document.querySelector("[data-tbf-key-value-value]").textContent = "fedora-2";
  actions.bindCopyButtons(document);
  document.querySelector("copy-button button").click();
  await new Promise((resolve) => setTimeout(resolve, 20));
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: previousClipboard });
  assert.equal(copied, "Name: fedora-2\nMemory: 47 GB", "a rows copy_card copies its rows as shown, one per line");
  const empty = renderToStaticMarkup(createElement(react.copy_card, { title: "Sources", rows: [], emptyText: "None yet." }));
  assert.ok(empty.includes("None yet.") && !empty.includes("copy-button"), "an empty rows card shows its empty text and no copy button");
  const rooted = renderToStaticMarkup(createElement(react.copy_card,
      { id: "pairing_root", title: "Pairing", rows: [{ label: "Code", value: "x" }] }));
  assert.ok(rooted.includes('id="pairing_root"') && rooted.includes('id="pairing_root_rows"'), "id names the card, and its rows derive their own id");
  document.body.innerHTML = "";
}

async function verifyLocaleEndonyms(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const react = await context.importDist("react");
  const html = renderToStaticMarkup(createElement(react.LocaleSwitcher, {
        lang: "en",
        locales: [{ code: "en", label: "English" }, { code: "cs", label: "Czech" }, { code: "pl" }, { code: "de" }],
  }));
  for (const [code, name] of [["en", "English"], ["cs", "Čeština"], ["pl", "Polski"], ["de", "Deutsch"]]) {
    assert.ok(
      html.includes(`<span lang="${code}">${name}</span>`),
      `the switcher names ${name} in its own language and says which language that is`,
    );
  }
  assert.ok(!html.includes(">Czech<"), "an English label does not override the language's own name");
  assert.equal(
    (html.match(/aria-checked="true"/gu) || []).length,
    1,
    "exactly one option is announced as the current language, whatever codes the site offers",
  );
  const rtl = renderToStaticMarkup(createElement(react.LocaleSwitcher, {
        lang: "en",
        locales: [{ code: "ar" }],
  }));
  assert.ok(rtl.includes('dir="rtl"'), "a right-to-left name is marked as one, so it is not reordered as English");
  const root = await context.importDistRoot();
  assert.equal(root.languageName("cs"), "Čeština", "languageName is exported for apps with their own language menus");
  assert.equal(root.languageName(""), "", "languageName returns an empty string for an empty code");
}

export { verifyCopyComponents, verifyLocaleEndonyms };
