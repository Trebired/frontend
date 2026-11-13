import assert from "node:assert/strict";

function sourceLanguageMarkup() {
  const row = (id) => [
    `<div data-tbf-source-language-row="" data-tbf-source-language-id="${id}" data-tbf-source-language-bucket="repository"`,
    ` data-tbf-source-language-bytes="100" data-tbf-source-language-lines="10" role="button" tabindex="0">`,
    `<div class="body"><span class="name">${id}</span></div><button type="button" class="inner">More</button></div>`,
  ].join("");
  return `<div data-tbf-source-language-root="">${row("typescript")}${row("css")}</div>`;
}

function click(target) {
  target.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
}

async function verifySourceLanguageRowToggle(importDist) {
  const { bindSourceLanguageRuntime } = await importDist("language");
  const host = document.createElement("div");
  host.innerHTML = sourceLanguageMarkup();
  document.body.appendChild(host);
  bindSourceLanguageRuntime(host, { force: true, tree: [] });
  const row = host.querySelector("[data-tbf-source-language-id='typescript']");
  const included = () => row.getAttribute("data-tbf-source-language-included");
  assert.equal(included(), "true");
  click(row.querySelector(".name"));
  assert.equal(included(), "false", "a click on a row's text toggles the language");
  click(row.querySelector(".inner"));
  assert.equal(included(), "false", "a click on a control nested in the row does not toggle it");
  click(row);
  assert.equal(included(), "true", "a click on the row itself toggles it back");
  host.remove();
}

export { verifySourceLanguageRowToggle };
