import { useMemo, useRef } from "react";

import {
  Text,
  card,
  primitiveInlineRowClassName,
  primitiveStackClassName,
} from "#hzrmwbvgt2ax";
import { editor_content as EditorContent, editor_sidebar as EditorSidebar } from "#nn6lx6ueg6es";
import { FileTreeView } from "#zgttxcjd88sc";
import {
  buildFileApiUrl,
  isImagePath,
  normalizePath,
  resolveViewerTreeHeight,
  text,
} from "./shared.js";
import {
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
} from "./hooks.js";
import { EmptyEditorMessage } from "./readonly.js";
import { ImagePreviewPane } from "./image.js";
import { ReadonlyMonacoPane } from "./monaco.js";

const rootStyle = { flex: "1 1 auto", minHeight: 0 };
const rowStyle = { alignItems: "stretch", flex: "1 1 auto", minHeight: 0 };

function EditorViewerApp(props: any) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const initialTree = useInitialTree(props);
  const initial = useInitialFileState(props, initialTree);
  const treeState = useTreeState(props, initialTree);
  const pathState = useSelectedPaths(initial);
  const [fileState, setFileState] = useFileState(initial.initialFile);
  const fileCacheRef = useInitialFileCache(initial.initialFile);
  const allowUrlPathSyncRef = useRef(Boolean(initial.requestedPath));
  const fullscreenState = useFullscreenState(rootRef);
  useFocusedTreeSync(treeState, pathState);
  useUrlPathSync(treeState.tree, pathState, allowUrlPathSyncRef);
  useOpenedFile(props, pathState.openedFilePath, fileCacheRef, setFileState);
  const layout = useEditorViewerLayout(props, fileState, fullscreenState);
  return (
    <div ref={rootRef} className={primitiveStackClassName({ gap: "sm", grow: true })} style={rootStyle}>
      <div
        className={primitiveInlineRowClassName({ className: "tbf-editor-viewer-layout grow", gap: "sm" })}
        style={rowStyle}
      >
        <ViewerSidebar
          allowUrlPathSyncRef={allowUrlPathSyncRef}
          focusedPath={pathState.focusedPath}
          isFullscreen={fullscreenState.isFullscreen}
          setFocusedPath={pathState.setFocusedPath}
          setOpenedFilePath={pathState.setOpenedFilePath}
          treeHeight={layout.treeHeight}
          treeState={treeState}
          labels={viewerLabels(props.labels)}
        />
        <ViewerContent
          contentMinHeight={layout.contentMinHeight}
          fileState={fileState}
          imagePreviewUrl={layout.imagePreviewUrl}
          labels={viewerLabels(props.labels)}
        />
      </div>
    </div>
  );
}

function viewerLabels(input: any = {}) {
  return {
    chooseFileFromTree: input.chooseFileFromTree || "Choose a file from the tree.",
    fetchingLatestFileContents: input.fetchingLatestFileContents || "Fetching latest file contents.",
    fileOpenViewMode: input.fileOpenViewMode || "File open in read-only view mode.",
    fileTree: input.fileTree || "File tree",
    fileTreeDescription: input.fileTreeDescription || "Browse files in this tree.",
    fileTreeUnavailable: input.fileTreeUnavailable || "File tree unavailable",
    fileUnavailable: input.fileUnavailable || "File unavailable",
    imageOpenViewMode: input.imageOpenViewMode || "Image open in preview mode.",
    loadingFile: input.loadingFile || "Loading file",
    loadingFileTree: input.loadingFileTree || "Loading file tree",
    loadingSelectedFile: input.loadingSelectedFile || "Loading selected file.",
    noFileSelected: input.noFileSelected || "No file selected",
    noFileTreeAvailable: input.noFileTreeAvailable || "No file tree available.",
    pickFileFromTree: input.pickFileFromTree || "Pick a file from the tree.",
    preparingFileBrowserViewMode: input.preparingFileBrowserViewMode || "Preparing file browser.",
    readonlyFileViewer: input.readonlyFileViewer || "Readonly file viewer",
  };
}

function useEditorViewerLayout(props: any, fileState: any, fullscreenState: any) {
  const imagePreviewUrl = useMemo(() => {
    if (!isImagePath(fileState.path)) return "";
    return buildFileApiUrl(props.fileBlobApiUrl, fileState.path);
  }, [fileState.path, props.fileBlobApiUrl]);
  return {
    contentMinHeight: fullscreenState.isFullscreen
      ? Math.max(680, fullscreenState.viewportHeight - 220)
      : 560,
    imagePreviewUrl,
    treeHeight: resolveViewerTreeHeight(
      fullscreenState.isFullscreen,
      fullscreenState.viewportHeight,
    ),
  };
}

function ViewerSidebar(props: any) {
  return (
    <EditorSidebar
      className={primitiveStackClassName({ gap: "sm", noShrink: true })}
      description={props.labels.fileTreeDescription}
      title={props.labels.fileTree}
      style={{
        flex: props.isFullscreen ? "0 0 360px" : "0 0 320px",
        maxWidth: "100%",
        minHeight: 0,
        minWidth: 280,
      }}
    >
      <ViewerSidebarBody {...props} />
    </EditorSidebar>
  );
}

function ViewerSidebarBody(props: any) {
  if (props.treeState.treeLoading) {
    return (
      <EmptyEditorMessage
        copy={props.labels.preparingFileBrowserViewMode}
        minHeight={420}
        title={props.labels.loadingFileTree}
      />
    );
  }
  if (props.treeState.treeError) {
    return card({
      style: { minHeight: 420 },
      gap: "sm",
      children: (
        <>
          <strong>{props.labels.fileTreeUnavailable}</strong>
          <Text breakWord muted size="sm">{props.treeState.treeError}</Text>
        </>
      ),
    });
  }
  return <ViewerTree {...props} />;
}

function ViewerTree(props: any) {
  return (
    <FileTreeView
      autoExpandPaths={props.focusedPath ? [props.focusedPath] : []}
      emptyMessage={props.labels.noFileTreeAvailable}
      height={props.treeHeight}
      highlightedPaths={props.focusedPath ? [props.focusedPath] : []}
      mode="browse"
      scrollbarSize="md"
      onFileOpen={(nextPath: string) => selectViewerPath(props, nextPath, "file")}
      onPathOpen={(nextPath: string, meta: any) => {
        selectViewerPath(props, nextPath, text(meta?.kind).toLowerCase());
      }}
      tree={props.treeState.tree}
    />
  );
}

function selectViewerPath(props: any, nextPath: string, kind: string) {
  const relPath = normalizePath(nextPath);
  props.allowUrlPathSyncRef.current = true;
  props.setFocusedPath(relPath);
  props.setOpenedFilePath(kind === "dir" ? "" : relPath);
}

function ViewerContent(props: any) {
  return (
    <EditorContent
      body={<ViewerContentBody {...props} />}
      className={primitiveStackClassName({ gap: "sm", grow: true })}
      description={viewerContentDescription(props.fileState, props.labels)}
      surfaceStyle={{ flex: "1 1 auto", minHeight: props.contentMinHeight }}
      title={props.fileState.path || props.labels.readonlyFileViewer}
    />
  );
}

function ViewerContentBody(props: any) {
  const { contentMinHeight, fileState, imagePreviewUrl } = props;
  if (fileState.loading) {
    return (
      <EmptyEditorMessage
        copy={props.labels.fetchingLatestFileContents}
        minHeight={contentMinHeight}
        title={props.labels.loadingFile}
      />
    );
  }
  if (fileState.error) return viewerContentError(props, contentMinHeight);
  if (fileState.path && isImagePath(fileState.path) && imagePreviewUrl) {
    return (
      <ImagePreviewPane
        minHeight={contentMinHeight}
        path={fileState.path}
        src={imagePreviewUrl}
      />
    );
  }
  if (fileState.path) return readonlyFilePane(fileState, contentMinHeight);
  return emptyViewerContent(props, contentMinHeight);
}

function viewerContentError(props: any, contentMinHeight: number) {
  return card({
    style: { minHeight: contentMinHeight },
    className: "height-max",
    gap: "sm",
    children: (
      <>
        <strong>{props.labels.fileUnavailable}</strong>
        <Text breakWord muted size="sm">{props.fileState.error}</Text>
      </>
    ),
  });
}

function readonlyFilePane(fileState: any, contentMinHeight: number) {
  return (
    <ReadonlyMonacoPane
      content={fileState.content}
      languageName={fileState.languageName}
      minHeight={contentMinHeight}
      path={fileState.path}
    />
  );
}

function emptyViewerContent(props: any, contentMinHeight: number) {
  return (
    <div
      className={primitiveStackClassName({
        center: true,
        className: "height-max",
        gap: "sm",
        verticalCenter: true,
      })}
      style={{ minHeight: contentMinHeight }}
    >
      <strong>{props.labels.noFileSelected}</strong>
      <Text muted size="sm">{props.labels.chooseFileFromTree}</Text>
    </div>
  );
}

function viewerContentDescription(fileState: any, labels: ReturnType<typeof viewerLabels>) {
  if (fileState.loading) return labels.loadingSelectedFile;
  if (fileState.error) return fileState.error;
  if (!fileState.path) return labels.pickFileFromTree;
  if (isImagePath(fileState.path)) return labels.imageOpenViewMode;
  return labels.fileOpenViewMode;
}

export { EditorViewerApp, viewerLabels };
