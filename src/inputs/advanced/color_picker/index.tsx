import type { CSSProperties, ReactNode } from "react";
import { FRONTEND_PREFIX, frontendClassName, frontendClassNames, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { primitiveInputClassName, type PrimitiveInputSize } from "#0rl8rpgzssot";
import { labelledControl } from "./../field/labelled.js";
import { COLOR_SWATCHES, normalizeHexColor } from "./colors.js";

type ColorPickerProps = {
  automatic?: boolean;
  className?: string;
  id?: string;
  label?: ReactNode;
  lang?: string;
  name: string;
  size?: PrimitiveInputSize;
  swatches?: readonly string[];
  value?: string;
};

const block = "color-picker";

function swatchStyle(color: string): CSSProperties | undefined {
  return color ? ({ [`--${FRONTEND_PREFIX}-color-picker-value`]: color } as CSSProperties) : undefined;
}

function Swatch({ color }: { color: string }) {
  return (
    <span
    aria-hidden="true"
    className={frontendElementClass(block, "swatch")}
    style={swatchStyle(color)}
    {...frontendDataAttrs({ "color-empty": color ? undefined : "true" })}
    />
  );
}

function ColorOption({ color, current, label }: { color: string; current: string; label: string }) {
  return (
    <button
    aria-checked={color === current ? "true" : "false"}
    aria-label={label}
    className={frontendElementClass(block, "option")}
    role="radio"
    title={label}
    type="button"
    {...frontendDataAttrs({ "color-option": color, "popover-close": "" })}
    >
    <Swatch color={color} />
    </button>
  );
}

type PanelProps = { automaticLabel: string; copy: (key: string) => string; id: string; swatches: string[]; value: string };

function ColorPanel(props: PanelProps) {
  const { automaticLabel, copy, id, swatches, value } = props;
  return (
    <div
    aria-hidden="true"
    aria-labelledby={id}
    className={frontendClassNames("popover", "popover-portaled", "color-picker-panel")}
    id={`${id}_panel`}
    inert={true}
    role="dialog"
    {...frontendDataAttrs({ "popover": "" })}
    >
    <div aria-label={copy("colorPickerPalette")} className={frontendElementClass(block, "grid")} role="radiogroup">
    {automaticLabel ? <ColorOption color="" current={value} label={automaticLabel} /> : null}
    {swatches.map((color) => <ColorOption color={color} current={value} key={color} label={color} />)}
    </div>
    <input
    aria-label={copy("colorPickerCustom")}
    autoComplete="off"
    className={primitiveInputClassName({ size: "sm" })}
    defaultValue={value}
    maxLength={7}
    placeholder="#RRGGBB"
    spellCheck={false}
    type="text"
    {...frontendDataAttrs({ "color-hex": "" })}
    />
    </div>
  );
}

function color_picker(props: ColorPickerProps) {
  const copy = (key: string) => sourceLanguageMessage(key, props.lang);
  const value = normalizeHexColor(props.value);
  const automaticLabel = props.automatic === false ? "" : copy("colorPickerAutomatic");
  const id = props.id || `${FRONTEND_PREFIX}_color_${props.name.replace(/[^a-z0-9_-]/giu, "_")}`;
  const swatches = (props.swatches?.length ? props.swatches : COLOR_SWATCHES).map(normalizeHexColor).filter(Boolean);
  return labelledControl(props.label, (
      <span
      className={frontendClassName(block)}
      {...frontendDataAttrs({ "color-automatic-label": automaticLabel || undefined, "color-picker": "" })}
      >
      <input name={props.name} type="hidden" value={value} />
      <button
      aria-controls={`${id}_panel`}
      aria-expanded="false"
      aria-haspopup="dialog"
      className={primitiveInputClassName({
            className: [frontendClassName("color-picker-trigger"), props.className].filter(Boolean).join(" "),
            size: props.size,
      })}
      id={id}
      type="button"
      {...frontendDataAttrs({ "popover-indicator": "false", "popover-trigger": "" })}
      >
      <Swatch color={value} />
      <span className={frontendElementClass(block, "value")}>{value || automaticLabel}</span>
      </button>
      <ColorPanel automaticLabel={automaticLabel} copy={copy} id={id} swatches={swatches} value={value} />
      </span>
  ));
}

const ColorPicker = color_picker;

export { ColorPicker, color_picker };
export type { ColorPickerProps };
