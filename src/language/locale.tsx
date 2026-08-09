import { Icon } from "#lbkpzw8nphru";
import { button } from "#6hfutrhvm6x6";
import { normalizedLang, text, translate } from "./shared.js";
import type { LocaleOption, LocaleSwitcherProps } from "./types.js";

const DEFAULT_LOCALES: LocaleOption[] = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "cs", label: "Czech", shortLabel: "CS" },
];

function localizedLocaleLabel(option: LocaleOption, lang?: string) {
  return text(option.label) || translate(lang, option.code) || option.code;
}

function localeOptionIcon(option: LocaleOption) {
  if (option.icon) return option.icon;
  return (
    <span className="tbf-locale-code" aria-hidden="true">
      {text(option.shortLabel, option.code).slice(0, 3).toUpperCase()}
    </span>
  );
}

function localeTrigger(triggerId: string, popoverId: string, props: LocaleSwitcherProps) {
  const current = normalizedLang(props.lang);
  return button({
    type: "button",
    className: `${text(props.className, "btn")} icon has-tooltip`,
    id: triggerId,
    "aria-controls": popoverId,
    "aria-haspopup": "menu",
    "aria-expanded": "false",
    "aria-label": translate(current, "label"),
    "data-tbf-popover-open": "",
    title: translate(current, "label"),
    children: <Icon spec="remixicon translate-2" />,
  });
}

function localeOptionButton(
  entry: LocaleOption,
  current: string,
  props: LocaleSwitcherProps,
) {
  const code = normalizedLang(entry.code);
  const isCurrent = code === current;
  return (
    <button
      key={code}
      type="button"
      className="popover-close popover-item tbf-locale-option"
      data-tbf-locale-current={isCurrent ? "true" : "false"}
      data-tbf-locale-endpoint={text(props.endpoint, "/ui/lang/set")}
      data-tbf-locale-option=""
      data-tbf-popover-close=""
      role="menuitemradio"
      aria-checked={isCurrent ? "true" : "false"}
      value={code}
    >
      {localeOptionIcon(entry)}
      <span>{localizedLocaleLabel(entry, current)}</span>
    </button>
  );
}

function localePopover(popoverId: string, props: LocaleSwitcherProps) {
  const current = normalizedLang(props.lang);
  const locales = Array.isArray(props.locales) && props.locales.length
    ? props.locales
    : DEFAULT_LOCALES;
  return (
    <div
      className="popover popover-portaled tbf-locale-switch-popover"
      id={popoverId}
      aria-hidden="true"
      data-tbf-popover=""
      role="menu"
    >
      {locales.map((entry) => localeOptionButton(entry, current, props))}
    </div>
  );
}

function locale_switcher(props: LocaleSwitcherProps = {}) {
  const triggerId = text(props.id, "tbf_locale_switch_btn");
  const popoverId = `${triggerId}_menu`;
  return (
    <>
      {localeTrigger(triggerId, popoverId, props)}
      {localePopover(popoverId, props)}
    </>
  );
}

const LocaleSwitcher = locale_switcher;

export { DEFAULT_LOCALES, LocaleSwitcher, locale_switcher };
export type { LocaleOption, LocaleSwitcherProps };
