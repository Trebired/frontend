import type { StatusDotTone } from "#xb7hv37sq5h5";

const SIDEBAR_STATE_TONES: Record<string, StatusDotTone> = {
  clean: "gray",
  failed: "red",
  interrupted: "yellow",
  offline: "red",
  online: "green",
  queued: "yellow",
  replaced: "gray",
  running: "green",
  starting: "yellow",
  stopped: "gray",
  stopping: "yellow",
};

function sidebarStateTone(state: string): StatusDotTone {
  return SIDEBAR_STATE_TONES[state] || "red";
}

export { sidebarStateTone };
