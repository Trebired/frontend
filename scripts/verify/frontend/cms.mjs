import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const EDITOR = "https://editor.test";
const LOOSE = { requireForVersion: false };

function demoSchema(cms) {
  return cms.defineContent({
      fields: {
        "home.title": cms.cmsField.text({ label: { cs: "Nadpis", en: "Title" }, maxLength: 20, required: true }),
        "home.body": cms.cmsField.richText({ label: "Body", marks: ["bold"] }),
      },
      collections: {
        posts: cms.cmsCollection({
            fields: { title: cms.cmsField.text({ label: "Title", required: true }) },
            label: "Posts",
            max: 3,
            slugFrom: "title",
        }),
      },
  });
}

function demoDocument() {
  return {
    format: 1,
    fields: { "home.title": { cs: "Ahoj", en: "Hello" } },
    collections: {
      posts: [
        { id: "a", values: { cs: { title: "Čtvrtý příspěvek" }, en: { title: "Fourth post" } } },
        { id: "b", values: { cs: { title: "Čtvrtý příspěvek" } } },
      ],
    },
  };
}

function verifySchemaRules(cms) {
  assert.throws(
    () => cms.defineContent({ fields: { "Bad Id": cms.cmsField.text({ label: "x" }) } }),
    /cms-invalid-id/u,
    "ids are refused unless lowercase dotted",
  );
  assert.throws(
    () => {
      const numbered = cms.cmsCollection({ fields: { n: cms.cmsField.number({ label: "n" }) }, label: "p", slugFrom: "n" });
      return cms.defineContent({ collections: { p: numbered } });
    },
    /cms-invalid-slug/u,
    "a slug comes only from a text field",
  );
}

function verifyValidation(cms) {
  const schema = demoSchema(cms);
  const document = cms.normalizeCmsDocument(demoDocument());
  document.fields["home.body"] = { cs: [{ runs: [{ italic: true, text: "x" }], type: "p" }] };
  const codes = cms.validateCmsDocument(schema, document, ["cs", "en"]).map((issue) => `${issue.code}:${issue.field}:${issue.locale}`);
  assert.ok(codes.includes("cms-mark-italic:home.body:cs"), "a mark the developer did not allow is refused");
  assert.ok(codes.includes("cms-required:title:en"), "a required collection field is checked in every locale");
  assert.ok(!codes.some((code) => code.startsWith("cms-required:home.title")), "a filled field passes");
  document.fields["home.title"].cs = "x".repeat(21);
  assert.ok(cms.validateCmsDocument(schema, document, ["cs"]).some((issue) => issue.code === "cms-too-long"), "maxLength holds");
}

function verifyStableOutput(cms) {
  const first = cms.serializeCmsDocument(cms.normalizeCmsDocument({ fields: { z: { en: "1" }, a: { en: "2" } } }));
  const second = cms.serializeCmsDocument(cms.normalizeCmsDocument({ fields: { a: { en: "2" }, z: { en: "1" } } }));
  assert.equal(first, second, "the content file is written in one key order so git diffs stay small");
  const slugs = cms.itemSlugs(demoSchema(cms), cms.normalizeCmsDocument(demoDocument()), "posts", "cs", "cs");
  assert.deepEqual([...slugs.values()], ["ctvrty-prispevek", "ctvrty-prispevek-2"], "slugs drop accents and stay unique");
}

function render(cms, enabled, child) {
  return renderToStaticMarkup(
    createElement(cms.CmsProvider, { document: demoDocument(), enabled, locale: "cs", schema: demoSchema(cms) }, child),
  );
}

function verifyToggle(cms) {
  const off = render(cms, false, createElement(cms.CmsText, { field: "home.title" }));
  assert.equal(off, "<span>Ahoj</span>", "with the CMS off the content renders without markers");
  const on = render(cms, true, createElement(cms.CmsText, { field: "home.title" }));
  assert.match(on, /data-tbf-cms-field="home.title"/u, "with the CMS on the field carries its marker");
  assert.match(on, /data-tbf-cms-kind="text"/u, "the marker names the kind");
  const list = render(cms, true, createElement(cms.CmsCollection, {
        id: "posts",
        render: (item) => createElement(cms.CmsText, { field: item.field("title") }),
  }));
  assert.match(list, /data-tbf-cms-collection="posts"/u, "a collection carries its marker");
  assert.equal((list.match(/data-tbf-cms-item=/gu) ?? []).length, 2, "every item is marked");
}

function verifyStoreOverride(cms) {
  const store = cms.createCmsStore({
      document: cms.normalizeCmsDocument(demoDocument()),
      editorOrigins: [EDITOR],
      enabled: true,
      fallbackLocale: "cs",
      locale: "en",
      mediaBase: "/content/",
      schema: demoSchema(cms),
  });
  let notified = 0;
  store.subscribe(() => {
      notified += 1;
  });
  assert.equal(store.read("posts/b/title"), "Čtvrtý příspěvek", "a missing locale falls back");
  store.setValue("home.title", "Draft");
  assert.equal(store.read("home.title"), "Draft", "a draft value replaces the published one");
  store.replace(cms.normalizeCmsDocument({}));
  assert.equal(store.read("home.title"), undefined, "a replaced document is read from then on");
  assert.equal(notified, 2, "every change notifies the page so it re-renders");
}

async function verifyEditOrigins(cms, window) {
  window.history.replaceState(null, "", `/?${cms.CMS_EDIT_PARAM}=n1`);
  const edit = await import(new URL("./../../../dist/cms/edit.js", import.meta.url).href);
  const store = cms.createCmsStore({
      document: cms.normalizeCmsDocument({}),
      editorOrigins: [EDITOR],
      enabled: true,
      fallbackLocale: "cs",
      locale: "cs",
      mediaBase: "/",
      schema: demoSchema(cms),
  });
  const stop = edit.startCmsEditMode(store);
  const hello = (origin, nonce) => window.dispatchEvent(
    new window.MessageEvent("message", { data: cms.cmsEnvelope({ nonce, type: "hello" }), origin }),
  );
  const styleId = edit.editNames().styleId;
  hello("https://evil.test", "n1");
  assert.equal(window.document.getElementById(styleId), null, "a parent outside the editor origins is ignored");
  hello(EDITOR, "wrong");
  assert.equal(window.document.getElementById(styleId), null, "a wrong nonce is ignored");
  hello(EDITOR, "n1");
  assert.ok(window.document.getElementById(styleId), "the editor origin with its nonce starts edit mode");
  stop();
  window.document.getElementById(styleId)?.remove();
  const none = cms.createCmsStore({ ...store, editorOrigins: [] });
  assert.equal(typeof edit.startCmsEditMode(none), "function", "no editor origins means edit mode never starts");
}

function verifyConfig(config) {
  const off = config.normalizeFrontendConfig({}, LOOSE);
  assert.equal(off.cms.enabled, false, "the CMS is off unless an app turns it on");
  const on = config.normalizeFrontendConfig({ cms: { editorOrigins: [`${EDITOR}/`], enabled: true } }, LOOSE);
  assert.deepEqual(on.cms.editorOrigins, [EDITOR], "editor origins are kept without a trailing slash");
  assert.throws(() => config.normalizeFrontendConfig({ cms: { editorOrigins: ["*"] } }, LOOSE), /invalid origin/u, "a wildcard origin is refused");
  assert.throws(() => config.normalizeFrontendConfig({ cms: { enabledd: true } }, LOOSE), /not supported/u, "a misspelt key is refused");
}

async function verifyCms({ importDist }, window) {
  const cms = await importDist("cms");
  verifySchemaRules(cms);
  verifyValidation(cms);
  verifyStableOutput(cms);
  verifyToggle(cms);
  verifyStoreOverride(cms);
  await verifyEditOrigins(cms, window);
  verifyConfig(await importDist("config"));
}

export { verifyCms };
