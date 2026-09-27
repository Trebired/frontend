import { EmbedFrame, type EmbedFrameLabels } from "./embed-frame.js";

type MapEmbedProps = {
  aspectRatio?: string;
  className?: string;
  labels?: EmbedFrameLabels;
  lang?: string;
  src: string;
  timeoutMs?: number;
  title: string;
};

function MapEmbed({ aspectRatio, className, labels, lang, src, timeoutMs, title }: MapEmbedProps) {
  return (
    <EmbedFrame
    allowFullScreen
    aspectRatio={aspectRatio}
    className={className}
    labels={labels}
    lang={lang}
    src={src}
    timeoutMs={timeoutMs}
    title={title}
    />
  );
}

export { MapEmbed };
export type { MapEmbedProps };
