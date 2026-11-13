import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifySetDropdownOptions(context) {
  const root = await context.importDistRoot();
  const react = await context.importDist("react");
  const markup = renderToStaticMarkup(createElement(() => react.dropdown({
          id: "tags",
          name: "tag",
          options: [],
          placeholder: "Choose a repository first",
  })));
  document.body.innerHTML = `<main data-tbf-live-content><div aria-disabled="true" id="tags_wrap">${markup}</div></main>`;
  const runtime = root.bindFrontendRuntime(document, { observe: false, quiet: true });
  try {
    const drop = document.getElementById("tags");
    drop.setAttribute("aria-disabled", "true");
    root.setDropdownOptions(drop, [{ label: "v1.0.0", value: "v1.0.0" }, { label: "v1.1.0", value: "v1.1.0" }], { placeholder: "Choose a tag" });
    const options = Array.from(document.querySelectorAll("#tags_options [data-tbf-dropdown-option]")).map((node) => node.textContent);
    assert.deepEqual(options.map((text) => text.replace(/^.*\}/u, "")), ["v1.0.0", "v1.1.0"], "the options are replaced");
    assert.equal(drop.getAttribute("aria-disabled"), null, "a dropdown rendered disabled can be enabled");
    root.setDropdownOptions(drop, [], { disabled: true, placeholder: "Create a tag first" });
    assert.equal(drop.getAttribute("aria-disabled"), "true", "the dropdown can be disabled again");
    assert.equal(document.querySelectorAll("#tags_options [data-tbf-dropdown-option]").length, 0, "no options remain");
  } finally {
    runtime.disconnect();
    document.body.innerHTML = "";
  }
}

export { verifySetDropdownOptions };
