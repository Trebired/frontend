import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

async function verifySearchRemotePanel(importDist) {
  const react = await importDist("react");
  const html = renderToStaticMarkup(react.search_panel({
        children: "<rows>",
        emptyText: "Nothing",
        familyKey: "procs",
        remote: { channel: "/servers", hasMore: true, nextOffset: 20, pageSize: 20, room: "server-processes:1" },
  }));
  const config = '"remote":{"channel":"/servers","hasMore":true,"nextOffset":20,"pageSize":20,"room":"server-processes:1"}';
  assert.ok(html.includes(config), `the panel config carries its socket room: ${html}`);
  const results = /data-tbf-search-results="">&lt;rows&gt;<\/div>/;
  assert.ok(results.test(html), "the first page sits in the results slot the socket replaces");
  assert.ok(/<div aria-hidden="true" data-tbf-search-sentinel=""><\/div>/.test(html), "a panel with more pages shows its sentinel");
  assert.ok(html.includes('data-tbf-search-loading="" hidden=""'), "the loader starts hidden");
  const last = renderToStaticMarkup(react.search_panel({ familyKey: "procs", remote: { channel: "/servers", room: "server-processes:1" } }));
  assert.ok(/data-tbf-search-sentinel="" hidden=""/.test(last), "a panel without more pages hides its sentinel");
  const local = renderToStaticMarkup(react.search_panel({ children: "x", familyKey: "plain" }));
  assert.ok(!local.includes("search-results") && !local.includes("search-sentinel"), "a local panel stays as it was");
}

export { verifySearchRemotePanel };
