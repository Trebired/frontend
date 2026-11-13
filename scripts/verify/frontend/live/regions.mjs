import assert from "node:assert/strict";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pageHtml(count) {
  return [
    "<!doctype html><html><body><main data-tbf-live-content>",
    '<section id="transfer" data-tbf-live-region="transfer" data-tbf-live-channel="/repositories"',
    ' data-tbf-live-room="repository:1" data-tbf-live-event="settings">',
    `<p id="state">state ${count}</p></section>`,
    `<p id="outside">server ${count}</p>`,
    "</main></body></html>",
  ].join("");
}

async function verifyLiveRegionsRefreshPerElement(context) {
  const live = await context.importDist("live");
  document.body.innerHTML = pageHtml(0).replace(/^[\s\S]*<body>|<\/body>[\s\S]*$/gu, "");
  document.getElementById("outside").textContent = "kept";
  const handlers = new Map();
  const subscribe = (channel, room, handler) => {
    handlers.set(`${channel} ${room}`, handler);
    return () => handlers.delete(`${channel} ${room}`);
  };
  let fetches = 0;
  let assigned = "";
  const previousFetch = globalThis.fetch;
  const previousAssign = window.location.assign;
  globalThis.fetch = async() => {
    fetches += 1;
    return new Response(pageHtml(fetches), { headers: { "Content-Type": "text/html" } });
  };
  window.location.assign = (url) => {
    assigned = String(url);
  };
  try {
    live.bindLiveRegions(document, { subscribe });
    assert.ok(handlers.has("/repositories repository:1"), "a region with a room subscribes to it");
    handlers.get("/repositories repository:1")({ event: "other" });
    await wait(150);
    assert.equal(fetches, 0, "an event the region does not listen to changes nothing");
    handlers.get("/repositories repository:1")({ event: "settings" });
    handlers.get("/repositories repository:1")({ event: "settings" });
    await wait(200);
    assert.equal(fetches, 1, "events close together refresh once");
    assert.equal(document.getElementById("state").textContent, "state 1", "the region shows the new state");
    assert.equal(document.getElementById("outside").textContent, "kept", "the rest of the page is left alone");
    assert.equal(assigned, "", "a live update never loads the page");
    const region = document.getElementById("transfer");
    region.insertAdjacentHTML("beforeend", '<div id="read" data-tbf-disclosure="" data-tbf-disclosure-open="true"></div>');
    const closedRead = '<div id="read" data-tbf-disclosure="" data-tbf-disclosure-open="false"></div></section>';
    globalThis.fetch = async() => new Response(pageHtml(9).replace("</section>", closedRead), {
        headers: { "Content-Type": "text/html" },
    });
    handlers.get("/repositories repository:1")({ event: "settings" });
    await wait(200);
    assert.equal(document.getElementById("read")?.getAttribute("data-tbf-disclosure-open"), "true", "an open disclosure stays open across a refresh");
  } finally {
    globalThis.fetch = previousFetch;
    window.location.assign = previousAssign;
    document.body.innerHTML = "";
  }
}

export { verifyLiveRegionsRefreshPerElement };
