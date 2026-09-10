import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

function verifyScrollLockNesting(api) {
  document.body.style.overflow = "scroll";

  const releaseOuter = api.lockBodyScroll();
  assert.equal(document.body.style.overflow, "hidden", "first lock must hide overflow");

  const releaseInner = api.lockBodyScroll();
  releaseInner();
  assert.equal(document.body.style.overflow, "hidden", "nested release must not unlock early");

  releaseInner();
  assert.equal(document.body.style.overflow, "hidden", "double release must be idempotent");

  releaseOuter();
  assert.equal(document.body.style.overflow, "scroll", "last release must restore the previous value");
  document.body.style.overflow = "";
}

function verifyReducedMotion(api) {
  assert.equal(typeof api.prefersReducedMotion, "function");
  assert.equal(api.prefersReducedMotion(), false, "must not throw and must default to false");
}

function verifyExports(react) {
  for (const name of ["Carousel", "ExpandableImage", "Lightbox", "MapEmbed"]) {
    assert.equal(typeof react[name], "function", `${name} must be exported from the react entrypoint`);
  }
}

function verifyMapEmbed(react, render) {
  const html = render(react.MapEmbed, { src: "https://example.test/map", title: "Map" });
  assert.match(html, /loading="lazy"/u, "map embed must stay lazy");
  assert.match(html, /referrerpolicy="no-referrer-when-downgrade"/iu, "map embed must keep its referrer policy");
  assert.match(html, /title="Map"/u);
}

function verifyCarouselMarkup(react, render) {
  const slides = [{ alt: "One", src: "/a.jpg" }, { alt: "Two", src: "/b.jpg" }];
  const html = render(react.Carousel, { lang: "en", slides });
  assert.match(html, /Next slide/u, "controls must be labelled from the package message table");
  assert.match(html, /Slide 1/u, "indicators must be labelled and interpolated");
  assert.match(html, /is-active/u, "the first slide must start active");

  const single = render(react.Carousel, { lang: "en", slides: [slides[0]] });
  assert.doesNotMatch(single, /Next slide/u, "a single slide must not render controls");
  assert.equal(render(react.Carousel, { slides: [] }), "", "an empty carousel renders nothing");

  const bottom = render(react.Carousel, { controlsPlacement: "bottom", lang: "en", slides });
  assert.match(bottom, /tbf-carousel--controls-bottom/u, "bottom placement must add its modifier");
  assert.doesNotMatch(html, /tbf-carousel--controls-bottom/u, "default placement must stay on the sides");
}

function verifyContextLocale(react, createElement, renderToStaticMarkup) {
  const node = createElement(
    react.LocaleProvider,
    { locale: "cs" },
    createElement(react.ExpandableImage, { alt: "Bar", src: "/a.jpg" }),
  );
  const html = renderToStaticMarkup(node);
  assert.match(html, /Zvětšit fotografii: Bar/u, "locale must come from LocaleProvider when no lang prop is given");
  assert.doesNotMatch(html, /Expand photo/u, "must not fall back to english inside a czech provider");
}

function verifyLocalizedLabels(react, render) {
  const cs = render(react.ExpandableImage, { alt: "Bar", lang: "cs", src: "/a.jpg" });
  const en = render(react.ExpandableImage, { alt: "Bar", lang: "en", src: "/a.jpg" });
  assert.match(cs, /Zvětšit fotografii: Bar/u, "czech label must come from the package table");
  assert.match(en, /Expand photo: Bar/u, "english label must come from the package table");
  assert.doesNotMatch(en, /Zvětšit/u, "english render must not leak czech");
}

async function verifyOpenLightboxShowsImage(react) {
  const { createElement } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { flushSync } = await import("react-dom");
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const props = {
    alt: "Bar",
    close: () => undefined,
    hasNext: false,
    hasPrevious: false,
    lang: "en",
    showNext: () => undefined,
    showPrevious: () => undefined,
    src: "/a.jpg",
    titleId: "t1",
  };

  flushSync(() => root.render(createElement(react.Lightbox, { ...props, visible: false })));
  const hidden = document.querySelector(".tbf-lightbox-viewer");
  assert.ok(hidden, "the lightbox viewer must render into the document");
  assert.ok(!hidden.classList.contains("is-visible"), "the viewer must start hidden for the enter transition");

  flushSync(() => root.render(createElement(react.Lightbox, { ...props, visible: true })));
  const shown = document.querySelector(".tbf-lightbox-viewer");
  assert.ok(shown.classList.contains("is-visible"), "an open lightbox must mark its viewer visible, or the image stays transparent");
  assert.ok(document.querySelector(".tbf-lightbox").classList.contains("is-visible"));
  assert.equal(document.querySelector(".tbf-lightbox-img").getAttribute("src"), "/a.jpg");

  flushSync(() => root.unmount());
  host.remove();
}

async function verifyIconSpecsCoverAllUsage(context, root) {
  const dir = path.join(context.sourceDir, "media");
  const files = await fs.readdir(dir);
  const used = new Set();
  for (const name of files) {
    if (!name.endsWith(".ts") && !name.endsWith(".tsx")) continue;
    const source = await fs.readFile(path.join(dir, name), "utf8");
    for (const match of source.matchAll(/"(remixicon:[a-z0-9-]+)"/gu)) used.add(match[1]);
  }
  assert.ok(used.size > 0, "expected the media source to reference icon specs");
  for (const spec of used) {
    assert.ok(
      root.MEDIA_ICON_SPECS.includes(spec),
      `${spec} is rendered by the media system but missing from MEDIA_ICON_SPECS`,
    );
  }
}

async function verifyMedia(context) {
  const { createElement } = await import("react");
  const react = await context.importDist("react");
  const root = await context.importDistRoot();
  const { renderToStaticMarkup } = await import("react-dom/server");
  const render = (component, props) => renderToStaticMarkup(createElement(component, props));

  verifyExports(react);
  verifyScrollLockNesting(root);
  verifyReducedMotion(root);
  verifyMapEmbed(react, render);
  verifyCarouselMarkup(react, render);
  verifyLocalizedLabels(react, render);
  verifyContextLocale(react, createElement, renderToStaticMarkup);
  await verifyIconSpecsCoverAllUsage(context, root);
  await verifyOpenLightboxShowsImage(react);
}

export { verifyMedia };
