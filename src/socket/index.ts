import {
  Manager,
  Socket,
  connect,
  io as socketIo,
} from "socket.io-client";

type SocketIoFactory = typeof socketIo & {
  Manager: typeof Manager;
  Socket: typeof Socket;
  connect: typeof connect;
  io: typeof socketIo;
};

function withSocketTransportOptions(input: Record<string, unknown> = {}) {
  const options = input && typeof input === "object" ? { ...input } : {};
  if (Array.isArray(options.transports) && options.transports.length) {
    return options;
  }
  return {
    ...options,
    transports: ["polling", "websocket"],
  };
}

function io(uri?: string, options?: Record<string, unknown>) {
  return socketIo(uri, withSocketTransportOptions(options || {}));
}

function socketConnect(uri?: string, options?: Record<string, unknown>) {
  return connect(uri, withSocketTransportOptions(options || {}));
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
  withSocketTransportOptions,
};
export type { SocketIoFactory };
