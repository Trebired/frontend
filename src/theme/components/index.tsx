import type { ButtonHTMLAttributes, HTMLAttributes, ScriptHTMLAttributes } from "react";
import { classNames } from "#ndsvdqv80epr";
import {
  createThemeBootScript,
  getThemeModes,
  normalizeTheme,
  type ThemeModeOptions,
  type ThemeValue,
} from "#zzt5zj380sl9";

type ThemeToggleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  darkLabel?: string;
  labels?: Record<string, string>;
  lightLabel?: string;
};

type ThemeBootScriptProps = ScriptHTMLAttributes<HTMLScriptElement> & ThemeModeOptions & {
  theme?: ThemeValue;
};

type ThemeSelectProps = Omit<HTMLAttributes<HTMLElement>, "defaultValue"> & ThemeModeOptions & {
  label?: string;
  name?: string;
  optionClassName?: string;
  value?: ThemeValue;
  variant?: "buttons" | "select";
};

function themeLabelAttributes(labels: Record<string, string> | undefined): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [key, label] of Object.entries(labels || {})) {
    attributes[`data-tbf-theme-${key}-label`] = label;
  }
  return attributes;
}

function ThemeToggle(props: ThemeToggleProps) {
  const {
    children,
    className,
    darkLabel = "Dark",
    labels,
    lightLabel = "Light",
    type = "button",
    ...rest
  } = props;
  return (
    <button
      {...rest}
      {...themeLabelAttributes(labels)}
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

function ThemeSelect(props: ThemeSelectProps) {
  const { className, dark, label, light, modes, name, optionClassName, value, variant = "select", ...rest } = props;
  const registry = getThemeModes({ dark, light, modes });
  const current = normalizeTheme(value, { dark, light, modes });
  if (variant === "buttons") {
    return (
      <div
        {...rest}
        aria-label={label}
        className={classNames("tbf-theme-select", className)}
        data-tbf-theme-select=""
        role="radiogroup"
      >
        {registry.modes.map((mode) => (
          <button
            aria-checked={mode.key === current}
            className={classNames("tbf-theme-select__option", optionClassName)}
            data-tbf-popover-close=""
            data-tbf-theme-active={mode.key === current ? "true" : "false"}
            data-tbf-theme-value={mode.key}
            key={mode.key}
            role="radio"
            type="button"
          >
            {mode.label}
          </button>
        ))}
      </div>
    );
  }
  return (
    <select
      {...rest}
      aria-label={label}
      className={classNames("tbf-theme-select", className)}
      data-tbf-theme-select=""
      defaultValue={current || undefined}
      name={name}
    >
      {registry.modes.map((mode) => (
        <option key={mode.key} value={mode.key}>{mode.label}</option>
      ))}
    </select>
  );
}

function ThemeBootScript(props: ThemeBootScriptProps) {
  const { dark, light, modes, theme = "", ...rest } = props;
  return (
    <script
      {...rest}
      dangerouslySetInnerHTML={{ __html: createThemeBootScript(theme, { dark, light, modes }) }}
    />
  );
}

export { ThemeBootScript, ThemeSelect, ThemeToggle };
export type { ThemeBootScriptProps, ThemeSelectProps, ThemeToggleProps };
