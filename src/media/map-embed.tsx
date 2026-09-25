import { EmbedFrame, type EmbedFrameLabels } from "./embed-frame.js";

type MapEmbedProps = {
  className?: string;
  labels?: EmbedFrameLabels;
  src: string;
  timeoutMs?: number;
  title: string;
};

function MapEmbed({ className, labels, src, timeoutMs, title }: MapEmbedProps) {
  return (
    <EmbedFrame
    allowFullScreen
    className={className}
    labels={labels}
    src={src}
    timeoutMs={timeoutMs}
    title={title}
    />
  );
}

export { MapEmbed };
export type { MapEmbedProps };
