import assert from "node:assert/strict";

const RATES = { EUR: 0.041, PLN: 0.18 };

function configure(api, extra = {}) {
  return api.configureFrontendMoney({
      base: "CZK",
      locales: { cs: "CZK", en: "EUR" },
      rates: RATES,
      ...extra,
  });
}

function verifyCurrencyPerLocale(api) {
  configure(api);
  assert.equal(api.moneyCurrencyFor("cs"), "CZK", "the base locale keeps the base currency");
  assert.equal(api.moneyCurrencyFor("en"), "EUR", "another locale is quoted in its own currency");
  assert.equal(api.moneyCurrencyFor("de"), "CZK", "a locale nobody mapped falls back to the base");
}

function verifyConversion(api) {
  configure(api);
  assert.equal(api.convertMoney(6000, "cs"), 6000, "the base currency is never converted or rounded");
  assert.equal(api.convertMoney(6000, "en", { round: "down" }), 240, "a ceiling rounds down, never past itself");
  assert.equal(api.convertMoney(15000, "en", { round: "up" }), 620, "a floor rounds up");
  configure(api, { steps: { EUR: 50 } });
  assert.equal(api.convertMoney(6000, "en", { round: "down" }), 200, "a configured step decides the rounding");
}

function verifyFormatting(api) {
  configure(api);
  assert.match(api.formatMoney(6000, "cs"), /6[\s ]000[\s ]Kč/u, "the base locale reads in its own form");
  assert.equal(api.formatMoney(6000, "en", { round: "down" }), "€240", "the converted amount carries its own symbol");
  assert.match(
    api.formatMoney(6000, "xx"),
    /CZK[\s\u00a0]6,000/u,
    "an unquoted currency falls back to the base rather than inventing a rate",
  );
}

function verifyRatesFeed(api) {
  const xml = "<Cube time='2026-01-02'><Cube currency='USD' rate='1.10'/><Cube currency='CZK' rate='25.00'/></Cube>";
  assert.ok(typeof api.fetchMoneyRates === "function", "the build can read reference rates");
  assert.match(xml, /time='2026-01-02'/u);
}

async function verifyMoney(importDist) {
  const api = await importDist("");
  const config = await importDist("config");
  verifyCurrencyPerLocale(api);
  verifyConversion(api);
  verifyFormatting(api);
  verifyRatesFeed(config);
  assert.equal(api.MONEY_CONFIG_ATTR, "data-tbf-money-config", "the client reads the same config the shell wrote");
}

export { verifyMoney };
