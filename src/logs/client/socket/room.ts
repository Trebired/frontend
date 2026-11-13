import { connectChannel } from "@trebired/sockets/client";

type RoomLogsCallbacks = {
  onBootstrap: (data: unknown) => void;
  onConnectError: () => void;
  onDisconnect: () => void;
  onError: () => void;
  onLog: (entry: unknown) => void;
};

type RoomLogsTransport = {
  channel: string;
  close: () => void;
  connected: boolean;
  room: string;
};

function createRoomLogsTransport(channel: string, room: string, callbacks: RoomLogsCallbacks): RoomLogsTransport {
  const client = connectChannel(channel);
  const unsubscribe = client.subscribe(room, (change) => {
      if (change.event === "log") callbacks.onLog(change.data);
  });
  const offDisconnect = client.on("disconnect", () => callbacks.onDisconnect());
  const offError = client.on("connect_error", () => callbacks.onConnectError());
  const transport: RoomLogsTransport = {
    channel,
    close() {
      transport.connected = false;
      unsubscribe();
      offDisconnect();
      offError();
    },
    connected: true,
    room,
  };
  return transport;
}

async function requestRoomLogs(transport: RoomLogsTransport, payload: unknown, callbacks: RoomLogsCallbacks) {
  const reply = await connectChannel(transport.channel).request(transport.room, "bootstrap", payload);
  if (!transport.connected) return;
  if (reply.ok) callbacks.onBootstrap(reply.data);
  else callbacks.onError();
}

export { createRoomLogsTransport, requestRoomLogs };
export type { RoomLogsCallbacks, RoomLogsTransport };
