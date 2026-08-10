import { text } from "./shared.js";
import { primitiveStackClassName } from "#hzrmwbvgt2ax";

function ImagePreviewPane(props: any) {
  return (
    <div
    className={primitiveStackClassName({
          center: true,
          className: "bg-canvas",
          gap: "sm",
          verticalCenter: true,
    })}
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
