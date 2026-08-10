import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";

type ChoiceFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
};

function CheckboxGroup(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return <div {...rest} className={classNames("tbf-choice-group", className)} data-tbf-checkbox-group="">{children}</div>;
}

function RadioGroup(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return <div {...rest} className={classNames("tbf-choice-group", className)} data-tbf-radio-group="" role="radiogroup">{children}</div>;
}

function CheckboxField(props: ChoiceFieldProps) {
  const { className, label, type: _type, ...rest } = props;
  return (
    <label className={classNames("tbf-choice", className)}>
    <input {...rest} type="checkbox" />
    <span>{label}</span>
    </label>
  );
}

function CheckboxAllField(props: ChoiceFieldProps) {
  const { className, label, type: _type, ...rest } = props;
  return (
    <label className={classNames("tbf-choice", className)}>
    <input {...rest} data-tbf-checkbox-all="" type="checkbox" />
    <span>{label}</span>
    </label>
  );
}

function RadioField(props: ChoiceFieldProps) {
  const { className, label, type: _type, ...rest } = props;
  return (
    <label className={classNames("tbf-choice", className)}>
    <input {...rest} type="radio" />
    <span>{label}</span>
    </label>
  );
}

function ToggleField(props: ChoiceFieldProps) {
  const { className, label, type: _type, ...rest } = props;
  return (
    <label className={classNames("tbf-toggle", className)}>
    <input {...rest} type="checkbox" />
    <span>{label}</span>
    </label>
  );
}

export { CheckboxAllField, CheckboxField, CheckboxGroup, RadioField, RadioGroup, ToggleField };
export type { ChoiceFieldProps };
