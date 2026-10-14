import { frontendClassName, frontendClassNames, frontendDataAttrs } from "#5vbaqj4pirp3";
import { icon } from "#dqy2d22qyujv";

type FieldIds = { description: string; error: string; help: string; input: string };

function fieldIds(id: string): FieldIds {
  return { description: `${id}-help`, error: `${id}-error`, help: `${id}-help`, input: id };
}

function describedBy(ids: FieldIds, hasHelp: boolean): string | undefined {
  const parts = [hasHelp ? ids.help : "", ids.error].filter(Boolean);
  return parts.length ? parts.join(" ") : undefined;
}

function fieldHelp(ids: FieldIds, help: string) {
  if (!help) return null;
  return (
    <span className={frontendClassName("field-help")} id={ids.help}>
    {help}
    </span>
  );
}

function fieldError(ids: FieldIds) {
  return (
    <span
    className={frontendClassName("field-error")}
    id={ids.error}
    role="alert"
    {...frontendDataAttrs({ "status-message": "" })}
    hidden
    />
  );
}

function statusIcons() {
  return (
    <>
    <span className={frontendClassNames("input-status-icon", "ok")} {...frontendDataAttrs({ "status-icon": "" })} hidden>
    {icon({ spec: "remixicon checkbox-circle-line" })}
    </span>
    <span className={frontendClassNames("input-status-icon", "bad")} {...frontendDataAttrs({ "status-icon": "" })} hidden>
    {icon({ spec: "remixicon close-circle-line" })}
    </span>
    </>
  );
}

export { describedBy, fieldError, fieldHelp, fieldIds, statusIcons };
export type { FieldIds };
