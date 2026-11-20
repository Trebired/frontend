import assert from "node:assert/strict";

function renderBreadcrumb(React, renderToStaticMarkup, react, props) {
  const items = [
    React.createElement(react.BreadcrumbItem, { href: "/a", key: "a" }, "src"),
    React.createElement(react.BreadcrumbItem, { current: true, key: "b" }, "lib"),
  ];
  return renderToStaticMarkup(React.createElement(react.Breadcrumb, props, items));
}

async function verifyBreadcrumbCopy(context) {
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const react = await context.importDist("react");
  const plain = renderBreadcrumb(React, renderToStaticMarkup, react, {});
  assert.doesNotMatch(plain, /copy-button/u, "a breadcrumb without copy has no copy button");
  const copied = renderBreadcrumb(React, renderToStaticMarkup, react, { copy: true, copyLabel: "Copy path" });
  assert.match(copied, /copy-button/u, "copy adds a copy button");
  assert.match(copied, /data-tbf-breadcrumb-copy-value="">src\/lib</u, "the copied value defaults to the item labels");
  const explicit = renderBreadcrumb(React, renderToStaticMarkup, react, { copy: true, copyValue: "/src/lib" });
  assert.match(explicit, /data-tbf-breadcrumb-copy-value="">\/src\/lib</u, "copyValue sets what is copied");
  document.body.innerHTML = explicit;
  const root = await context.importDistRoot();
  root.setBreadcrumbItems(document.querySelector("[data-tbf-breadcrumb]"), [
      { href: "/x", key: "x", label: "app" },
      { current: true, key: "y", label: "main.ts" },
    ], { copyValue: "/app/main.ts" });
  const labels = Array.from(document.querySelectorAll(".tbf-breadcrumb__label")).map((node) => node.textContent);
  assert.deepEqual(labels, ["app", "main.ts"], "setBreadcrumbItems replaces the items");
  assert.equal(document.querySelector("[data-tbf-breadcrumb-copy-value]").textContent, "/app/main.ts", "setBreadcrumbItems updates the copied value");
  assert.equal(document.querySelector("a.tbf-breadcrumb__link").getAttribute("href"), "/x", "linked items stay links");
}

async function verifyBreadcrumbTokens(context) {
  const config = await context.importDist("config");
  const scss = (breadcrumb) => config.generateFrontendScss({ components: { shell: { breadcrumb } }, forVersion: context.packageVersion });
  assert.match(scss({}), /--tbf-shell-breadcrumb-glyph: none;/u, "a breadcrumb has no icon by default");
  const configured = scss({ border: "1px solid red", glyph: "remixicon folder-open-line", iconColor: "red" });
  assert.match(configured, /--tbf-shell-breadcrumb-glyph: url\("data:image\/svg\+xml,/u, "the icon token becomes a mask image");
  assert.match(configured, /--tbf-shell-breadcrumb-border: 1px solid red;/u, "the frame comes from the config");
  assert.match(configured, /--tbf-shell-breadcrumb-icon: red;/u, "the icon colour keeps its own variable");
  assert.throws(
    () => scss({ glyph: "remixicon no-such-icon-anywhere" }),
    /components\.shell\.breadcrumb\.glyph must be an icon spec/u,
    "an unknown icon is refused"
  );
}

export { verifyBreadcrumbCopy, verifyBreadcrumbTokens };
