import assert from "node:assert/strict";

const LOGIN_BODY = [
  '<header id="primary_header" data-tbf-header>login</header>',
  '<div data-tbf-layout-root><main id="live_content" data-tbf-live-content>login</main></div>',
].join("");

const APP_BODY = [
  '<header id="primary_header" data-tbf-header><button id="me" data-tbf-popover-trigger aria-controls="user_menu">me</button></header>',
  '<div id="user_menu" data-tbf-popover>menu</div>',
  '<template id="card_template"><p>card</p></template>',
  '<div data-tbf-layout-root><aside id="sidebar_shell_left">side</aside><main id="live_content" data-tbf-live-content>home</main></div>',
  "<nav data-tbf-layout-bottom-bar>bar</nav>",
].join("");

function page(body) {
  return `<!doctype html><html lang="en"><head><title>Page</title></head><body>${body}</body></html>`;
}

function mockFetch(body, finalUrl = "") {
  globalThis.fetch = async(url) => ({
      ok: true,
      text: async() => page(body),
      url: finalUrl || String(url),
  });
}

function bodyOrder() {
  return Array.from(document.body.children).map((element) => element.id || element.tagName.toLowerCase());
}

function assertAppShell() {
  const order = bodyOrder();
  assert.equal(order.indexOf("user_menu"), order.indexOf("primary_header") + 1, "the user menu must follow the header");
  assert.ok(document.getElementById("card_template"), "body-level templates must arrive with the page");
  assert.ok(order.indexOf("nav") > order.indexOf("div"), "the bottom bar must follow the layout root");
  const layout = document.querySelector("[data-tbf-layout-root]");
  assert.equal(layout.firstElementChild.id, "sidebar_shell_left", "a new sidebar must land inside the layout, before the content");
  assert.equal(document.getElementById("live_content").textContent, "home");
}

async function verifySoftLoginSyncsShell(context) {
  const spa = await context.importDist("spa");
  const popover = await context.importDist("popover");
  const { portalElement } = await context.importDist("layer");
  document.body.innerHTML = `${LOGIN_BODY}<div id="tbf_flash_stack" data-tbf-flash-stack>Signed in</div>`;
  const loginMenu = document.createElement("div");
  loginMenu.id = "login_theme_menu";
  loginMenu.setAttribute("data-tbf-popover", "");
  document.getElementById("primary_header").appendChild(loginMenu);
  portalElement(loginMenu);
  spa.configureSpa({ chromeIds: ["primary_header", "sidebar_shell_left"] });
  spa.setSpaRebind((root) => popover.bindPopovers(root));
  mockFetch(APP_BODY);

  assert.equal(await spa.softRedirect("/", { history: "none" }), true);
  assertAppShell();
  assert.equal(document.getElementById("tbf_flash_stack")?.textContent, "Signed in", "flash messages must survive a soft navigation");
  assert.equal(document.getElementById("login_theme_menu"), null, "a portaled overlay of the replaced header must be removed");
  document.getElementById("me").click();
  assert.equal(document.getElementById("user_menu").getAttribute("data-tbf-open"), "true", "the new header's popover must open");

  mockFetch(LOGIN_BODY);
  assert.equal(await spa.softRedirect("/login", { history: "none" }), true);
  ["user_menu", "card_template", "sidebar_shell_left"].forEach((id) => {
      assert.equal(document.getElementById(id), null, `${id} must leave with the page that rendered it`);
  });
  assert.equal(document.querySelector("[data-tbf-layout-bottom-bar]"), null, "the bottom bar must leave with its page");
  spa.setSpaRebind(null);
}

async function verifySoftNavigationClosesOverlays(context) {
  const spa = await context.importDist("spa");
  const modal = await context.importDist("modal");
  const layout = await context.importDist("layout");
  document.body.innerHTML = [
    LOGIN_BODY,
    '<nav id="mobile_nav_shell" data-tbf-mobile-nav><div data-tbf-mobile-nav-panel></div></nav>',
    '<div id="settings_modal" data-tbf-modal><div data-tbf-modal-content>modal</div></div>',
  ].join("");
  spa.configureSpa({ chromeIds: ["primary_header", "mobile_nav_shell"] });
  document.body.style.overflow = "scroll";
  modal.openModal(document.getElementById("settings_modal"));
  layout.openMobileNav(document.getElementById("mobile_nav_shell"));
  assert.equal(document.body.style.overflow, "hidden");
  mockFetch(`${LOGIN_BODY}<nav id="mobile_nav_shell" data-tbf-mobile-nav><div data-tbf-mobile-nav-panel></div></nav>`);

  assert.equal(await spa.softRedirect("/other", { history: "none" }), true);
  assert.equal(document.body.style.overflow, "scroll", "a soft navigation must close open modals and release their scroll lock");
  assert.equal(document.body.getAttribute("data-tbf-mobile-nav-open"), "false", "a soft navigation must close the mobile nav");
  document.body.style.overflow = "";
}

async function verifyRedirectUpdatesAddress(context) {
  const spa = await context.importDist("spa");
  document.body.innerHTML = LOGIN_BODY;
  spa.configureSpa({ chromeIds: ["primary_header"] });
  window.history.replaceState(null, "", "/login");
  mockFetch(APP_BODY, `${window.location.origin}/`);

  assert.equal(await spa.softReload(), true);
  assert.equal(window.location.pathname, "/", "the address bar must follow a server redirect");
}

async function verifyLiveShell(context) {
  await verifySoftLoginSyncsShell(context);
  await verifySoftNavigationClosesOverlays(context);
  await verifyRedirectUpdatesAddress(context);
}

export { verifyLiveShell };
