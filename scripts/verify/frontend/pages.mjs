import assert from "node:assert/strict";

async function verifySitePages(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const el = (await import("react")).createElement;
  const react = await context.importDist("react");
  let loads = 0;
  const Kontakt = () => el("p", null, `route ${react.usePageRoute()}`);
  const ErrorPage = ({ status }) => el("p", null, `error ${status}`);
  const pages = react.createSitePages({
      error: ErrorPage,
      pages: {
        "/kontakt": async() => {
          loads += 1;
          return Kontakt;
        },
      },
      wrap: (page, route) => el("section", { "data-route": route }, page),
  });
  const html = (path) => renderToStaticMarkup(el(pages.PageContent, { path }));

  assert.equal(html("/kontakt"), "<p>error 404</p>", "a page that was never prepared is not rendered, so the server must prepare it first");
  await Promise.all([pages.preparePage("/kontakt/"), pages.preparePage("/kontakt")]);
  assert.equal(loads, 1, "preparing a page twice, or with a trailing slash, loads its code once");
  assert.equal(
    html("/kontakt/"),
    "<section data-route=\"/kontakt\"><p>route /kontakt</p></section>",
    "a prepared page renders inside the app's wrap and reads its own route",
  );
  await pages.preparePage("/nikde");
  assert.equal(html("/nikde"), "<p>error 404</p>", "a route with no loader is the not-found page");
  assert.equal(html("/500"), "<p>error 500</p>", "an error route renders the error page with its status");
}

export { verifySitePages };
