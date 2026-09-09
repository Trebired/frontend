import assert from "node:assert/strict";

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
}

export { verifyMedia };
