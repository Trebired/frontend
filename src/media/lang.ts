import { useContext } from "react";

import { LocaleContext } from "#y0akvvg7irrc";

function useResolvedLang(lang?: string): string | undefined {
  const contextLang = useContext(LocaleContext);
  return lang || contextLang || undefined;
}

export { useResolvedLang };
