import { Icon } from "#lbkpzw8nphru";
import { bar as progress_bar } from "#6hfutrhvm6x6";
import { card } from "#6hfutrhvm6x6";
import {
  InlineRow,
  Stack,
  Text,
  primitiveButtonClassName,
  primitiveInlineRowClassName,
} from "#hzrmwbvgt2ax";
import {
  FullscreenCloseButton,
  FullscreenOpenButton,
  FullscreenTarget,
} from "#vbkfq413o3u7";
import type { EditorBodyProps, EditorLabels, EditorSurfaceProps } from "./types.js";

const EDITOR_FULLSCREEN_GROUP = "editor_surface";
const EDITOR_EXTEND_ID = "editor_surface_panel";

function editor_body(props: EditorBodyProps) {
  const { mode, ...surfaceProps } = props;
  return editor_surface({
    ...surfaceProps,
    ideMode: normalizeEditorMode(mode),
  });
}

function editor_surface(props: EditorSurfaceProps) {
  const state = readSurfaceState(props);
  const surface = card({
    gap: "sm",
    children: (
      <>
        {editorHeader(state)}
        {state.ideMode === "edit" ? editSurface(state) : viewerSurface(state)}
      </>
    ),
  });
  return (
    <FullscreenTarget fullscreenId={state.extendId} group={state.extendGroup}>
      {surface}
    </FullscreenTarget>
  );
}

function labels(input: EditorLabels = {}): Required<EditorLabels> {
  return {
    displayFullscreen: input.displayFullscreen || "Display fullscreen",
    editor: input.editor || "Editor",
    editorSessionOpening: input.editorSessionOpening || "Editor session is opening.",
    exitFullscreen: input.exitFullscreen || "Exit fullscreen",
    monacoEditorLoadFailed: input.monacoEditorLoadFailed || "Editor failed to load.",
    openFullIde: input.openFullIde || "Open full IDE",
    preparingFileBrowser: input.preparingFileBrowser || "Preparing file browser.",
    requestedPath: input.requestedPath || ((path) => `Requested path: ${path}`),
    viewerLoadingTitle: input.viewerLoadingTitle || "Loading viewer",
    waitingForEditorAvailability: input.waitingForEditorAvailability || "Waiting for editor availability.",
  };
}

function readSurfaceState(props: EditorSurfaceProps) {
  const text = labels(props.labels);
  const extendId = String(props.extendId || EDITOR_EXTEND_ID).trim() ||
    EDITOR_EXTEND_ID;
  const extendGroup = String(props.extendGroup || EDITOR_FULLSCREEN_GROUP).trim() ||
    EDITOR_FULLSCREEN_GROUP;
  return {
    actions: props.actions,
    extendGroup,
    extendId,
    fullIdeUrl: String(props.fullIdeUrl || "").trim(),
    ideAvailable: props.ideAvailable !== false,
    ideLaunch: objectValue(props.ideLaunch),
    ideMode: readIdeMode(props.ideMode),
    ideUnavailableMessage: String(props.ideUnavailableMessage || "").trim(),
    initialStatusText: String(props.initialStatusText || "").trim(),
    labels: text,
    loading: loadingState(props.ideLaunch, text),
    requestedPath: String(props.requestedPath || "").trim(),
    title: String(props.title || text.editor).trim() || text.editor,
    viewer: viewerState(props, text),
  };
}

function loadingState(ideLaunch: any, text: Required<EditorLabels>) {
  const activity = objectValue(ideLaunch?.activity);
  const percent = Math.max(0, Math.min(100, Number(activity?.progress_percent) || 0));
  return {
    detail: String(
      activity?.progress_detail ||
        activity?.status_message ||
        text.editorSessionOpening,
    ).trim(),
    label: percent > 0 ? `${percent}%` : "0%",
    meta: String(activity?.progress_meta || "").trim(),
    percent,
  };
}

function viewerState(props: EditorSurfaceProps, text: Required<EditorLabels>) {
  return {
    loadingText: String(props.viewerLoadingText || text.preparingFileBrowser).trim(),
    loadingTitle: String(props.viewerLoadingTitle || text.viewerLoadingTitle).trim(),
    rootDataAttr: String(props.viewerRootDataAttr || "data-editor-viewer-root").trim(),
    rootId: String(props.viewerRootId || "").trim(),
    state: objectValue(props.viewerState),
    stateDataAttr: String(props.viewerStateDataAttr || "data-editor-viewer-state").trim(),
    stateId: String(props.viewerStateId || "").trim(),
  };
}

function editSurface(state: ReturnType<typeof readSurfaceState>) {
  return (
    <div className="border radius-md overflow-hidden">
      <script
        data-editor-launch=""
        dangerouslySetInnerHTML={jsonHtml(state.ideLaunch)}
        type="application/json"
      />
      {editorLoader(state)}
      <iframe
        aria-label={state.labels.editor}
        className="display-block overflow-hidden width-max height-xl4 bg-transparent border-0"
        data-editor-frame=""
        hidden
        name="editor_frame"
        src="about:blank"
      />
    </div>
  );
}

function editorLoader(state: ReturnType<typeof readSurfaceState>) {
  return (
    <InlineRow className="height-xl4" data-editor-loader="">
      <div className="center">
        <div className="width-fit no-stretch">{editorLoaderContent(state)}</div>
      </div>
    </InlineRow>
  );
}

function editorLoaderContent(state: ReturnType<typeof readSurfaceState>) {
  return (
    <Stack center gap="sm" horizontalCenter>
      <strong data-editor-status="">{state.initialStatusText || state.labels.waitingForEditorAvailability}</strong>
      <Text breakWord data-editor-detail="" muted size="sm">{state.loading.detail}</Text>
      <div className="width-md max-width-full text-left">
        {progress_bar({
          label: state.loading.label,
          meta: state.loading.meta,
          percent: state.loading.percent,
          wrapperAttributes: "data-editor-progress-bar",
        })}
      </div>
      {unavailableMessage(state)}
      {requestedPath(state)}
    </Stack>
  );
}

function unavailableMessage(state: ReturnType<typeof readSurfaceState>) {
  if (state.ideAvailable || !state.ideUnavailableMessage) return null;
  return (
    <Text breakWord data-editor-unavailable="" muted size="sm">
      {state.ideUnavailableMessage}
    </Text>
  );
}

function requestedPath(state: ReturnType<typeof readSurfaceState>) {
  if (!state.requestedPath) return null;
  return (
    <Text breakWord muted size="sm">
      {state.labels.requestedPath(state.requestedPath)}
    </Text>
  );
}

function viewerSurface(state: ReturnType<typeof readSurfaceState>) {
  return (
    <>
      <script
        id={state.viewer.stateId || undefined}
        type="application/json"
        {...{ [state.viewer.stateDataAttr]: "" }}
        dangerouslySetInnerHTML={jsonHtml(state.viewer.state)}
      />
      <Stack
        id={state.viewer.rootId || undefined}
        gap="sm"
        grow
        {...{ [state.viewer.rootDataAttr]: "" }}
        style={{ flex: "1 1 auto", minHeight: 0 }}
      >
        {viewerLoadingCard(state)}
      </Stack>
    </>
  );
}

function viewerLoadingCard(state: ReturnType<typeof readSurfaceState>) {
  return card({
    center: true,
    gap: "sm",
    verticalCenter: true,
    style: { minHeight: 560 },
    children: (
      <>
        <strong>{state.viewer.loadingTitle}</strong>
        <Text breakWord muted size="sm">{state.viewer.loadingText}</Text>
      </>
    ),
  });
}

function editorHeader(state: ReturnType<typeof readSurfaceState>) {
  return card({
    className: primitiveInlineRowClassName({
      className: "width-full padding-sm",
      gap: "sm",
      verticalCenter: true,
    }),
    layout: "none",
    children: (
      <>
        <h3>{state.title}</h3>
        <div className="right">
          <InlineRow gap="xs">
            {state.actions}
            {state.ideMode === "edit" ? editorExternalLink(state) : null}
            {state.ideMode !== "edit" ? fullscreenActions(state) : null}
          </InlineRow>
        </div>
      </>
    ),
  });
}

function fullscreenActions(state: ReturnType<typeof readSurfaceState>) {
  return (
    <>
      <FullscreenOpenButton
        aria-label={state.labels.displayFullscreen}
        className={primitiveButtonClassName({ icon: true, size: "md", tooltip: true })}
        fullscreenId={state.extendId}
        group={state.extendGroup}
        title={state.labels.displayFullscreen}
      >
        <Icon spec="remixicon fullscreen-line" />
      </FullscreenOpenButton>
      <FullscreenCloseButton
        aria-label={state.labels.exitFullscreen}
        className={primitiveButtonClassName({ icon: true, size: "md", tooltip: true })}
        data-tbf-fullscreen-hidden="true"
        fullscreenId={state.extendId}
        group={state.extendGroup}
        title={state.labels.exitFullscreen}
      >
        <Icon spec="remixicon fullscreen-exit-line" />
      </FullscreenCloseButton>
    </>
  );
}

function editorExternalLink(state: ReturnType<typeof readSurfaceState>) {
  return (
    <a
      className={primitiveButtonClassName({ size: "sm" })}
      data-editor-external-link=""
      hidden
      href={state.fullIdeUrl || undefined}
    >
      <Icon spec="remixicon external-link-line" /> {state.labels.openFullIde}
    </a>
  );
}

function normalizeEditorMode(mode: EditorBodyProps["mode"]) {
  const normalized = String(mode || "").trim().toLowerCase();
  return normalized === "view" || normalized === "viewer" ? "view" : "edit";
}

function readIdeMode(value: unknown) {
  return String(value || "").trim().toLowerCase() === "view" ? "view" : "edit";
}

function objectValue(value: any) {
  return value && typeof value === "object" ? value : {};
}

function jsonHtml(value: unknown) {
  return { __html: JSON.stringify(value).replace(/</g, "\\u003c") };
}

export { editor_body, editor_surface };
