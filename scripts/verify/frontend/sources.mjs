import assert from "node:assert/strict";

async function verifyBuildSources({ importDist }) {
  const config = await importDist("config");

  const documents = config.textDocumentsSource({
      langs: ["en"],
      org: "Trebired",
      repo: "meta",
      slugs: ["privacy"],
  });
  assert.equal(typeof documents.fetch, "function", "a text document source is a bundler data source");

  const rates = config.moneyRatesSource({ base: "CZK", currencies: ["EUR"] });
  assert.equal(typeof rates.fetch, "function", "a money rates source is a bundler data source");
  assert.equal(config.gravatarProfilesSource, undefined, "the gravatar source is gone");
}

export { verifyBuildSources };
