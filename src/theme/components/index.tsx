import type { ButtonHTMLAttributes, HTMLAttributes, ScriptHTMLAttributes } from "react";
import { classNames } from "#ndsvdqv80epr";
import {
  createThemeBootScript,
  getThemeModes,
  normalizeTheme,
  type ThemeModeOptions,
  type ThemeValue,
} from "#zzt5zj380sl9";
import { frontendClassName, frontendDataAttr, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

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
    attributes[frontendDataAttr(`theme-${key}-label`)] = label;
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
    className={classNames(frontendClassName("theme-button"), className)}
    {...frontendDataAttrs({ "theme-button": "" })}
    {...frontendDataAttrs({ "theme-dark-label": darkLabel })}
    {...frontendDataAttrs({ "theme-light-label": lightLabel })}
    type={type}
    >
    {children || <span {...frontendDataAttrs({ "theme-label": "" })}>{lightLabel}</span>}
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
      className={classNames(frontendClassName("theme-select"), className)}
      {...frontendDataAttrs({ "theme-select": "" })}
      role="radiogroup"
      >
      {registry.modes.map((mode) => (
            <button
            aria-checked={mode.key === current}
            className={classNames(frontendElementClass("theme-select", "option"), optionClassName)}
            {...frontendDataAttrs({ "popover-close": "" })}
            {...frontendDataAttrs({ "theme-active": mode.key === current ? "true" : "false" })}
            {...frontendDataAttrs({ "theme-value": mode.key })}
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
    className={classNames(frontendClassName("theme-select"), className)}
    {...frontendDataAttrs({ "theme-select": "" })}
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
