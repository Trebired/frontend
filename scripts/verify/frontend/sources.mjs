import assert from "node:assert/strict";

const KNOWN_EMAIL = "contact@mirmachynka.com";
const KNOWN_HASH = "6cf61654eab941a808e4b7ea6a06d05bf186c9fa52a4c8cdcde76b6496ee7b5a";

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

  const team = config.gravatarProfilesSource({ people: [{ email: KNOWN_EMAIL, role: "founder" }] });
  assert.equal(typeof team.fetch, "function", "a gravatar source is a bundler data source");
  assert.equal(config.profileHash(` ${KNOWN_EMAIL.toUpperCase()} `), KNOWN_HASH, "a profile hash folds case and space");
}

export { verifyBuildSources };
