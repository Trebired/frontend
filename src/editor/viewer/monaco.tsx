import { useEffect, useRef } from "react";

import {
  defineMonacoThemes,
  ensureMonaco,
  getPreferredMonacoThemeName,
} from "#c1t1f0t76p85";
import {
  activateEditorLanguage,
  nextEditorViewerModelInstanceId,
  normalizePath,
  text,
  upsertReadonlyModel,
} from "./shared.js";
import { primitiveTextClassName } from "#hzrmwbvgt2ax";

const editorViewerThemeHandlers = new WeakMap<HTMLElement, () => void>();

function showMonacoError(host: HTMLElement | null, error: any, fallback: string) {
  if (!(host instanceof HTMLElement)) return;
  host.innerHTML = "";
  const message = document.createElement("div");
  message.className = primitiveTextClassName({ muted: true });
  message.textContent = text(error?.message, fallback);
  host.appendChild(message);
}

function installThemeChange(host: HTMLElement, monaco: any) {
  const handleThemeChange = () => {
    if (monaco?.editor) monaco.editor.setTheme(getPreferredMonacoThemeName());
  };
  window.addEventListener("tbf:themechange", handleThemeChange);
  editorViewerThemeHandlers.set(host, handleThemeChange);
}

function removeThemeChange(host: HTMLElement | null) {
  if (!(host instanceof HTMLElement)) return;
  const handleThemeChange = editorViewerThemeHandlers.get(host);
  if (!handleThemeChange) return;
  window.removeEventListener("tbf:themechange", handleThemeChange);
  editorViewerThemeHandlers.delete(host);
}

function createReadonlyEditor(monaco: any, host: HTMLElement) {
  defineMonacoThemes(monaco);
  monaco.editor.setTheme(getPreferredMonacoThemeName());
  return monaco.editor.create(host, {
    automaticLayout: true,
    fontSize: 13,
    lineNumbers: "on",
    minimap: { enabled: false },
    overviewRulerBorder: false,
    readOnly: true,
    renderLineHighlight: "all",
    scrollBeyondLastLine: false,
    tabSize: 2,
    value: "",
    wordWrap: "on",
  });
}

function createReadonlyDiffEditor(monaco: any, host: HTMLElement) {
  defineMonacoThemes(monaco);
  monaco.editor.setTheme(getPreferredMonacoThemeName());
  return monaco.editor.createDiffEditor(host, {
    automaticLayout: true,
    diffCodeLens: false,
    diffWordWrap: "off",
    fontSize: 13,
    hideUnchangedRegions: { enabled: false },
    minimap: { enabled: false },
    originalEditable: false,
    overviewRulerBorder: false,
    readOnly: true,
    renderOverviewRuler: false,
    renderSideBySide: true,
    renderSideBySideInlineBreakpoint: 0,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
      horizontalScrollbarSize: 10,
      verticalScrollbarSize: 10,
    },
    scrollBeyondLastLine: false,
    useInlineViewWhenSpaceIsLimited: false,
  });
}

async function applyReadonlyModel(refs: any, props: any) {
  if (!refs.editor.current || !refs.monaco.current) return;
  const applySequence = ++refs.sequence.current;
  const languageId = await activateEditorLanguage(refs.monaco.current, props.path, props.languageName);
  if (!refs.editor.current || !refs.monaco.current || applySequence !== refs.sequence.current) return;
  refs.model.current = upsertReadonlyModel(
    refs.monaco.current,
    refs.model.current,
    `readonly-view://viewer-${refs.instanceId.current}/${normalizePath(props.path || "untitled.txt")}`,
    languageId,
    String(props.content || ""),
  );
  refs.editor.current.setModel(refs.model.current);
  refs.editor.current.setScrollTop(0);
  refs.editor.current.setScrollLeft(0);
}

function resetDiffScroll(editor: any) {
  const originalEditor = typeof editor.getOriginalEditor === "function" ? editor.getOriginalEditor() : null;
  const modifiedEditor = typeof editor.getModifiedEditor === "function" ? editor.getModifiedEditor() : null;
  for (const pane of [originalEditor, modifiedEditor]) {
    if (!pane || typeof pane.setScrollTop !== "function") continue;
    pane.setScrollTop(0);
    pane.setScrollLeft(0);
  }
}

async function applyReadonlyDiffModels(refs: any, props: any) {
  if (!refs.editor.current || !refs.monaco.current) return;
  const applySequence = ++refs.sequence.current;
  const languageId = await activateEditorLanguage(
    refs.monaco.current,
    props.modifiedPath || props.originalPath || props.path,
    props.languageName,
  );
  if (!refs.editor.current || !refs.monaco.current || applySequence !== refs.sequence.current) return;
  refs.models.current.original = upsertReadonlyModel(
    refs.monaco.current,
    refs.models.current.original,
    `readonly-diff://viewer-${refs.instanceId.current}/original/${normalizePath(props.originalPath || props.path || "original.txt")}`,
    languageId,
    String(props.originalContent || ""),
  );
  refs.models.current.modified = upsertReadonlyModel(
    refs.monaco.current,
    refs.models.current.modified,
    `readonly-diff://viewer-${refs.instanceId.current}/modified/${normalizePath(props.modifiedPath || props.path || "modified.txt")}`,
    languageId,
    String(props.modifiedContent || ""),
  );
  refs.editor.current.setModel({
    original: refs.models.current.original,
    modified: refs.models.current.modified,
  });
  refs.editor.current.layout?.();
  resetDiffScroll(refs.editor.current);
}

function useViewerInstanceId() {
  const instanceIdRef = useRef(0);
  if (!instanceIdRef.current) instanceIdRef.current = nextEditorViewerModelInstanceId();
  return instanceIdRef;
}

function useReadonlyDiffRefs() {
  return {
    editor: useRef<any>(null),
    host: useRef<HTMLDivElement | null>(null),
    instanceId: useViewerInstanceId(),
    models: useRef<{ original: any; modified: any }>({ original: null, modified: null }),
    monaco: useRef<any>(null),
    sequence: useRef(0),
  };
}

function cleanupReadonlyDiffRefs(refs: any) {
  removeThemeChange(refs.host.current as any);
  refs.editor.current?.dispose();
  refs.models.current.original?.dispose();
  refs.models.current.modified?.dispose();
  refs.editor.current = null;
  refs.models.current = { original: null, modified: null };
  refs.monaco.current = null;
}

function useReadonlyPaneRefs() {
  return {
    editor: useRef<any>(null),
    host: useRef<HTMLDivElement | null>(null),
    instanceId: useViewerInstanceId(),
    model: useRef<any>(null),
    monaco: useRef<any>(null),
    sequence: useRef(0),
  };
}

function ReadonlyMonacoPane(props: any) {
  const refs = useReadonlyPaneRefs();
  useEffect(() => {
    let active = true;
    ensureMonaco()
      .then((monaco: any) => {
        if (!active || !(refs.host.current instanceof HTMLElement)) return;
        refs.monaco.current = monaco;
        refs.editor.current = createReadonlyEditor(monaco, refs.host.current);
        installThemeChange(refs.host.current, monaco);
        void applyReadonlyModel(refs, props);
      })
      .catch((error) => {
        if (active) showMonacoError(refs.host.current, error, "Editor failed to load.");
      });
    return () => {
      active = false;
      removeThemeChange(refs.host.current as any);
      refs.editor.current?.dispose();
      refs.model.current?.dispose();
      refs.editor.current = null;
      refs.model.current = null;
      refs.monaco.current = null;
    };
  }, []);
  useEffect(() => {
    void applyReadonlyModel(refs, props).catch(() => {});
  }, [props.content, props.languageName, props.path]);
  return <MonacoHost hostRef={refs.host} minHeight={props.minHeight} />;
}

function ReadonlyMonacoDiffPane(props: any) {
  const refs = useReadonlyDiffRefs();
  useEffect(() => {
    let active = true;
    ensureMonaco()
      .then((monaco: any) => {
        if (!active || !(refs.host.current instanceof HTMLElement)) return;
        refs.monaco.current = monaco;
        refs.editor.current = createReadonlyDiffEditor(monaco, refs.host.current);
        installThemeChange(refs.host.current, monaco);
        void applyReadonlyDiffModels(refs, props);
      })
      .catch((error) => {
        if (active) showMonacoError(refs.host.current, error, "Diff editor failed to load.");
      });
    return () => {
      active = false;
      cleanupReadonlyDiffRefs(refs);
    };
  }, []);
  useEffect(() => {
    void applyReadonlyDiffModels(refs, props).catch(() => {});
  }, [
    props.languageName,
    props.modifiedContent,
    props.modifiedPath,
    props.originalContent,
    props.originalPath,
    props.path,
  ]);
  return <MonacoHost hostRef={refs.host} minHeight={props.minHeight} />;
}

function MonacoHost(props: any) {
  return (
    <div
      ref={props.hostRef}
      className="width-max"
      style={{
        height: "100%",
        minHeight: Number.isFinite(props.minHeight) ? Number(props.minHeight) : 520,
      }}
    />
  );
}

export { ReadonlyMonacoDiffPane, ReadonlyMonacoPane };
