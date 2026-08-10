import type { BindRoot } from "#er0dlx1gtbzh";
import { parseJsonText, queryAll } from "#er0dlx1gtbzh";
import { activateLanguage } from "#xf0nky7w9fvx";
import {
  defineMonacoThemes,
  ensureMonaco,
  getPreferredMonacoThemeName,
} from "#c1t1f0t76p85";

type EditorContentState = {
  editor: any;
  input: HTMLTextAreaElement;
};

type EditorContentConfig = {
  language?: string;
  placeholder?: string;
  readOnly?: boolean;
};

const roots = new Set<HTMLElement>();
const states = new WeakMap<HTMLElement, EditorContentState>();
let sharedListenersBound = false;

function editorContentConfig(root: HTMLElement, input: HTMLTextAreaElement) {
  const script = root.querySelector('script[type="application/json"][data-tbf-editor-content-config]');
  const config = parseJsonText<EditorContentConfig>(script?.textContent || "", {});
  return {
    language: String(config.language || "json"),
    placeholder: String(config.placeholder || ""),
    readOnly: config.readOnly === true || input.disabled,
  };
}

function editorContentChildren(root: HTMLElement) {
  const children = Array.from(root.children);
  const input = children.find((child): child is HTMLTextAreaElement => {
      return child instanceof HTMLTextAreaElement;
  });
  const host = children.find((child): child is HTMLElement => {
      return child instanceof HTMLElement &&
        !(child instanceof HTMLScriptElement) &&
        !(child instanceof HTMLTextAreaElement);
  });
  return { host, input };
}

function createEditor(
  monacoRef: any,
  host: HTMLElement,
  input: HTMLTextAreaElement,
  config: ReturnType<typeof editorContentConfig>,
) {
  defineMonacoThemes(monacoRef);
  monacoRef.editor.setTheme(getPreferredMonacoThemeName());
  return monacoRef.editor.create(host, {
      automaticLayout: true,
      fontSize: 13,
      language: config.language,
      lineNumbers: "on",
      minimap: { enabled: false },
      overviewRulerBorder: false,
      placeholder: config.placeholder,
      readOnly: config.readOnly,
      renderLineHighlight: "all",
      scrollBeyondLastLine: false,
      tabSize: 2,
      value: input.value || "",
      wordWrap: "on",
  });
}

async function bindEditorContent(root: HTMLElement) {
  if (states.has(root)) return;
  const { host, input } = editorContentChildren(root);
  if (!(input instanceof HTMLTextAreaElement) || !(host instanceof HTMLElement)) {
    return;
  }
  const config = editorContentConfig(root, input);
  const monacoRef = await ensureMonaco();
  await activateLanguage(monacoRef, config.language);
  const editor = createEditor(monacoRef, host, input, config);
  editor.onDidChangeModelContent(() => {
      input.value = String(editor.getValue() || "");
  });
  bindEditorFormSubmit(root, input);
  states.set(root, { editor, input });
  roots.add(root);
  bindEditorSharedListeners();
}

function syncEditorContent(root: HTMLElement) {
  const state = states.get(root);
  if (state?.editor && state.input) {
    state.input.value = String(state.editor.getValue() || "");
  }
}

function layoutEditorContent(root: HTMLElement) {
  const state = states.get(root);
  if (state?.editor && typeof state.editor.layout === "function") {
    state.editor.layout();
  }
}

function scheduleEditorContentLayout(target: HTMLElement | Document = document) {
  window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
          roots.forEach((root) => {
              if (target instanceof Document || target.contains(root)) {
                layoutEditorContent(root);
              }
          });
      });
  });
}

function bindEditorFormSubmit(root: HTMLElement, input: HTMLTextAreaElement) {
  const form = input.form || root.closest("form");
  if (!(form instanceof HTMLFormElement)) return null;
  form.addEventListener("submit", () => {
      syncEditorContent(root);
    }, true);
  return form;
}

function bindEditorSharedListeners() {
  if (sharedListenersBound) return;
  sharedListenersBound = true;
  document.addEventListener("tabs:change", (event) => {
      scheduleEditorContentLayout(
        event.target instanceof HTMLElement ? event.target : document,
      );
  });
}

function bindEditorContentFields(root: BindRoot = document) {
  queryAll<HTMLElement>(root, "editor-content-field,[data-tbf-editor-content-field]")
  .forEach((field) => {
      void bindEditorContent(field).catch(() => {
          field.textContent = field.getAttribute("data-tbf-editor-error") ||
            "Editor failed to load.";
      });
  });
}

export {
  bindEditorContent,
  bindEditorContentFields,
  layoutEditorContent,
  scheduleEditorContentLayout,
  syncEditorContent,
};
export type { EditorContentConfig, EditorContentState };
