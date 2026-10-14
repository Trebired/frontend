import { createElement as h, useEffect, useState } from "react";
import { frontendClassName, frontendElementClass } from "#5vbaqj4pirp3";
import { sourceLanguageMessage } from "#2d8f076g07hg";

type CropBox = { height: number; width: number; x: number; y: number };

type CropperHandle = {
  getData: () => CropBox;
  move: (x: number, y: number) => unknown;
  setData: (data: Partial<CropBox>) => unknown;
  zoom: (ratio: number) => unknown;
};

type CropFieldsProps = { cropper: CropperHandle | null; lang?: string };

const STEP = 1;

const COARSE_STEP = 10;

const FIELDS: Array<keyof CropBox> = ["x", "y", "width", "height"];

const MOVES: Record<string, [number, number]> = {
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
};

function roundedBox(cropper: CropperHandle | null): CropBox {
  const data = cropper?.getData();
  if (!data) return { height: 0, width: 0, x: 0, y: 0 };
  return {
    height: Math.round(data.height || 0),
    width: Math.round(data.width || 0),
    x: Math.round(data.x || 0),
    y: Math.round(data.y || 0),
  };
}

function handleCropKey(cropper: CropperHandle | null, event: KeyboardEvent): boolean {
  if (!cropper) return false;
  const move = MOVES[event.key];
  const step = event.shiftKey ? COARSE_STEP : STEP;
  if (move) {
    cropper.move(move[0] * step, move[1] * step);
    return true;
  }
  if (event.key === "+" || event.key === "=") {
    cropper.zoom(0.1);
    return true;
  }
  if (event.key === "-" || event.key === "_") {
    cropper.zoom(-0.1);
    return true;
  }
  return false;
}

function cropFieldLabel(field: keyof CropBox, lang?: string): string {
  return sourceLanguageMessage(`cropField${field[0]!.toUpperCase()}${field.slice(1)}`, lang);
}

function cropField(
  field: keyof CropBox,
  box: CropBox,
  lang: string | undefined,
  commit: (field: keyof CropBox, value: number) => void,
) {
  const id = `${frontendClassName("upload-crop")}-${field}`;
  return h("span", { className: frontendElementClass("upload-crop", "field"), key: field },
    h("label", { className: frontendClassName("label"), htmlFor: id }, cropFieldLabel(field, lang)),
    h("input", {
        className: frontendClassName("input"),
        id,
        inputMode: "numeric",
        onChange: (event: { target: { value: string } }) => commit(field, Number(event.target.value)),
        step: 1,
        type: "number",
        value: String(box[field]),
    }),
  );
}

function CropFields(props: CropFieldsProps) {
  const [box, setBox] = useState<CropBox>(() => roundedBox(props.cropper));

  useEffect(() => {
      const sync = () => setBox(roundedBox(props.cropper));
      sync();
      document.addEventListener("crop", sync as EventListener, true);
      return () => document.removeEventListener("crop", sync as EventListener, true);
    }, [props.cropper]);

  const commit = (field: keyof CropBox, value: number) => {
    if (!Number.isFinite(value)) return;
    props.cropper?.setData({ [field]: Math.max(0, Math.round(value)) });
    setBox(roundedBox(props.cropper));
  };

  return h("div", {
      "aria-label": sourceLanguageMessage("cropNumericLabel", props.lang),
      className: frontendElementClass("upload-crop", "fields"),
      role: "group",
    }, ...FIELDS.map((field) => cropField(field, box, props.lang, commit)));
}

export { CropFields, handleCropKey, roundedBox };
export type { CropBox, CropperHandle };
