import assert from "node:assert/strict";

const SIDEBAR_MARKUP = [
  '<button id="sidebar-min" data-tbf-sidebar-minimize aria-controls="side">Toggle</button>',
  '<button id="sidebar-open" data-tbf-sidebar-open aria-controls="side">Open</button>',
  '<div id="side" data-tbf-sidebar-shell data-tbf-sidebar-side="left">',
  "<aside data-tbf-sidebar>",
  '<button id="sidebar-close" data-tbf-sidebar-close>Close</button>',
  '<a id="sidebar-link" data-tbf-sidebar-link href="/welcome">Welcome</a>',
  '<a id="sidebar-modified" data-tbf-sidebar-link href="/modified">Modified</a>',
  '<a id="sidebar-external" data-tbf-sidebar-link href="https://external.test/">External</a>',
  '<a id="sidebar-download" data-tbf-sidebar-link href="/download" download>Download</a>',
  '<a id="sidebar-target" data-tbf-sidebar-link href="/target" target="_blank">Target</a>',
  '<a id="sidebar-hash" data-tbf-sidebar-link href="#section">Section</a>',
  "</aside>",
  "</div>",
  '<main data-tbf-live-content><span id="current-marker">Current</span></main>',
].join("");

const IGNORED_LINK_IDS = [
  "sidebar-external",
  "sidebar-download",
  "sidebar-target",
  "sidebar-hash",
];

function installNavigationFetch(state) {
  globalThis.fetch = async(input) => {
    state.requested = String(input);
    return new Response(
      [
        "<!doctype html><html><head><title>Welcome</title></head><body>",
        '<main data-tbf-live-content><span id="welcome-marker">Welcome</span></main>',
        "</body></html>",
      ].join(""),
      { headers: { "Content-Type": "text/html" } },
    );
  };
}

async function verifySidebarToggles() {
  const shell = document.getElementById("side");
  assert.equal(shell.getAttribute("data-tbf-sidebar-minimized"), "false");
  document.getElementById("sidebar-min").click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(shell.getAttribute("data-tbf-sidebar-minimized"), "true");
  assert.equal(document.body.getAttribute("data-tbf-sidebar-left-minimized"), "true");
  document.getElementById("sidebar-open").click();
  assert.equal(shell.getAttribute("data-tbf-sidebar-open"), "true");
  document.getElementById("sidebar-close").click();
  assert.equal(shell.getAttribute("data-tbf-sidebar-open"), "false");
}

async function verifyIgnoredSidebarLinks(state) {
  const modified = document.getElementById("sidebar-modified");
  modified.addEventListener("click", (event) => event.preventDefault());
  modified.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
  }));
  for (const id of IGNORED_LINK_IDS) {
    const link = document.getElementById(id);
    link.addEventListener("click", (event) => event.preventDefault());
    link.click();
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(state.requested, "");
}

async function verifySidebarSoftNavigation(state) {
  document.getElementById("sidebar-link").click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(state.requested, "/welcome");
  assert.equal(document.getElementById("welcome-marker")?.textContent, "Welcome");
}

async function verifySidebar(context) {
  const { bindSidebars } = await context.importDist("sidebar");
  document.body.innerHTML = SIDEBAR_MARKUP;

  const previousFetch = globalThis.fetch;
  const state = { requested: "" };
  installNavigationFetch(state);
  bindSidebars(document);

  try {
    await verifySidebarToggles();
    await verifyIgnoredSidebarLinks(state);
    await verifySidebarSoftNavigation(state);
  } finally {
    globalThis.fetch = previousFetch;
    history.replaceState({}, "", "/current");
  }
}

export { verifySidebar };
