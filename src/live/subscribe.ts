type LiveSubscribePayload = Record<string, unknown>& {
  data?: unknown;
  event?: string;
  room?: string;
};

type LiveSubscribe = (
  room: string,
  onChange: (payload: LiveSubscribePayload) => void,
) => () => void;

export type { LiveSubscribe, LiveSubscribePayload };
