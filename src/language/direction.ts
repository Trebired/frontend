const RTL_LANGUAGES = [
  "ar",
  "arc",
  "ckb",
  "dv",
  "fa",
  "he",
  "ks",
  "ku",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
];

type TextDirection = "ltr" | "rtl";

function languageDirection(code: unknown): TextDirection {
  const base = String(code || "").trim().toLowerCase().replace(/_/gu, "-").split("-")[0] || "";
  return RTL_LANGUAGES.includes(base) ? "rtl" : "ltr";
}

export { languageDirection, RTL_LANGUAGES };
export type { TextDirection };
