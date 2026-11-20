import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function verifyFlash(context) {
  const api = await context.importDist("flash");
  await verifyFlashStyles(context.rootDir);
  verifyFlashToast(api);
  verifyFlashIcons(api);
  await verifyFlashAboveOpenLayer(context, api);
  await verifyFlashGlyphs(context);
  await verifyClassicConfirm(api);
  await verifyTextConfirm(api);
  await verifyPrompt(api);
}

async function verifyFlashAboveOpenLayer(context, api) {
  const layer = await context.importDist("layer");
  api.showFlash("First toast creates the stack");
  const modal = document.createElement("div");
  document.body.append(modal);
  layer.applyZIndex(modal, { fallback: 1120 });
  api.showFlash("Shown while a modal is open");
  const stack = document.getElementById("tbf_flash_stack");
  assert.ok(Number(stack.style.zIndex) > 1120, `a toast shown over an open modal sits above it: ${stack.style.zIndex}`);
  modal.remove();
}

async function verifyFlashStyles(rootDir) {
  const source = await fs.readFile(path.join(rootDir, "dist", "flash", "styles", "index.scss"), "utf8");
  for (const type of ["error", "info", "success", "warn"]) {
    assert.equal(source.includes(`--tbf-flash-${type}-color`), false);
    assert.equal(source.includes(`--tbf-flash-${type}-title-color`), false);
    assert.equal(source.includes(`--tbf-flash-${type}-progress-color`), false);
    assert.equal(source.includes(`ns.css-var("feedback-flash-intents-${type}-icon")`), true);
    const intentSelector = `#{ns.class("flash")}#{ns.data("flash-type", "${type}")}`;
    const intentStart = source.indexOf(intentSelector);
    const intentEnd = source.indexOf("\n}", intentStart);
    const intentBlock = source.slice(intentStart, intentEnd);
    assert.equal(intentStart >= 0, true);
    assert.equal(intentBlock.includes(`mask-image: var(#{ns.css-var("feedback-flash-intents-${type}-glyph")});`), true);
    assert.equal(intentBlock.includes(`#{ns.css-var("feedback-flash-intents-${type}-icon")}`), true);
  }
}

function verifyFlashIcons(api) {
  for (const type of ["error", "info", "success", "warn"]) {
    const handle = api.showFlash[type]("Icon check");
    const icon = handle.element.querySelector(".tbf-flash__icon");
    assert.ok(icon, `a ${type} flash has its icon slot`);
    const contents = icon.children.length + icon.textContent.trim().length;
    assert.equal(contents, 0, `a ${type} flash icon is drawn by its config glyph, never by text or a fetched svg`);
    handle.hide();
  }
}

async function verifyFlashGlyphs(context) {
  const config = await context.importDist("config");
  const forVersion = context.packageVersion;
  const glyphs = (intents) => {
    const scss = config.generateFrontendScss({ components: { feedback: { flash: { intents } } }, forVersion });
    const out = {};
    for (const match of scss.matchAll(/--tbf-feedback-flash-intents-(\w+)-glyph: url\("data:image\/svg\+xml,([^"]+)"\)/gu)) {
      out[match[1]] = decodeURIComponent(match[2]);
    }
    return out;
  };
  const shapes = {
    alert: "M12.8659 3.00017",
    checkCircle: "M4 12C4 7.58172",
    closeCircle: "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C",
    warningCircle: "ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z",
  };
  const fallback = glyphs({});
  assert.deepEqual(Object.keys(fallback).sort(), ["error", "info", "success", "warn"], "every level gets a glyph by default");
  assert.ok(fallback.warn.includes(shapes.warningCircle), "the default warning glyph is the circled one");
  assert.ok(fallback.success.includes(shapes.checkCircle), "the default success glyph is the circled one");
  const chosen = glyphs({ error: { glyph: "remixicon spam-2-line" }, warn: { glyph: "plain" } });
  assert.ok(chosen.warn.includes(shapes.alert), "a level can pick another variant");
  assert.ok(chosen.error.includes("M15.936 2.50098"), "a level can set its own icon spec");
  assert.ok(chosen.success.includes(shapes.checkCircle), "levels left alone keep the default");
  assert.throws(
    () => glyphs({ info: { glyph: "sparkly" } }),
    /intents\.info\.glyph must be one of circled, filled, plain or an icon spec/u,
    "an unknown glyph is refused when the config loads",
  );
}

function verifyFlashToast(api) {
  const { flash, installFlashGlobal, showFlash, showFlashMessage } = api;
  const removedCloseSelector = [".tbf-flash", "close"].join("__");
  document.documentElement.setAttribute("data-tbf-theme", "dark");
  document.body.setAttribute("data-tbf-theme", "dark");
  const handle = showFlash.success("Saved", "Done");
  assert.equal(document.documentElement.getAttribute("data-tbf-theme"), "dark");
  assert.equal(document.body.getAttribute("data-tbf-theme"), "dark");
  assert.ok(handle.element.matches("[data-tbf-flash]"));
  assert.equal(handle.element.querySelector(removedCloseSelector), null);
  assert.equal(handle.element.querySelector("strong.tbf-flash__title"), null);
  assert.equal(handle.element.querySelector("span.tbf-flash__title")?.textContent, "Saved");
  assert.equal(handle.el, handle.element);
  assert.equal(typeof handle.hide, "function");
  assert.equal(typeof flash.stickyInfo, "function");
  assert.equal(typeof flash.liveError, "function");
  assert.equal(installFlashGlobal(window), flash);
  assert.equal(window.flash, flash);
  verifyLiveAndRoutedFlash(api);
}

function verifyLiveAndRoutedFlash(api) {
  const { flash, showFlashMessage } = api;
  const live = flash.liveError("Working", "Syncing", { id: "job-1", progressTone: "red" });
  assert.equal(live.element.getAttribute("data-tbf-progress-tone"), "red");
  assert.equal(live.element.getAttribute("data-tbf-flash-type"), "error", "the level picks the glyph through its flash type");
  assert.equal(live.element.querySelector(".tbf-flash__close"), null);
  const routed = showFlashMessage(flash, "success", "Routed", "Done");
  assert.equal(routed.element.getAttribute("data-tbf-flash-type"), "success");
}

async function verifyClassicConfirm(api) {
  const confirmPromise = api.confirm("Confirm");
  document.querySelector(".tbf-btn.tbf-highlight").click();
  assert.equal(await confirmPromise, true);
}

async function verifyTextConfirm(api) {
  const attrs = api.confirmationVariantAttrs({
      confirmationText: "repository-a",
      target: "repository-a",
      variant: "delete",
  });
  const button = document.createElement("button");
  Object.entries(attrs).forEach(([key, value]) => button.setAttribute(key, value));
  document.body.appendChild(button);
  const elementConfirmPromise = api.confirmElement(button);
  const confirmInput = document.querySelector(".tbf-flash__body input");
  confirmInput.value = "repository-a";
  confirmInput.dispatchEvent(new Event("input", { bubbles: true }));
  confirmInput.closest(".tbf-flash").querySelector(".tbf-btn.tbf-highlight").click();
  assert.equal(await elementConfirmPromise, true);
}

async function verifyPrompt(api) {
  const promptPromise = api.prompt("Name");
  const input = document.querySelector(".tbf-flash__form input");
  input.value = "Atlas";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  document.querySelector(".tbf-flash__form").dispatchEvent(
    new SubmitEvent("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(await promptPromise, "Atlas");
}

export { verifyFlash };
