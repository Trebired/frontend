import { toString } from "#21h9o6s9g3d1";

type MediaState = {
  available: boolean;
  id: string;
  image: string;
};

function mediaText(value: unknown) {
  return typeof value === "string" || typeof value === "number"
  ? toString(value)
  : "";
}

function mediaState(value: unknown): MediaState {
  const current =
  value && typeof value === "object" && !Array.isArray(value)
  ? value as Record<string, unknown>
  : null;
  const image = current
  ? toString(
    current.image || current.url || current.avatar_url || current.avatarUrl,
  )
  : mediaText(value);
  const id = toString(current?.id);
  const available = current ? current.available === true : Boolean(image);
  return {
    available,
    id,
    image,
  };
}

function mediaImage(value: unknown) {
  return mediaState(value).image;
}

function mediaAvailable(value: unknown) {
  return mediaState(value).available;
}

export { mediaAvailable, mediaImage, mediaState };
export type { MediaState };
