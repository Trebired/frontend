import assert from "node:assert/strict";

function listChildren(element) {
  const children = element && element.props ? element.props.children : null;
  return Array.isArray(children) ? children : [];
}

async function verifySourceLanguagePanelKeys(importDist) {
  const { source_language_tabs_content } = await importDist("language");
  const visualLanguages = [
    { viz_id: "typescript", name: "TypeScript", bucket: "repository", color: "#3178c6", bytes: 100, percent: 60 },
    { viz_id: "json", name: "JSON", bucket: "supporting", color: "#cccccc", bytes: 50, percent: 40 },
  ];
  const tree = source_language_tabs_content({ lang: "en", locale: "en", visualLanguages });
  const panels = listChildren(tree).find((child) => Array.isArray(child));
  assert.ok(Array.isArray(panels) && panels.length === 3, "the three bucket panels render as a list");
  const keys = panels.map((panel) => panel && panel.key);
  assert.deepEqual(keys, ["everything", "repository", "supporting"], "each bucket panel carries its bucket as key");
}

export { verifySourceLanguagePanelKeys };
