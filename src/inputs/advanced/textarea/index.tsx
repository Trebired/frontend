import {
  primitiveTextareaClassName,
  type PrimitiveInputTone,
} from "#0rl8rpgzssot";
import type { ReactNode } from "react";
import { labelledControl } from "./../field/labelled.js";

type TextareaProps = {
  className?: string;
  label?: ReactNode;
  tone?: PrimitiveInputTone;
  [key: string]: unknown;
};

function textarea(props: TextareaProps) {
  const { className, label, tone, ...rest } = props;
  return labelledControl(
    label,
    <textarea
    className={primitiveTextareaClassName({ className, tone })}
    {...rest}
    />,
  );
}

export type { TextareaProps };
export default textarea;
