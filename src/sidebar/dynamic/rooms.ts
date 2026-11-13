type SidebarRoomAddress = {
  channel: string;
  room: string;
};

function sidebarRoom(channel: unknown, room: unknown) {
  const namespace = String(channel == null ? "" : channel).trim();
  const key = String(room == null ? "" : room).trim();
  return namespace.startsWith("/") && key && !namespace.includes(" ") ? `${namespace} ${key}` : "";
}

function readSidebarRoom(address: unknown): SidebarRoomAddress | null {
  const value = String(address == null ? "" : address).trim();
  const separator = value.indexOf(" ");
  if (separator <= 1) return null;
  const channel = value.slice(0, separator);
  const room = value.slice(separator + 1).trim();
  return channel.startsWith("/") && room ? { channel, room } : null;
}

export { readSidebarRoom, sidebarRoom };
export type { SidebarRoomAddress };
