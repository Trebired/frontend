import type { ButtonHTMLAttributes, ScriptHTMLAttributes } from "react";
import { classNames } from "#ndsvdqv80epr";
import { createThemeBootScript, type ThemeValue } from "#zzt5zj380sl9";

type ThemeToggleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  darkLabel?: string;
  lightLabel?: string;
};

type ThemeBootScriptProps = ScriptHTMLAttributes<HTMLScriptElement> & {
  theme?: ThemeValue;
};

function ThemeToggle(props: ThemeToggleProps) {
  const {
    children,
    className,
    darkLabel = "Dark",
    lightLabel = "Light",
    type = "button",
    ...rest
  } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-theme-button", className)}
      data-tbf-theme-button=""
      data-tbf-theme-dark-label={darkLabel}
      data-tbf-theme-light-label={lightLabel}
      type={type}
    >
      {children || <span data-tbf-theme-label="">{lightLabel}</span>}
    </button>
  );
}

function ThemeBootScript(props: ThemeBootScriptProps) {
  const { theme = "", ...rest } = props;
  return (
    <script
      {...rest}
      dangerouslySetInnerHTML={{ __html: createThemeBootScript(theme) }}
    />
  );
}

export { ThemeBootScript, ThemeToggle };
export type { ThemeBootScriptProps, ThemeToggleProps };
