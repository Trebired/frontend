export {
  editor_body,
  editor_content,
  editor_sidebar,
  editor_surface,
} from "./components/index.js";
export type *from "./components/index.js";
export {
  bindEditorContentFields,
} from "./content.js";
export type *from "./content.js";
export {
  EditorViewerApp,
  EmptyEditorMessage,
  ImagePreviewPane,
  ReadonlyEditorContentApp,
  ReadonlyEditorDiffApp,
  ReadonlyMonacoDiffPane,
  ReadonlyMonacoPane,
  activateEditorLanguage,
  buildFileApiUrl,
  deleteRoot,
  findFirstFilePath,
  findTreeNodeByPath,
  getEditorViewerRoot,
  isImagePath,
  mountEditorViewer,
  nextEditorViewerModelInstanceId,
  normalizePath,
  readFullscreenState,
  readViewerPathFromUrl,
  resolveViewerTreeHeight,
  syncViewerPathInUrl,
  text,
  upsertReadonlyModel,
  useFileState,
  useFocusedTreeSync,
  useFullscreenState,
  useInitialFileCache,
  useInitialFileState,
  useInitialTree,
  useOpenedFile,
  useSelectedPaths,
  useTreeState,
  useUrlPathSync,
} from "./viewer/index.js";
export type *from "./viewer/index.js";

import type { BindRoot } from "#er0dlx1gtbzh";
import { bindEditorContentFields } from "./content.js";

function bindEditors(root: BindRoot = document) {
  bindEditorContentFields(root);
}

export { bindEditors };
