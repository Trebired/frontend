import { EditorViewerApp } from "./app.js";
import { ReadonlyMonacoDiffPane } from "./monaco.js";
import {
  ReadonlyEditorContentApp,
  ReadonlyEditorDiffApp,
} from "./readonly.js";
import { deleteRoot, getEditorViewerRoot } from "./shared.js";

function mountEditorViewer(container: HTMLElement | null, input: any) {
  const root = getEditorViewerRoot(container);
  if (!root) return;
  root.render(<EditorViewerApp {...(input && typeof input === "object" ? input : {})} />);
}

function mountReadonlyEditorContent(container: HTMLElement | null, input: any) {
  const root = getEditorViewerRoot(container);
  if (!root) return;
  root.render(
    <ReadonlyEditorContentApp {...(input && typeof input === "object" ? input : {})} />,
  );
}

function mountReadonlyEditorDiff(container: HTMLElement | null, input: any) {
  const root = getEditorViewerRoot(container);
  if (!root) return;
  root.render(<ReadonlyEditorDiffApp {...(input && typeof input === "object" ? input : {})} />);
}

function unmountEditorViewer(container: HTMLElement | null) {
  const root = getEditorViewerRoot(container);
  if (!root) return;
  root.unmount();
  deleteRoot(container);
}

export * from "./app.js";
export * from "./fullscreen.js";
export * from "./hooks.js";
export * from "./image.js";
export * from "./monaco.js";
export * from "./readonly.js";
export * from "./shared.js";
export {
  ReadonlyEditorContentApp,
  ReadonlyEditorDiffApp,
  ReadonlyMonacoDiffPane,
  mountEditorViewer,
  mountReadonlyEditorContent,
  mountReadonlyEditorDiff,
  unmountEditorViewer,
};
