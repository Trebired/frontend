import type { ReactNode } from "react";

import { classNames } from "#ndsvdqv80epr";
import { errorMessageKey } from "./paths.js";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { sourceLanguageMessage } from "#2d8f076g07hg";

type ErrorPageProps = {
  actions?: ReactNode;
  className?: string;
  lang?: string;
  lead?: ReactNode;
  showStatus?: boolean;
  status?: number;
  title?: ReactNode;
};

function ErrorPage(props: ErrorPageProps) {
  const status = props.status ?? 404;
  const title = props.title ?? sourceLanguageMessage(errorMessageKey("errorTitle", status), props.lang);
  const lead = props.lead ?? sourceLanguageMessage(errorMessageKey("errorLead", status), props.lang);

  return (
    <section
    className={classNames(frontendClassName("error-page"), props.className)}
    {...frontendDataAttrs({ "error-status": String(status) })}
    >
    <div className={frontendElementClass("error-page", "body")}>
    {props.showStatus === false ? null : (
        <p className={frontendElementClass("error-page", "status")}>{status}</p>
    )}
    <h1 className={frontendElementClass("error-page", "title")}>{title}</h1>
    <p className={frontendElementClass("error-page", "lead")}>{lead}</p>
    {props.actions ? (
        <div className={frontendElementClass("error-page", "actions")}>{props.actions}</div>
    ) : null}
    </div>
    </section>
  );
}

export { ErrorPage };
export type { ErrorPageProps };
