import { createContext, createElement, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { currentLocale, onLocaleChanged, setCurrentLocale } from "#c0ufaze3282x";

type LocaleProviderProps = {
  children?: ReactNode;
  locale?: string;
};

type LocaleState = {
  locale: string;
  setLocale: (locale: string) => boolean;
};

const LocaleContext = createContext<string>("");

function LocaleProvider(props: LocaleProviderProps) {
  const locale = props.locale || currentLocale();
  return createElement(LocaleContext.Provider, { value: locale }, props.children);
}

function useLocale(): LocaleState {
  const provided = useContext(LocaleContext);
  const [locale, setState] = useState<string>(() => provided || currentLocale());

  useEffect(() => {
      if (provided) return undefined;
      return onLocaleChanged(setState);
    }, [provided]);

  return { locale: provided || locale, setLocale: setCurrentLocale };
}

export { LocaleContext, LocaleProvider, useLocale };
export type { LocaleProviderProps, LocaleState };
