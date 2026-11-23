import assert from "node:assert/strict";

function verifyColors(root) {
  assert.equal(root.normalizeHexColor("3F5BD9"), "#3f5bd9", "a hex colour is normalised to lowercase with its hash");
  assert.equal(root.normalizeHexColor("blue"), "", "anything that is not a six-digit hex colour is empty");
  assert.equal(root.distinctColor([]), root.COLOR_SWATCHES[0], "with nothing taken the first swatch is used");
  const taken = [root.COLOR_SWATCHES[0], root.COLOR_SWATCHES[6]];
  const next = root.distinctColor(taken);
  assert.ok(!taken.includes(next), "a taken colour is never handed out again while others are free");
  const nearest = (color) => Math.min(...taken.map((used) => root.colorDistance(color, used)));
  for (const candidate of root.COLOR_SWATCHES) {
    assert.ok(nearest(next) >= nearest(candidate), "the colour chosen is the one furthest from every colour in use");
  }
}

function verifyPicker(root, react, render) {
  const view = document.defaultView;
  const html = render(react.color_picker, { label: "Color", lang: "en", name: "color" });
  assert.match(html, /<input type="hidden" name="color" value=""\/>/u, "the value travels in a hidden input named for the form");
  assert.doesNotMatch(html, /type="color"/u, "the picker never falls back to the native colour input");
  assert.match(html, /Automatic/u, "an empty value reads as automatic");
  assert.match(html, /placeholder="#RRGGBB"/u, "the custom colour field says what it takes");
  const form = document.createElement("form");
  form.innerHTML = html;
  document.body.append(form);
  root.bindFrontendRuntime(form);
  const hidden = form.querySelector('input[name="color"]');
  const panel = document.getElementById(form.querySelector("[aria-controls]").getAttribute("aria-controls"));
  let changes = 0;
  hidden.addEventListener("change", () => changes++);
  panel.querySelector(`[data-tbf-color-option="${root.COLOR_SWATCHES[2]}"]`).click();
  assert.equal(hidden.value, root.COLOR_SWATCHES[2], "choosing a swatch sets the form value");
  assert.equal(form.querySelector(".tbf-color-picker__value").textContent, root.COLOR_SWATCHES[2], "and the trigger shows it");
  assert.equal(changes, 1, "a change event lets a form that submits on change react");
  const hex = panel.querySelector("[data-tbf-color-hex]");
  hex.value = "#ABCDEF";
  hex.dispatchEvent(new view.Event("input", { bubbles: true }));
  assert.equal(hidden.value, "#abcdef", "a typed hex colour sets the value");
  panel.querySelector('[data-tbf-color-option=""]').click();
  assert.equal(hidden.value, "", "automatic clears the value so the application picks one");
  assert.equal(form.querySelector(".tbf-color-picker__value").textContent, "Automatic");
  panel.remove();
  form.remove();
}

async function verifyColorPicker(context) {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const react = await context.importDist("react");
  const root = await context.importDistRoot();
  verifyColors(root);
  verifyPicker(root, react, (component, props) => renderToStaticMarkup(createElement(component, props)));
}

export { verifyColorPicker };
