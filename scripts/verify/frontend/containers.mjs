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

  assert.match(css, /\.card \{\n {2}display: flex;\n {2}padding: 1rem;\n\}/u, "a container is a class the application named");
  assert.match(css, /\.card:hover \{\n {2}border-color: red;\n\}/u, "a state is a selector on that class");
  assert.match(css, /\.card__header \{/u, "a part is a double underscore element");
  assert.match(css, /\.card--muted \{/u, "a variant is a double dash modifier");
  assert.match(css, /@media \(max-width: \d+px\) \{\n {2}\.section \{\n {4}padding-block: 2rem;/u, "a breakpoint wraps the class in a query");
  assert.ok(!css.includes(".card {\n}"), "a container with nothing to say prints nothing");

  assert.throws(
    () => generate({ "tbf-card": { style: { display: "flex" } } }),
    /may not start with tbf-/u,
    "an application cannot name a container inside the package's prefix",
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
    /must be a string or a number/u,
    "a declaration carries one value",
  );
}

export { verifyContainers };
