import { sourceLanguageMessage } from "./../../language/messages.js";
import { frontendClassName, frontendClassNames, frontendDataAttrs } from "#5vbaqj4pirp3";
import { Icon } from "#lbkpzw8nphru";
import { primitiveButtonClassName } from "#0rl8rpgzssot";
import { a11ySections } from "./sections.js";

import type { A11yTextSize, FrontendA11ySettings } from "./../types.js";

type AccessibilityMenuProps = {
  className?: string;
  id?: string;
  lang?: string;
  settings?: FrontendA11ySettings;
  textSizes?: A11yTextSize[];
};

function accessibility_menu(props: AccessibilityMenuProps) {
  const localT = (key: string) => sourceLanguageMessage(key, props.lang);
  const triggerId = props.id || "a11y_menu_trigger";
  const panelId = `${triggerId}_panel`;
  const label = localT("a11yTriggerLabel");

  const titleId = `${panelId}_title`;

  return (
    <>
    <button
    aria-controls={panelId}
    aria-haspopup="dialog"
    aria-label={label}
    className={primitiveButtonClassName({
          className: frontendClassName("a11y-trigger"),
          icon: true,
          variant: "chrome",
    })}
    id={triggerId}
    type="button"
    {...frontendDataAttrs({ "modal-open": "", "tooltip": label })}
    >
    <Icon spec="remixicon:wheelchair-line" />
    </button>
    <div
    aria-hidden="true"
    aria-labelledby={titleId}
    className={frontendClassName("modal")}
    id={panelId}
    role="dialog"
    {...frontendDataAttrs({ "modal": "" })}
    >
    <div
    className={frontendClassNames("modal__content", "a11y-panel")}
    {...frontendDataAttrs({ "a11y-panel": "", "modal-content": "" })}
    >
    <h2 className={frontendClassName("a11y-title")} id={titleId}>{localT("a11yPanelLabel")}</h2>
    {a11ySections({ lang: props.lang, settings: props.settings, textSizes: props.textSizes })}
    </div>
    </div>
    </>
  );
}

const AccessibilityMenu = accessibility_menu;

export { AccessibilityMenu, accessibility_menu };
export type { AccessibilityMenuProps };
