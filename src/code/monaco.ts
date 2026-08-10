import { getEffectiveTheme } from "#zzt5zj380sl9";

const THEME_DARK = "tbf-dark-transparent";
const THEME_LIGHT = "tbf-light-transparent";
const COLORIZE_THEME_DARK = "vs-dark";
const COLORIZE_THEME_LIGHT = "vs";
const DEFAULT_LOADER_SCRIPT_ID = "monaco-amd-loader";
const DEFAULT_LOADER_SRC = "/monaco/vs/loader.js";
const DEFAULT_VS_PATH = "/monaco/vs";

const DARK_TOKEN_RULES = [
  { token: "comment", foreground: "6A9955" },
  { token: "string", foreground: "CE9178" },
  { token: "string.key.json", foreground: "9CDCFE" },
  { token: "number", foreground: "B5CEA8" },
  { token: "keyword", foreground: "C586C0" },
  { token: "operator", foreground: "D4D4D4" },
  { token: "delimiter", foreground: "D4D4D4" },
  { token: "tag", foreground: "569CD6" },
  { token: "attribute.name", foreground: "9CDCFE" },
  { token: "attribute.value", foreground: "CE9178" },
  { token: "variable", foreground: "9CDCFE" },
  { token: "type", foreground: "4EC9B0" },
  { token: "entity.name.function", foreground: "DCDCAA" },
  { token: "constant", foreground: "4FC1FF" },
  { token: "regexp", foreground: "D16969" },
];

const LIGHT_TOKEN_RULES = [
  { token: "comment", foreground: "008000" },
  { token: "string", foreground: "A31515" },
  { token: "string.key.json", foreground: "0451A5" },
  { token: "number", foreground: "098658" },
  { token: "keyword", foreground: "0000FF" },
  { token: "operator", foreground: "000000" },
  { token: "delimiter", foreground: "000000" },
  { token: "tag", foreground: "800000" },
  { token: "attribute.name", foreground: "FF0000" },
  { token: "attribute.value", foreground: "A31515" },
  { token: "variable", foreground: "001080" },
  { token: "type", foreground: "267F99" },
  { token: "entity.name.function", foreground: "795E26" },
  { token: "constant", foreground: "0070C1" },
  { token: "regexp", foreground: "811F3F" },
];

let monacoPromise: Promise<any> | null = null;

function darkThemeActive() {
  return String(getEffectiveTheme() || "").toLowerCase() !== "light";
}

function getPreferredMonacoThemeName() {
  return darkThemeActive() ? THEME_DARK : THEME_LIGHT;
}

function getPreferredMonacoColorizeThemeName() {
  return darkThemeActive() ? COLORIZE_THEME_DARK : COLORIZE_THEME_LIGHT;
}

function defineMonacoThemes(monacoRef: any) {
  if (!monacoRef?.editor || typeof monacoRef.editor.defineTheme !== "function") {
    return { THEME_DARK, THEME_LIGHT };
  }
  monacoRef.editor.defineTheme(THEME_DARK, themeDefinition("vs-dark", DARK_TOKEN_RULES));
  monacoRef.editor.defineTheme(THEME_LIGHT, themeDefinition("vs", LIGHT_TOKEN_RULES));
  return { THEME_DARK, THEME_LIGHT };
}

function themeDefinition(base: "vs" | "vs-dark", rules: typeof DARK_TOKEN_RULES) {
  return {
    base,
    inherit: true,
    rules,
    colors: {
      "diffEditor.insertedLineBackground": "#2ea04322",
      "diffEditor.insertedTextBackground": "#2ea04333",
      "diffEditor.removedLineBackground": "#f8514922",
      "diffEditor.removedTextBackground": "#f8514933",
      "editor.background": "#00000000",
      "editor.foreground": base === "vs" ? "#1f2328" : "#d4d4d4",
      "editorGutter.background": "#00000000",
      "editorLineNumber.activeForeground": base === "vs" ? "#24292f" : "#d0d0d0",
      "editorLineNumber.foreground": base === "vs" ? "#6e7781" : "#7a7a7a",
      "minimap.background": "#00000000",
    },
  };
}

function existingMonacoLoaderReady() {
  const root = window as any;
  return Boolean(
    root.monaco?.editor ||
      (typeof root.require === "function" &&
        typeof root.require.config === "function"),
  );
}

function bindLoaderScript(
  script: HTMLScriptElement,
  resolve: () => void,
  reject: (error: Error) => void,
) {
  if (script.getAttribute("data-loaded") === "1") {
    resolve();
    return;
  }
  script.addEventListener("load", () => {
      script.setAttribute("data-loaded", "1");
      resolve();
    }, { once: true });
  script.addEventListener("error", () => {
      reject(new Error("monaco-loader-failed"));
    }, { once: true });
}

function ensureLoaderScript() {
  return new Promise<void>((resolve, reject) => {
      if (existingMonacoLoaderReady()) {
        resolve();
        return;
      }
      const existing = document.getElementById(DEFAULT_LOADER_SCRIPT_ID);
      if (existing instanceof HTMLScriptElement) {
        bindLoaderScript(existing, resolve, reject);
        return;
      }
      const script = document.createElement("script");
      script.async = true;
      script.id = DEFAULT_LOADER_SCRIPT_ID;
      script.src = DEFAULT_LOADER_SRC;
      bindLoaderScript(script, resolve, reject);
      document.head.appendChild(script);
  });
}

function ensureMonaco() {
  if (monacoPromise) return monacoPromise;
  monacoPromise = ensureLoaderScript().then(loadMonacoMain);
  return monacoPromise;
}

function loadMonacoMain() {
  const root = window as any;
  if (root.monaco?.editor) return configureMonaco(root.monaco);
  return new Promise((resolve, reject) => {
      const req = root.require;
      if (typeof req !== "function" || typeof req.config !== "function") {
        reject(new Error("monaco-amd-unavailable"));
        return;
      }
      req.config({ paths: { vs: DEFAULT_VS_PATH } });
      req(["vs/editor/editor.main"], () => {
          if (!root.monaco?.editor) {
            reject(new Error("monaco-main-unavailable"));
            return;
          }
          resolve(configureMonaco(root.monaco));
        }, reject);
  });
}

function configureMonaco(monacoRef: any) {
  defineMonacoThemes(monacoRef);
  monacoRef.editor.setTheme(getPreferredMonacoThemeName());
  return monacoRef;
}

export {
  COLORIZE_THEME_DARK,
  COLORIZE_THEME_LIGHT,
  THEME_DARK,
  THEME_LIGHT,
  defineMonacoThemes,
  ensureMonaco,
  getPreferredMonacoColorizeThemeName,
  getPreferredMonacoThemeName,
};
