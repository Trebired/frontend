import type { ReactNode } from "react";

import { classNames } from "#ndsvdqv80epr";
import { errorActionLabel, errorMessage } from "./messages.js";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { getFrontendLanguage } from "./../language/config.js";
import { button } from "#6hfutrhvm6x6";
import { LocaleSwitcher } from "./../language/locale.js";

type ErrorPageProps = {
  actions?: ReactNode;
  className?: string;
  homeHref?: string;
  lang?: string;
  lead?: ReactNode;
  showStatus?: boolean;
  status?: number;
  title?: ReactNode;
};

function errorActions(props: ErrorPageProps) {
  if (props.actions !== undefined) return props.actions;
  const label = errorActionLabel(props.lang);
  if (!label) return null;
  return button({ children: label, href: props.homeHref || "/", variant: "primary" });
}

function errorLocaleSwitcher(props: ErrorPageProps) {
  const { locales } = getFrontendLanguage();
  if (locales.length < 2) return null;
  return (
    <div className={frontendElementClass("error-page", "locale")}>
    <LocaleSwitcher lang={props.lang} locales={locales} trigger="locale" />
    </div>
  );
}

function ErrorPage(props: ErrorPageProps) {
  const status = props.status ?? 404;
  const title = props.title ?? errorMessage("title", status, props.lang);
  const lead = props.lead ?? errorMessage("lead", status, props.lang);
  const actions = errorActions(props);

  return (
    <section
    className={classNames(frontendClassName("error-page"), props.className)}
    {...frontendDataAttrs({ "error-status": String(status) })}
    >
    {errorLocaleSwitcher(props)}
    <div className={frontendElementClass("error-page", "body")}>
    {props.showStatus === false ? null : (
        <p className={frontendElementClass("error-page", "status")}>{status}</p>
    )}
    <h1 className={frontendElementClass("error-page", "title")}>{title}</h1>
    <p className={frontendElementClass("error-page", "lead")}>{lead}</p>
    {actions ? (
        <div className={frontendElementClass("error-page", "actions")}>{actions}</div>
      ) : null}
    </div>
    </section>
  );
}

export { ErrorPage };
export type { ErrorPageProps };
