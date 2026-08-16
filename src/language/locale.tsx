import { Icon } from "#lbkpzw8nphru";
import { button } from "#6hfutrhvm6x6";
import { normalizedLang, text, translate } from "./shared.js";
import type { LocaleOption, LocaleSwitcherProps } from "./types.js";
import { hasFlag } from "country-flag-icons";
import { FRONTEND_PREFIX, frontendClassName, frontendDataAttr, frontendDataAttrs } from "#5vbaqj4pirp3";

const LANGUAGE_FLAG_COUNTRIES: Record<string, string> = {
  ar: "SA",
  bg: "BG",
  ca: "ES-CT",
  cs: "CZ",
  da: "DK",
  de: "DE",
  el: "GR",
  en: "GB",
  es: "ES",
  et: "EE",
  fi: "FI",
  fr: "FR",
  ga: "IE",
  he: "IL",
  hi: "IN",
  hr: "HR",
  hu: "HU",
  id: "ID",
  it: "IT",
  ja: "JP",
  ko: "KR",
  lt: "LT",
  lv: "LV",
  nl: "NL",
  no: "NO",
  pl: "PL",
  pt: "PT",
  ro: "RO",
  ru: "RU",
  sk: "SK",
  sl: "SI",
  sr: "RS",
  sv: "SE",
  tr: "TR",
  uk: "UA",
  vi: "VN",
  zh: "CN",
};

const DEFAULT_LOCALES: LocaleOption[] = [
  { code: "en", flagCountry: "GB", label: "English", shortLabel: "EN" },
  { code: "cs", flagCountry: "CZ", label: "Czech", shortLabel: "CS" },
];

function localizedLocaleLabel(option: LocaleOption, lang?: string) {
  return text(option.label) || translate(lang, option.code) || option.code;
}

function normalizeFlagCountry(input: unknown) {
  const country = text(input).replace(/_/g, "-").toUpperCase();
  return country && hasFlag(country) ? country : "";
}

function localeRegionCountry(code: string) {
  return code
  .replace(/_/g, "-")
  .split("-")
  .slice(1)
  .find((part) => /^[a-z]{2}$/iu.test(part) || /^\d{3}$/u.test(part));
}

function localeFlagCountry(option: LocaleOption) {
  if (option.flagCountry === false) return "";
  const explicitCountry = normalizeFlagCountry(option.flagCountry);
  if (explicitCountry) return explicitCountry;

  const code = text(option.code);
  const regionCountry = normalizeFlagCountry(localeRegionCountry(code));
  if (regionCountry) return regionCountry;

  const language = code.replace(/_/g, "-").split("-")[0]?.toLowerCase() || "";
  return normalizeFlagCountry(LANGUAGE_FLAG_COUNTRIES[language]);
}

function localeOptionIcon(option: LocaleOption) {
  if (option.icon) return option.icon;
  const flagCountry = localeFlagCountry(option);
  if (flagCountry) {
    return (
      <span
      aria-hidden="true"
      className={`${frontendClassName("locale-flag")} flag:${flagCountry}`}
      {...frontendDataAttrs({ "locale-flag": flagCountry })}
      title={text(option.flagLabel)}
      />
    );
  }
  return (
    <span className={frontendClassName("locale-code")} aria-hidden="true">
    {text(option.shortLabel, option.code).slice(0, 3).toUpperCase()}
    </span>
  );
}

function localeTrigger(triggerId: string, popoverId: string, props: LocaleSwitcherProps) {
  const current = normalizedLang(props.lang);
  return button({
      type: "button",
      className: props.className,
      icon: true,
      tooltip: true,
      id: triggerId,
      "aria-controls": popoverId,
      "aria-haspopup": "menu",
      "aria-expanded": "false",
      "aria-label": translate(current, "label"),
      [frontendDataAttr("popover-trigger")]: "",
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
    className={`popover-close popover-item ${frontendClassName("locale-option")}`}
    {...frontendDataAttrs({ "locale-current": isCurrent ? "true" : "false" })}
    {...frontendDataAttrs({ "locale-endpoint": text(props.endpoint, "/ui/lang/set") })}
    {...frontendDataAttrs({ "locale-option": "" })}
    {...frontendDataAttrs({ "popover-close": "" })}
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
    className={`popover popover-portaled ${frontendClassName("locale-switch-popover")}`}
    id={popoverId}
    aria-hidden="true"
    {...frontendDataAttrs({ "popover": "" })}
    inert={true}
    role="menu"
    >
    {locales.map((entry) => localeOptionButton(entry, current, props))}
    </div>
  );
}

function locale_switcher(props: LocaleSwitcherProps = {}) {
  const triggerId = text(props.id, `${FRONTEND_PREFIX}_locale_switch_btn`);
  const popoverId = `${triggerId}_menu`;
  return (
    <>
    {localeTrigger(triggerId, popoverId, props)}
    {localePopover(popoverId, props)}
    </>
  );
}

const LocaleSwitcher = locale_switcher;

export {
  DEFAULT_LOCALES,
  LANGUAGE_FLAG_COUNTRIES,
  LocaleSwitcher,
  localeFlagCountry,
  locale_switcher,
};
export type { LocaleOption, LocaleSwitcherProps };
