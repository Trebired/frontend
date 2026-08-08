const ACTIVATION_TIMEOUT_MS = 2000;
const ACTIVATION_POLL_MS = 25;

const LANGUAGE_CONTRIBUTION_MODULES: Record<string, string> = Object.freeze({
  css: "vs/language/css/monaco.contribution",
  handlebars: "vs/language/html/monaco.contribution",
  html: "vs/language/html/monaco.contribution",
  javascript: "vs/language/typescript/monaco.contribution",
  json: "vs/language/json/monaco.contribution",
  less: "vs/language/css/monaco.contribution",
  razor: "vs/language/html/monaco.contribution",
  scss: "vs/language/css/monaco.contribution",
  typescript: "vs/language/typescript/monaco.contribution",
});

const LANGUAGE_ACTIVATION_SAMPLES: Record<string, string> = Object.freeze({
  css: "body { color: red; }",
  handlebars: "{{title}}\n<section>{{count}}</section>",
  html: '<section data-role="card">hello</section>',
  javascript: "const total = value + 1;",
  json: '{ "key": 1, "items": [true, false] }',
  less: "@accent: red;\nbody { color: @accent; }",
  razor: "<div>@Model.Title</div>",
  scss: "$accent: red;\nbody { color: $accent; }",
  typescript: "type Item = { count: number };\nconst total: number = 1;",
});

const activatedLanguages = new Map<string, Promise<boolean>>();

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function requireAmd(moduleId: string) {
  return new Promise((resolve, reject) => {
    const req = (window as any).require;
    if (typeof req !== "function") {
      reject(new Error("monaco-amd-unavailable"));
      return;
    }
    req([moduleId], resolve, reject);
  });
}

function tokenClassSet(html: string) {
  return new Set(String(html || "").match(/mtk(\d+)/g) || []);
}

function hasRealTokenization(html: string) {
  const classSet = tokenClassSet(html);
  if (!classSet.size) return false;
  if (classSet.size > 1) return true;
  return !classSet.has("mtk1");
}

async function waitForLanguageTokenizer(monacoRef: any, languageId: string) {
  const deadline = Date.now() + ACTIVATION_TIMEOUT_MS;
  const sample = LANGUAGE_ACTIVATION_SAMPLES[languageId] || "token sample";
  while (Date.now() < deadline) {
    const html = await monacoRef.editor.colorize(sample, languageId, {
      tabSize: 2,
    });
    if (hasRealTokenization(html)) return true;
    await wait(ACTIVATION_POLL_MS);
  }
  return false;
}

async function activateLanguage(monacoRef: any, languageId: string) {
  if (!languageId || languageId === "plaintext") return true;
  const contributionModuleId = LANGUAGE_CONTRIBUTION_MODULES[languageId];
  if (!contributionModuleId) return true;
  if (activatedLanguages.has(languageId)) {
    return activatedLanguages.get(languageId);
  }
  const activationPromise = activateLanguageOnce(
    monacoRef,
    languageId,
    contributionModuleId,
  );
  activatedLanguages.set(languageId, activationPromise);
  return activationPromise;
}

async function activateLanguageOnce(
  monacoRef: any,
  languageId: string,
  contributionModuleId: string,
) {
  try {
    await requireAmd(contributionModuleId);
  } catch {}
  let model = null;
  try {
    model = monacoRef.editor.createModel("", languageId);
    return await waitForLanguageTokenizer(monacoRef, languageId);
  } finally {
    if (model) model.dispose();
  }
}

export { activateLanguage };
