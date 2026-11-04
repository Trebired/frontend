import {
  primitiveTextareaClassName,
  type PrimitiveInputTone,
} from "#0rl8rpgzssot";
import { frontendClassName } from "#5vbaqj4pirp3";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode, type UIEvent } from "react";
import { labelledControl } from "./../field/labelled.js";

type TextareaProps = {
  className?: string;
  highlight?: RegExp;
  label?: ReactNode;
  tone?: PrimitiveInputTone;
  [key: string]: unknown;
};

type HighlightedProps = {
  className?: string;
  defaultValue?: string;
  highlight: RegExp;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onScroll?: (event: UIEvent<HTMLTextAreaElement>) => void;
  tone?: PrimitiveInputTone;
  value?: string;
  [key: string]: unknown;
};

function highlightedParts(text: string, pattern: RegExp): ReactNode[] {
  const parts: ReactNode[] = [];
  let index = 0;
  for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags.replace("g", "") + "g"))) {
    if (!match[0]) continue;
    parts.push(text.slice(index, match.index), <mark className={frontendClassName("text-mark")} key={match.index}>{match[0]}</mark>);
    index = match.index + match[0].length;
  }
  parts.push(text.slice(index));
  return parts;
}

function HighlightedTextarea(props: HighlightedProps) {
  const { className, defaultValue, highlight, onChange, onScroll, tone, value, ...rest } = props;
  const [own, setOwn] = useState(defaultValue ?? "");
  const backdrop = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const text = value ?? own;
  const syncScroll = () => {
    if (backdrop.current && area.current) backdrop.current.scrollTop = area.current.scrollTop;
  };
  useEffect(syncScroll, [text]);
  return (
    <div className={frontendClassName("textarea-highlight")}>
    <div aria-hidden="true" className={primitiveTextareaClassName({ className: frontendClassName("textarea-backdrop"), tone })} ref={backdrop}>
    {highlightedParts(text, highlight)}
    {"\n"}
    </div>
    <textarea
    className={primitiveTextareaClassName({ className, tone })}
    {...rest}
    {...(value === undefined ? { defaultValue } : { value })}
    onChange={(event) => {
        setOwn(event.target.value);
        onChange?.(event);
    }}
    onScroll={(event) => {
        syncScroll();
        onScroll?.(event);
    }}
    ref={area}
    />
    </div>
  );
}

function textarea(props: TextareaProps) {
  const { className, highlight, label, tone, ...rest } = props;
  if (highlight) return labelledControl(label, <HighlightedTextarea className={className} highlight={highlight} tone={tone} {...rest} />);
  return labelledControl(
    label,
    <textarea
    className={primitiveTextareaClassName({ className, tone })}
    {...rest}
    />,
  );
}

export { useTextHighlight } from "./mark.js";
export type { TextHighlightOptions } from "./mark.js";
export type { TextareaProps };
export default textarea;
