import type { CSSProperties, ReactNode } from "react";

type EditorLabels = {
  displayFullscreen?: string;
  editor?: string;
  editorSessionOpening?: string;
  exitFullscreen?: string;
  monacoEditorLoadFailed?: string;
  openFullIde?: string;
  preparingFileBrowser?: string;
  requestedPath?: (path: string) => string;
  viewerLoadingTitle?: string;
  waitingForEditorAvailability?: string;
};

type EditorContentProps = {
  body?: ReactNode;
  className?: string;
  defaultValue?: string;
  description?: ReactNode;
  disabled?: boolean;
  language?: string;
  minHeight?: number;
  name?: string;
  path?: string;
  placeholder?: string;
  readonly?: boolean;
  surfaceClassName?: string;
  surfaceStyle?: CSSProperties;
  title: ReactNode;
  value?: string;
};

type EditorSidebarProps = {
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  style?: CSSProperties;
  title: ReactNode;
};

type EditorSurfaceProps = {
  actions?: ReactNode;
  extendGroup?: string;
  extendId?: string;
  fullIdeUrl?: string;
  ideAvailable?: boolean;
  ideLaunch?: any;
  ideMode?: string;
  ideUnavailableMessage?: string;
  initialStatusText?: string;
  lang?: string;
  labels?: EditorLabels;
  requestedPath?: string;
  title?: string;
  viewerLoadingText?: string;
  viewerLoadingTitle?: string;
  viewerRootDataAttr?: string;
  viewerRootId?: string;
  viewerState?: any;
  viewerStateDataAttr?: string;
  viewerStateId?: string;
};

type EditorBodyProps = Omit<EditorSurfaceProps, "ideMode">& {
  mode?: "edit" | "editor" | "view" | "viewer";
};

export type {
  EditorBodyProps,
  EditorContentProps,
  EditorLabels,
  EditorSidebarProps,
  EditorSurfaceProps,
};
