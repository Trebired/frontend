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

function useCurrentLocale(): string {
  const [locale, setLocale] = useState<string>(currentLocale);

  useEffect(() => {
      const stop = onLocaleChanged(setLocale);
      setLocale(currentLocale());
      return stop;
    }, []);

  return locale;
}

function LocaleProvider(props: LocaleProviderProps) {
  const live = useCurrentLocale();
  return createElement(LocaleContext.Provider, { value: props.locale || live }, props.children);
}

function useLocale(): LocaleState {
  const provided = useContext(LocaleContext);
  const live = useCurrentLocale();
  return { locale: provided || live, setLocale: setCurrentLocale };
}

export { LocaleContext, LocaleProvider, useLocale };
export type { LocaleProviderProps, LocaleState };
