import assert from "node:assert/strict";

function assertNoCustomElementTags(html, label) {
  assert.equal(/<\s*[a-z]+-[a-z0-9-]+/u.test(html), false, `${label} uses custom tags.`);
}

function assertNoWrapClass(html, label) {
  assert.equal(/class="[^"]*\bwrap\b/u.test(html), false, `${label} uses wrap class.`);
}

export { assertNoCustomElementTags, assertNoWrapClass };
