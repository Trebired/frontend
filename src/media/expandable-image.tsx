import { useId } from "react";
import type { CSSProperties } from "react";

import { Icon } from "#lbkpzw8nphru";
import { FRONTEND_PREFIX, frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { ICON_MEDIA_CHEVRON_LEFT, ICON_MEDIA_CHEVRON_RIGHT, ICON_MEDIA_CLOSE, ICON_MEDIA_MAXIMIZE } from "./icons.js";
import { useResolvedLang } from "./lang.js";

type ExpandableImageProps = {
  alt: string;
  className?: string;
  imageClassName?: string;
  images?: readonly string[];
  index?: number;
  lang?: string;
  ratio?: string;
  src: string;
};

function galleryAlt(alt: string, length: number, index: number): string {
  return length > 1 ? `${alt} ${index + 1}` : alt;
}

function LightboxNav({ direction, label }: { direction: "next" | "prev"; label: string }) {
  return (
    <button
    aria-label={label}
    className={`${frontendClassName("lightbox-nav")} ${frontendClassName(`lightbox-nav-${direction}`)}`}
    type="button"
    {...frontendDataAttrs({ "lightbox-step": direction })}
    >
    <Icon spec={direction === "prev" ? ICON_MEDIA_CHEVRON_LEFT : ICON_MEDIA_CHEVRON_RIGHT} />
    </button>
  );
}

function LightboxTemplate({ lang }: { lang: string }) {
  const titleId = `${useId().replace(/:/gu, "")}_lightbox_title`;
  const label = (key: string) => sourceLanguageMessage(key, lang);
  return (
    <template {...frontendDataAttrs({ "lightbox-template": "" })}>
    <div aria-labelledby={titleId} aria-modal="true" className={frontendClassName("lightbox")} role="dialog" tabIndex={-1}>
    <button
    aria-label={label("mediaClose")}
    className={frontendClassName("lightbox-close")}
    type="button"
    {...frontendDataAttrs({ "lightbox-close": "" })}
    >
    <Icon spec={ICON_MEDIA_CLOSE} />
    </button>
    <LightboxNav direction="prev" label={label("mediaPrevious")} />
    <LightboxNav direction="next" label={label("mediaNext")} />
    <div className={frontendClassName("lightbox-viewer")}>
    <h2 className={frontendClassName("sr-only")} id={titleId} />
    <img alt="" className={frontendClassName("lightbox-img")} />
    <p className={frontendClassName("lightbox-caption")} />
    </div>
    </div>
    </template>
  );
}

function ExpandableImage(props: ExpandableImageProps) {
  const gallery = props.images?.length ? [...props.images] : [props.src];
  const start = Math.min(Math.max(props.index ?? 0, 0), gallery.length - 1);
  const lang = useResolvedLang(props.lang);
  const thumbnailAlt = galleryAlt(props.alt, gallery.length, start);
  const ratioStyle = props.ratio
  ? { [`--${FRONTEND_PREFIX}-media-expandable-image-ratio`]: props.ratio } as CSSProperties
  : undefined;
  return (
    <>
    <button
    aria-label={sourceLanguageMessage("mediaExpand", lang, { alt: thumbnailAlt })}
    className={[frontendClassName("expandable-image"), props.className].filter(Boolean).join(" ")}
    style={ratioStyle}
    type="button"
    {...frontendDataAttrs({
          "expandable-alt": props.alt,
          "expandable-gallery": JSON.stringify(gallery),
          "expandable-image": String(start),
    })}
    >
    <img
    alt={thumbnailAlt}
    className={[frontendClassName("expandable-image-img"), props.imageClassName].filter(Boolean).join(" ")}
    loading="lazy"
    src={props.src}
    />
    <span className={frontendClassName("expandable-image-icon")}>
    <Icon spec={ICON_MEDIA_MAXIMIZE} />
    </span>
    </button>
    <LightboxTemplate lang={lang} />
    </>
  );
}

export { ExpandableImage };
export type { ExpandableImageProps };
