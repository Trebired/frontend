import {
  primitiveTextareaClassName,
  type PrimitiveInputTone,
} from "#0rl8rpgzssot";

type TextareaProps = {
  className?: string;
  tone?: PrimitiveInputTone;
  [key: string]: unknown;
};

function textarea(props: TextareaProps) {
  const { className, tone, ...rest } = props;
  return (
    <textarea
    className={primitiveTextareaClassName({ className, tone })}
    {...rest}
    />
  );
}

export type { TextareaProps };
export default textarea;
