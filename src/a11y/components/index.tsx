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

  return (
    <>
    <button
    aria-controls={panelId}
    aria-expanded="false"
    aria-label={label}
    className={primitiveButtonClassName({
          className: frontendClassName("a11y-trigger"),
          icon: true,
          variant: "chrome",
    })}
    id={triggerId}
    type="button"
    {...frontendDataAttrs({ "popover-indicator": "false", "popover-trigger": "", "tooltip": label })}
    >
    <Icon spec="remixicon:wheelchair-line" />
    </button>
    <div
    aria-hidden="true"
    aria-label={localT("a11yPanelLabel")}
    className={frontendClassNames("popover", "a11y-panel")}
    id={panelId}
    inert
    role="group"
    {...frontendDataAttrs({ "a11y-panel": "", "popover": "", "popover-autofocus": "true" })}
    >
    {a11ySections({ lang: props.lang, settings: props.settings, textSizes: props.textSizes })}
    </div>
    </>
  );
}

const AccessibilityMenu = accessibility_menu;

export { AccessibilityMenu, accessibility_menu };
export type { AccessibilityMenuProps };
