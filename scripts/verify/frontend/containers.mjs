import assert from "node:assert/strict";

const FOR_VERSION_PATTERN = /^(\d+)\.(\d+)/u;

function forVersion(context) {
  const match = FOR_VERSION_PATTERN.exec(context.packageVersion);
  return match ? `${match[1]}.${match[2]}.0` : context.packageVersion;
}

async function verifyContainers(context) {
  const config = await context.importDist("config");
  const generate = (containers) => config.generateFrontendScss({
      containers,
      forVersion: forVersion(context),
  });

  const extra = config.generateFrontendScss({ css: ".verify-extra{color:red}", forVersion: forVersion(context) });
  assert.ok(extra.trimEnd().endsWith(".verify-extra{color:red}"), "config css closes the generated stylesheet");

  const css = generate({
      card: {
        on: { hover: { borderColor: "red" } },
        parts: { header: { style: { display: "flex" } } },
        style: { display: "flex", padding: "1rem" },
        variants: { muted: { style: { background: "grey" } } },
      },
      section: {
        at: { md: { paddingBlock: "2rem" } },
        style: { paddingBlock: "4rem" },
      },
  });

  assert.match(css, /\.tbfm-card \{\n {2}display: flex;\n {2}padding: 1rem;\n\}/u, "a container is a class the application named");
  assert.match(css, /\.tbfm-card:hover \{\n {2}border-color: red;\n\}/u, "a state is a selector on that class");
  assert.match(css, /\.tbfm-card__header \{/u, "a part is a double underscore element");
  assert.match(css, /\.tbfm-card--muted \{/u, "a variant is a double dash modifier");
  assert.match(css, /@media \(max-width: \d+px\) \{\n {2}\.tbfm-section \{\n {4}padding-block: 2rem;/u, "a breakpoint wraps the class in a query");
  assert.ok(!css.includes(".tbfm-card {\n}"), "a container with nothing to say prints nothing");

  const toned = generate({ cell: { style: { display: "grid" }, tone: "light" } });
  assert.match(
    toned,
    /\.tbfm-cell \{\n {2}@include tone\.on-light;\n {2}display: grid;/u, "a light container takes the page palette from the package's own mixin"
  );
  assert.match(toned, /@use "[^"]*styles\/utils\/tone" as tone;/u, "which the generated stylesheet loads once");
  assert.match(generate({ cell: { tone: "dark" } }), /@include tone\.on-dark;/u, "and a dark one takes the inverted palette the same way");

  const frosted = generate({ band: { frost: true, parts: { lead: { frost: true } } } });
  const frostedText = /:where\(\.tbfm-band\) :where\(p, li:not\(\[class\]\), [^{]*\) \{\n {2}@include frost\.text;/u;
  assert.match(frosted, frostedText, "a frosted container blurs what lies behind its text, at no specificity");
  assert.match(frosted, /:where\(\.tbfm-band__lead\) :where\(/u, "a part can be frosted on its own");
  assert.ok(!/:where\(p, li[^{]*h[1-6]/u.test(frosted), "titles are never frosted, only body text");
  assert.match(frosted, /@use "[^"]*styles\/utils\/frost" as frost;/u, "from the package's own mixin");
  assert.ok(!generate({ band: { style: { display: "grid" } } }).includes("@include frost"), "a container is not frosted unless it asks");
  assert.throws(() => generate({ band: { frost: "yes" } }), /must be true or false/u, "frost is on or off");

  assert.throws(
    () => generate({ card: { style: { color: "var(--tbf-text)" } } }),
    /writes a package token by hand/u,
    "a package token is read with the config helpers, never written as a string",
  );
  assert.throws(
    () => generate({ card: { tone: "muted" } }),
    /must be one of dark, light/u,
    "a tone is one of the two the package knows",
  );
  assert.throws(
    () => generate({ "tbf-card": { style: { display: "flex" } } }),
    /may not start with tbf-/u,
    "an application cannot name a container inside the package's prefix",
  );
  assert.throws(
    () => generate({ "tbfm-card": { style: { display: "flex" } } }),
    /may not start with tbfm-/u,
    "nor inside the prefix the package writes for containers",
  );
  assert.throws(
    () => generate({ card: { at: { huge: { display: "flex" } } } }),
    /is not a declared breakpoint/u,
    "a breakpoint has to be one the design declares",
  );
  assert.throws(
    () => generate({ card: { style: { display: "flex" }, unknown: {} } }),
    /is not a container field/u,
    "a misspelled field is refused rather than ignored",
  );
  assert.throws(
    () => generate({ card: { style: { padding: ["1rem"] } } }),
    /must be a string, a number or a config token/u,
    "a declaration carries one value",
  );
}

export { verifyContainers };
