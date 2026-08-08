import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildFileApiUrl,
  findTreeNodeByPath,
  normalizePath,
  readViewerPathFromUrl,
  syncViewerPathInUrl,
  text,
} from "./shared.js";
import { useFullscreenState } from "./fullscreen.js";

function useInitialTree(props: any) {
  return useMemo(() => Array.isArray(props.tree) ? props.tree : [], [props.tree]);
}

function useInitialFileState(props: any, initialTree: any[]) {
  const initialFile = props.initialFile && typeof props.initialFile === "object" ? props.initialFile : null;
  const requestedPath = normalizePath(props.requestedPath);
  const requestedNode = findTreeNodeByPath(initialTree, requestedPath);
  const requestedIsDir = text(requestedNode?.kind).toLowerCase() === "dir";
  return { initialFile, requestedIsDir, requestedPath };
}

function useTreeState(props: any, initialTree: any[]) {
  const [treeLoaded, setTreeLoaded] = useState(
    props.treeLoaded === true || initialTree.length > 0 || !text(props.treeApiUrl),
  );
  const [tree, setTree] = useState(initialTree);
  const [treeLoading, setTreeLoading] = useState(!treeLoaded && Boolean(text(props.treeApiUrl)));
  const [treeError, setTreeError] = useState("");
  useEffect(() => {
    if (treeLoaded || !text(props.treeApiUrl)) return undefined;
    return fetchTree(props.treeApiUrl, setTree, setTreeLoaded, setTreeLoading, setTreeError);
  }, [props.treeApiUrl, treeLoaded]);
  return { setTree, tree, treeError, treeLoaded, treeLoading };
}

function fetchTree(
  treeApiUrl: string,
  setTree: any,
  setTreeLoaded: any,
  setTreeLoading: any,
  setTreeError: any,
) {
  let active = true;
  const loadFailed = "File tree failed to load.";
  setTreeLoading(true);
  setTreeError("");
  fetch(String(treeApiUrl), {
    cache: "no-store",
    credentials: "same-origin",
    headers: { "x-requested-with": "editor-viewer" },
  })
    .then(readJsonOrThrow(loadFailed))
    .then((payload) => {
      if (!active) return;
      setTreeLoaded(true);
      setTree(Array.isArray(payload?.data?.tree) ? payload.data.tree : []);
    })
    .catch((error) => {
      if (!active) return;
      setTreeLoaded(true);
      setTreeError(text(error?.message, loadFailed));
    })
    .finally(() => {
      if (active) setTreeLoading(false);
    });
  return () => {
    active = false;
  };
}

function readJsonOrThrow(defaultMessage: string) {
  return async function readJsonResponse(response: Response) {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(text(payload?.message || payload?.error, defaultMessage));
    }
    return payload;
  };
}

function useSelectedPaths(initial: any) {
  const [focusedPath, setFocusedPath] = useState(
    initial.requestedPath || normalizePath(initial.initialFile?.path),
  );
  const [openedFilePath, setOpenedFilePath] = useState(
    initial.requestedIsDir
      ? ""
      : normalizePath(initial.initialFile?.path) || initial.requestedPath,
  );
  return { focusedPath, openedFilePath, setFocusedPath, setOpenedFilePath };
}

function useFileState(initialFile: any) {
  return useState(() => {
    const initialPath = normalizePath(initialFile?.path);
    return {
      content: initialFile && initialPath ? String(initialFile.content || "") : "",
      error: "",
      languageName: text(initialFile?.language_name),
      loading: false,
      path: initialPath,
    };
  });
}

function useInitialFileCache(initialFile: any) {
  const fileCacheRef = useRef<Map<string, { content: string; languageName: string; path: string }>>(new Map());
  useEffect(() => {
    const initialPath = normalizePath(initialFile?.path);
    if (!initialFile || !initialPath) return;
    fileCacheRef.current.set(initialPath, {
      content: String(initialFile.content || ""),
      languageName: text(initialFile?.language_name),
      path: initialPath,
    });
  }, [initialFile]);
  return fileCacheRef;
}

function useFocusedTreeSync(treeState: any, pathState: any) {
  useEffect(() => {
    if (!treeState.tree.length || !pathState.focusedPath) return;
    const targetNode = findTreeNodeByPath(treeState.tree, pathState.focusedPath);
    const targetKind = text(targetNode?.kind).toLowerCase();
    if (targetKind === "dir") {
      if (pathState.openedFilePath) pathState.setOpenedFilePath("");
      return;
    }
    if (!pathState.openedFilePath && targetNode) {
      pathState.setOpenedFilePath(pathState.focusedPath);
    }
  }, [pathState.focusedPath, pathState.openedFilePath, treeState.tree]);
}

function useUrlPathSync(tree: any[], pathState: any, allowUrlPathSyncRef: any) {
  useEffect(() => {
    if (allowUrlPathSyncRef.current) syncViewerPathInUrl(pathState.focusedPath);
  }, [pathState.focusedPath]);
  useEffect(() => {
    function restorePathFromUrl() {
      const nextPath = readViewerPathFromUrl();
      if (!nextPath) {
        pathState.setFocusedPath("");
        pathState.setOpenedFilePath("");
        return;
      }
      const nextNode = findTreeNodeByPath(tree, nextPath);
      const nextKind = text(nextNode?.kind).toLowerCase();
      pathState.setFocusedPath(nextPath);
      pathState.setOpenedFilePath(nextKind === "dir" ? "" : nextPath);
    }
    window.addEventListener("popstate", restorePathFromUrl);
    return () => window.removeEventListener("popstate", restorePathFromUrl);
  }, [tree]);
}

function useOpenedFile(props: any, openedFilePath: string, fileCacheRef: any, setFileState: any) {
  useEffect(() => {
    const relPath = normalizePath(openedFilePath);
    if (!relPath) {
      setFileState({ content: "", error: "", languageName: "", loading: false, path: "" });
      return undefined;
    }
    const cached = fileCacheRef.current.get(relPath);
    if (cached) {
      setFileState({ ...cached, error: "", loading: false });
      return undefined;
    }
    return fetchFile(props.fileApiUrl, relPath, fileCacheRef, setFileState);
  }, [openedFilePath, props.fileApiUrl]);
}

function fetchFile(fileApiUrlInput: unknown, relPath: string, fileCacheRef: any, setFileState: any) {
  const fileApiUrl = buildFileApiUrl(fileApiUrlInput, relPath);
  if (!fileApiUrl) {
    setFileState({
      content: "",
      error: "File API is unavailable.",
      languageName: "",
      loading: false,
      path: relPath,
    });
    return undefined;
  }
  let active = true;
  const loadFailed = "File failed to load.";
  setFileState({ content: "", error: "", languageName: "", loading: true, path: relPath });
  fetch(fileApiUrl, {
    credentials: "same-origin",
    headers: { "x-requested-with": "editor-viewer" },
  })
    .then(readJsonOrThrow(loadFailed))
    .then((payload) => {
      if (active) applyLoadedFile(payload, relPath, fileCacheRef, setFileState);
    })
    .catch((error) => {
      if (active) {
        setFileState({
          content: "",
          error: text(error?.message, loadFailed),
          languageName: "",
          loading: false,
          path: relPath,
        });
      }
    });
  return () => {
    active = false;
  };
}

function applyLoadedFile(payload: any, relPath: string, fileCacheRef: any, setFileState: any) {
  const data = payload?.data && typeof payload.data === "object" ? payload.data : {};
  const nextState = {
    content: String(data.content || ""),
    error: "",
    languageName: text(data.language_name),
    loading: false,
    path: relPath,
  };
  fileCacheRef.current.set(relPath, {
    content: nextState.content,
    languageName: nextState.languageName,
    path: relPath,
  });
  setFileState(nextState);
}

export {
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
};
