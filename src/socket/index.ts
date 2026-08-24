import {
  Manager,
  Socket,
  connect,
  io as socketIo,
} from "socket.io-client";

type SocketIoFactory = typeof socketIo& {
  Manager: typeof Manager;
  Socket: typeof Socket;
  connect: typeof connect;
  io: typeof socketIo;
};

function withWebSocketTransportOptions(input: Record<string, unknown> = {}) {
  const options = input && typeof input === "object" ? { ...input } : {};
  return {
    ...options,
    transports: ["websocket"],
  };
}

function io(uri?: string, options?: Record<string, unknown>) {
  return socketIo(uri, withWebSocketTransportOptions(options || {}));
}

function socketConnect(uri?: string, options?: Record<string, unknown>) {
  return connect(uri, withWebSocketTransportOptions(options || {}));
}

const socket = Object.assign(io, socketIo, {
    Manager,
    Socket,
    connect: socketConnect,
    io,
}) as SocketIoFactory;

export {
  Manager,
  Socket,
  socketConnect as connect,
  socket,
  io,
  withWebSocketTransportOptions,
};
export type { SocketIoFactory };
