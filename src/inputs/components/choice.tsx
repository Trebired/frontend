import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";

type ChoiceFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
};

function CheckboxGroup(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("choice-group"), className)}
    {...frontendDataAttrs({ "checkbox-group": "" })}
    >
    {children}
    </div>
  );
}

function RadioGroup(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("choice-group"), className)}
    {...frontendDataAttrs({ "radio-group": "" })}
    role="radiogroup"
    >
    {children}
    </div>
  );
}

function CheckboxField(props: ChoiceFieldProps) {
  const { className, label, type: _type, ...rest } = props;
  return (
    <label className={classNames(frontendClassName("choice"), className)}>
    <input {...rest} type="checkbox" />
    <span>{label}</span>
    </label>
  );
}

function CheckboxAllField(props: ChoiceFieldProps) {
  const { className, label, type: _type, ...rest } = props;
  return (
    <label className={classNames(frontendClassName("choice"), className)}>
    <input {...rest} {...frontendDataAttrs({ "checkbox-all": "" })} type="checkbox" />
    <span>{label}</span>
    </label>
  );
}

function RadioField(props: ChoiceFieldProps) {
  const { className, label, type: _type, ...rest } = props;
  return (
    <label className={classNames(frontendClassName("choice"), className)}>
    <input {...rest} type="radio" />
    <span>{label}</span>
    </label>
  );
}

function ToggleField(props: ChoiceFieldProps) {
  const { className, label, type: _type, ...rest } = props;
  return (
    <label className={classNames(frontendClassName("toggle"), className)}>
    <input {...rest} type="checkbox" />
    <span>{label}</span>
    </label>
  );
}

export { CheckboxAllField, CheckboxField, CheckboxGroup, RadioField, RadioGroup, ToggleField };
export type { ChoiceFieldProps };
