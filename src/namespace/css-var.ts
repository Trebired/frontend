const TOKEN_GROUP_ALIASES: Record<string, string> = {
  overlays: "overlay",
  primitives: "ui",
  surfaces: "surf",
};

const TOKEN_KEY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\baction-control\b/gu, "action"],
  [/\btext-link\b/gu, "link"],
  [/\bbutton\b/gu, "btn"],
  [/\bresponsive\b/gu, "resp"],
  [/\bhas-files\b/gu, "files"],
  [/\bborder-inline-color\b/gu, "inline-border"],
  [/\bborder-color\b/gu, "border"],
  [/\bicon-color\b/gu, "icon"],
  [/\btext-decoration\b/gu, "decoration"],
  [/\btext-underline\b/gu, "underline"],
  [/\bpadding-inline\b/gu, "px"],
  [/\bpadding-block\b/gu, "py"],
  [/\bbackground\b/gu, "bg"],
  [/\bline-height\b/gu, "line-h"],
  [/\bmax-height\b/gu, "max-h"],
  [/\bmin-height\b/gu, "min-h"],
  [/\bstates\b/gu, "state"],
  [/\btones\b/gu, "tone"],
  [/\bslots\b/gu, "slot"],
];

function cssTokenKey(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/gu, "$1-$2").toLowerCase();
}

function componentGroupCssName(value: string): string {
  const key = cssTokenKey(value);
  return TOKEN_GROUP_ALIASES[key] || key;
}

function componentTokenCssName(value: string): string {
  return TOKEN_KEY_REPLACEMENTS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    cssTokenKey(value),
  );
}

function frontendCssTokenName(name: string): string {
  const key = cssTokenKey(name);
  const [group = "", ...rest] = key.split("-");
  if (!rest.length) return componentGroupCssName(group);
  return [componentGroupCssName(group), componentTokenCssName(rest.join("-"))]
  .filter(Boolean)
  .join("-");
}

export {
  componentGroupCssName,
  componentTokenCssName,
  cssTokenKey,
  frontendCssTokenName,
};
