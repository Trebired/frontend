import { parseJsonText, queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { renderFileTreeExplorer } from "#zgttxcjd88sc";
import { text, translate } from "#kv9urtb9dbq5";
import {
  SOURCE_FILE_TREE_CONFIG_ATTR,
  SOURCE_FILE_TREE_ROOT_SELECTOR,
} from "./selectors.js";
import type { SourceLanguageRuntimeOptions } from "./types.js";

function readFileTreeConfig(root: HTMLElement, options: SourceLanguageRuntimeOptions) {
  const config = parseJsonText<Record<string, unknown>>(
    text(root.getAttribute(SOURCE_FILE_TREE_CONFIG_ATTR)),
    {},
  );
  const highlightedPaths = Array.isArray(config.highlightedPaths)
    ? config.highlightedPaths.map((entry) => text(entry)).filter(Boolean)
    : [];
  return {
    emptyMessage: text(config.emptyMessage, translate(options.lang, "noMatchingFiles")),
    highlightedPaths,
    repositoryBase: text(config.repositoryBase, options.repositoryBase),
  };
}

function fileOpenHandler(repositoryBase: string, options: SourceLanguageRuntimeOptions) {
  if (options.openFile) return options.openFile;
  if (!repositoryBase || typeof window === "undefined") return () => {};
  return (relPath: string) => {
    const nextPath = text(relPath);
    if (!nextPath) return;
    window.location.href = `${repositoryBase}/edit?path=${encodeURIComponent(nextPath)}`;
  };
}

function renderSourceLanguageFileTree(
  root: HTMLElement,
  options: SourceLanguageRuntimeOptions,
) {
  const config = readFileTreeConfig(root, options);
  const repositoryTree = Array.isArray(options.tree) ? options.tree : [];
  if (!config.highlightedPaths.length) {
    renderFileTreeExplorer(root, { message: config.emptyMessage });
    return;
  }
  if (!repositoryTree.length) {
    renderFileTreeExplorer(root, {
      message: translate(options.lang, "noRepositoryTreeAvailable"),
    });
    return;
  }
  renderFileTreeExplorer(root, {
    autoExpandPaths: config.highlightedPaths,
    emptyMessage: config.emptyMessage,
    highlightedPaths: config.highlightedPaths,
    interactive: false,
    mode: "browse",
    onFileOpen: fileOpenHandler(config.repositoryBase, options),
    tree: repositoryTree,
  });
}

function mountSourceLanguageFileTrees(
  root: BindRoot = document,
  options: SourceLanguageRuntimeOptions = {},
) {
  queryAll<HTMLElement>(root, SOURCE_FILE_TREE_ROOT_SELECTOR).forEach((treeRoot) => {
    renderSourceLanguageFileTree(treeRoot, options);
  });
}

export { mountSourceLanguageFileTrees };
