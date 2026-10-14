import { sourceLanguageMessage } from "./../../language/messages.js";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";
import checkbox from "#2ne919slwy5h";
import radio from "#oohgsil8r9co";
import { EMPTY_A11Y_SETTINGS, TEXT_SIZES } from "./../settings.js";

import type { A11yTextSize, FrontendA11ySettings } from "./../types.js";

type SectionsProps = {
  lang?: string;
  settings?: FrontendA11ySettings;
  textSizes?: A11yTextSize[];
};

function sectionTitle(text: string) {
  return <p className={frontendClassName("a11y-section-title")}>{text}</p>;
}

function motionSection(props: SectionsProps, current: FrontendA11ySettings, localT: (key: string) => string) {
  return (
    <div className={frontendClassName("a11y-section")} {...frontendDataAttrs({ "a11y-field": "motion" })}>
    {sectionTitle(localT("a11yMotionTitle"))}
    {radio({
          currentValue: current.motion,
          name: "a11y_motion",
          options: [
            { title: localT("a11yMotionSystem"), value: "system" },
            { title: localT("a11yMotionReduce"), value: "reduce" },
            { title: localT("a11yMotionFull"), value: "full" },
          ],
    })}
    </div>
  );
}

function textSection(props: SectionsProps, current: FrontendA11ySettings, localT: (key: string) => string) {
  const sizes = props.textSizes && props.textSizes.length > 0 ? props.textSizes : TEXT_SIZES;
  return (
    <div className={frontendClassName("a11y-section")} {...frontendDataAttrs({ "a11y-field": "textSize" })}>
    {sectionTitle(localT("a11yTextSizeTitle"))}
    {radio({
          currentValue: String(current.textSize),
          name: "a11y_text_size",
          options: sizes.map((size) => ({ title: `${size}%`, value: String(size) })),
    })}
    </div>
  );
}

function contrastSection(props: SectionsProps, current: FrontendA11ySettings, localT: (key: string) => string) {
  return (
    <div className={frontendClassName("a11y-section")} {...frontendDataAttrs({ "a11y-field": "contrast" })}>
    {sectionTitle(localT("a11yContrastLabel"))}
    {checkbox({
          checked: current.contrast === "high",
          description: localT("a11yContrastDescription"),
          lang: props.lang,
          name: "a11y_contrast",
          title: localT("a11yContrastTitle"),
          value: "high",
    })}
    </div>
  );
}

function a11ySections(props: SectionsProps) {
  const localT = (key: string) => sourceLanguageMessage(key, props.lang);
  const current = props.settings || EMPTY_A11Y_SETTINGS;
  return (
    <>
    {motionSection(props, current, localT)}
    {textSection(props, current, localT)}
    {contrastSection(props, current, localT)}
    </>
  );
}

export { a11ySections };
