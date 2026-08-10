import { Text, card } from "#hzrmwbvgt2ax";
import { normalizePath, text } from "./shared.js";
import { ReadonlyMonacoDiffPane, ReadonlyMonacoPane } from "./monaco.js";

function EmptyEditorMessage(props: any) {
  return card({
      style: { minHeight: props.minHeight },
      center: true,
      className: "height-max",
      gap: "sm",
      verticalCenter: true,
      children: (
        <>
        <strong>{props.title}</strong>
        <Text muted size="sm">{props.copy}</Text>
        </>
      ),
  });
}

function ReadonlyEditorContentApp(props: any) {
  const path = normalizePath(props.path || "diff.patch");
  const content = String(props.content == null ? "" : props.content);
  const languageName = text(props.languageName);
  const minHeight = Number.isFinite(props.minHeight) ? Number(props.minHeight) : 560;
  if (!content.trim()) {
    return (
      <EmptyEditorMessage
      copy="No content is available for this file."
      minHeight={minHeight}
      title="No content"
      />
    );
  }
  return (
    <ReadonlyMonacoPane
    content={content}
    languageName={languageName}
    minHeight={minHeight}
    path={path}
    />
  );
}

function ReadonlyEditorDiffApp(props: any) {
  const originalContent = String(props.originalContent == null ? "" : props.originalContent);
  const modifiedContent = String(props.modifiedContent == null ? "" : props.modifiedContent);
  const minHeight = Number.isFinite(props.minHeight) ? Number(props.minHeight) : 560;
  const languageName = text(props.languageName);
  const diffPath = normalizePath(props.path || props.modifiedPath || props.originalPath || "diff.txt");
  if (props.originalBinary === true || props.modifiedBinary === true) {
    return (
      <EmptyEditorMessage
      copy="Binary files cannot be displayed as text diffs."
      minHeight={minHeight}
      title="Diff unavailable"
      />
    );
  }
  if (!originalContent.trim() && !modifiedContent.trim()) {
    return (
      <EmptyEditorMessage
      copy="No diff content is available."
      minHeight={minHeight}
      title="No diff content"
      />
    );
  }
  return (
    <ReadonlyMonacoDiffPane
    languageName={languageName}
    minHeight={minHeight}
    modifiedContent={modifiedContent}
    modifiedPath={normalizePath(props.modifiedPath || props.path || "modified.txt")}
    originalContent={originalContent}
    originalPath={normalizePath(props.originalPath || props.path || "original.txt")}
    path={diffPath}
    />
  );
}

export { EmptyEditorMessage, ReadonlyEditorContentApp, ReadonlyEditorDiffApp };
