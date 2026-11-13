import { serverObject, type ServerRequestLike, type ServerResponseLike } from "./../http.js";
import { readSidebarLiveItems } from "./live.js";
import { currentSidebarSource } from "./source.js";

type SidebarSocketLike = {
  handshake?: Record<string, unknown>;
  viewer?: unknown;
  [key: string]: unknown;
};

function socketRequest(socket: SidebarSocketLike): ServerRequestLike {
  const handshake = serverObject(socket && socket.handshake);
  const request = serverObject(handshake.request);
  return Object.assign(Object.create(request ? Object.getPrototypeOf(request) : Object.prototype), request, {
      address: handshake.address || "",
      cookies: serverObject(request.cookies),
      headers: serverObject(handshake.headers || request.headers),
      ip: handshake.address || "",
      viewer: socket && socket.viewer ? socket.viewer : null,
  });
}

function socketResponse(socket: SidebarSocketLike): ServerResponseLike {
  const viewer = socket && socket.viewer ? socket.viewer : null;
  return { locals: { isAuthenticated: Boolean(viewer), viewer } };
}

function createSidebarSyncHandler() {
  return async function handleSidebarSync(socket: SidebarSocketLike, payload: unknown, ack?: (response: unknown) => unknown) {
    const reply = typeof ack === "function" ? ack : () => undefined;
    const source = currentSidebarSource();
    if (!source) return reply({ data: { sidebars: [] }, error: "no-sidebar-source", ok: false });
    try {
      const items = readSidebarLiveItems(payload);
      const sidebars = await source.resolve({ items, req: socketRequest(socket), res: socketResponse(socket) });
      return reply({ data: { sidebars }, ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return reply({ data: { sidebars: [] }, error: message, ok: false });
    }
  };
}

export { createSidebarSyncHandler, socketRequest, socketResponse };
export type { SidebarSocketLike };
