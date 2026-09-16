import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyIconCallableFromComponentBody(iconReact) {
  const { createRoot } = await import("react-dom/client");
  const { act } = await import("react");
  const host = document.createElement("div");
  document.body.appendChild(host);
  const errors = [];
  const previousError = console.error;
  console.error = (...args) => errors.push(String(args[0]));
  function Card({ specs }) {
    return h("div", null, specs.map((spec, index) => h("span", { key: index }, iconReact.Icon({ spec }))));
  }
  const root = createRoot(host);
  const thrown = [];
  const render = async(specs) => {
    try {
      await act(async() => root.render(h(Card, { specs })));
    } catch (error) {
      thrown.push(String(error && error.message ? error.message : error));
    }
  };
  try {
    await render(["remixicon:add-line"]);
    await render(["remixicon:add-line", "remixicon:save-3-line", "remixicon:edit-line"]);
    await render([]);
    await render(["remixicon:add-line", "remixicon:save-3-line"]);
    const hookMessage = [
      "Icon called as a function must hold no hooks of its own,",
      "or they count as the calling component's and a changing icon count breaks it:",
      thrown.join(" | "),
    ].join(" ");
    assert.deepEqual(thrown, [], hookMessage);
    assert.equal(host.querySelectorAll("[data-tbf-icon]").length, 2, "icons render when called as a function");
  } finally {
    await act(async() => root.unmount());
    console.error = previousError;
    host.remove();
  }
  const hookErrors = errors.filter((message) => /hook|static flag|Rendered more|Rendered fewer/iu.test(message));
  assert.deepEqual(hookErrors, [], `calling Icon as a function must not change the caller's hook count: ${hookErrors.join(" | ")}`);
}

function verifyBrandColorSurvivesHydration(iconRuntime, iconReact, iconServer, rootDir) {
  const spec = "simple-icons:github";
  const renderer = iconServer.createServerIconRenderer({}, { rootDir });
  const serverEntry = iconServer.withIconServerRenderer(renderer, () => renderer(spec));
  if (!serverEntry || serverEntry.colorMode !== "brand" || !serverEntry.colorValue) return;
  const html = iconServer.withIconServerRenderer(renderer, () => renderToStaticMarkup(h(iconReact.Icon, { spec })));
  assert.ok(
    html.includes(`data-tbf-icon-brand-color="${serverEntry.colorValue}"`),
    "a server-rendered brand icon must publish its colour for the client to harvest",
  );
  assert.ok(html.includes(`color:${serverEntry.colorValue}`), "the server styles the brand icon");
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.appendChild(host);
  try {
    iconRuntime.harvestInlineIcons(host);
    const cached = iconRuntime.readIconCacheEntry(spec);
    assert.equal(
      cached?.colorValue,
      serverEntry.colorValue,
      "harvesting must keep the brand colour, or the client renders no style and hydration mismatches",
    );
  } finally {
    host.remove();
  }
}

export { verifyBrandColorSurvivesHydration, verifyIconCallableFromComponentBody };
