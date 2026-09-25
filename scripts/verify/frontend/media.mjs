import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

function verifyScrollLockNesting(api) {
  const root = document.documentElement;
  root.style.overflow = "scroll";
  document.body.style.overflow = "";

  const releaseOuter = api.lockBodyScroll();
  assert.equal(root.style.overflow, "hidden", "first lock must hide overflow");
  assert.equal(document.body.style.overflow, "", "the lock must not make body a scroll container, which strands sticky headers");

  const releaseInner = api.lockBodyScroll();
  releaseInner();
  assert.equal(root.style.overflow, "hidden", "nested release must not unlock early");

  releaseInner();
  assert.equal(root.style.overflow, "hidden", "double release must be idempotent");

  releaseOuter();
  assert.equal(root.style.overflow, "scroll", "last release must restore the previous value");
  root.style.overflow = "";
}

function verifyMediaState(api) {
  for (const name of ["mediaAvailable", "mediaImage", "mediaState"]) {
    assert.equal(typeof api[name], "function", `${name} must stay exported from the root entrypoint`);
  }
  assert.equal(api.mediaImage("/a.png"), "/a.png");
  assert.equal(api.mediaImage({ avatar_url: "/b.png" }), "/b.png");
  assert.equal(api.mediaImage(null), "");
  assert.equal(api.mediaAvailable("/a.png"), true);
  assert.equal(api.mediaAvailable({ available: false, image: "/a.png" }), false);
  assert.deepEqual(api.mediaState({ available: true, id: 7, url: "/c.png" }), { available: true, id: "7", image: "/c.png" });
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
  assert.match(html, /<object/u, "map embed must render an object, the only element that reports a refused embed");
  assert.match(html, /aria-label="Map"/u, "the embed surface must carry its title");
}

function verifyEmbedFrame(react, render) {
  const html = render(react.EmbedFrame, { src: "https://example.test/thing", title: "Thing" });
  assert.doesNotMatch(html, /src="https:\/\/example\.test/u, "the embed must not carry src in SSR, or it blocks the document load event");
  assert.match(html, /data-embed-state="loading"/u, "the embed must start in the loading state");
  assert.match(html, /loader-circle/u, "the embed must show the standard loader while loading");
  assert.match(html, /role="status"/u, "the embed status must be announced");

  const labelled = render(react.EmbedFrame, { labels: { loading: "Nahr\u00e1v\u00e1m" }, src: "https://example.test/x", title: "X" });
  assert.match(labelled, /Nahr\u00e1v\u00e1m/u, "the loading label must still override the built-in string");

  const noErrorOverride = render(react.EmbedFrame, {
      labels: { error: "custom text a caller must not be able to set" },
      src: "https://example.test/y",
      title: "Y",
  });
  assert.doesNotMatch(
    noErrorOverride,
    /custom text a caller must not be able to set/u,
    "the failure text is fixed and reason-based, not something a caller can override",
  );

  assert.match(html, /<object/u, "the default surface must be an object, which raises error when an embed is refused");
  assert.doesNotMatch(html, /<iframe/u, "an iframe reports a refused embed as a successful load, so it must not be the default");

  const sandboxed = render(react.EmbedFrame, { sandbox: "allow-scripts", src: "https://example.test/s", title: "S" });
  assert.match(sandboxed, /<iframe/u, "sandbox must fall back to an iframe, since object carries no sandbox attribute");
  assert.match(sandboxed, /sandbox="allow-scripts"/u, "the sandbox value must reach the element");
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
  verifyMediaState(root);
  verifyMapEmbed(react, render);
  verifyEmbedFrame(react, render);
  verifyCarouselMarkup(react, render);
  verifyLocalizedLabels(react, render);
  verifyContextLocale(react, createElement, renderToStaticMarkup);
  await verifyIconSpecsCoverAllUsage(context, root);
  await verifyOpenLightboxShowsImage(react);
}

export { verifyMedia };
