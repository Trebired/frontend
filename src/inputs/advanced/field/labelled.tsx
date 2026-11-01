import type { ReactNode } from "react";
import { primitiveStackClassName } from "#hzrmwbvgt2ax";
import { frontendClassName } from "#5vbaqj4pirp3";

function labelledControl(label: ReactNode, control: ReactNode) {
  if (label === undefined || label === null || label === "") return control;
  return (
    <label className={primitiveStackClassName({ gap: "xs" })}>
    <span className={frontendClassName("label")}>{label}</span>
    {control}
    </label>
  );
}

export { labelledControl };
