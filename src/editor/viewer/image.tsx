import { text } from "./shared.js";

function ImagePreviewPane(props: any) {
  return (
    <div
      className="column gap-sm center ver-center bg-canvas"
      style={{
        height: "100%",
        minHeight: Number.isFinite(props.minHeight) ? Number(props.minHeight) : 560,
        padding: 16,
      }}
    >
      <img
        alt={text(props.path, "Image preview")}
        src={String(props.src || "")}
        style={{
          display: "block",
          height: "auto",
          maxHeight: "72vh",
          maxWidth: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}

export { ImagePreviewPane };
