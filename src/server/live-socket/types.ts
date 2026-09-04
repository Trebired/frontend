import type { ServerRequestLike, ServerResponseLike } from "#hf241ii8z71i";
import type { SidebarLiveDescriptor } from "#7spp0gelxmvi";
import type { FrontendServerLoggerInput } from "#jug9z8qra4yv";

type LiveSocketLike = {
  emit?: (event: string, payload?: unknown) => unknown;
  handshake?: Record<string, unknown>;
  join?: (room: string) => unknown;
  leave?: (room: string) => unknown;
  login_session?: unknown;
  on?: (event: string, handler: (...args: any[]) => unknown) => unknown;
  viewer?: unknown;
};

type LiveSocketNamespaceLike = {
  on?: (event: string, handler: (socket: LiveSocketLike) => unknown) => unknown;
  to?: (room: string) => { emit?: (event: string, payload?: unknown) => unknown };
  use?: (middleware: unknown) => unknown;
};

type LiveSocketServerLike =
LiveSocketNamespaceLike& {
  of?: (namespace: string) => LiveSocketNamespaceLike;
};

type LiveRoom = {
  id: string;
  kind: string;
  room: string;
};

type LiveSocketSidebarSyncContext = {
  items: SidebarLiveDescriptor[];
  payload: unknown;
  req: ServerRequestLike;
  res: ServerResponseLike;
  socket: LiveSocketLike;
};

type LiveSocketSidebarSyncOptions = {
  event?: string;
  readItems?: (payload: unknown) => SidebarLiveDescriptor[];
  resolve: (
    context: LiveSocketSidebarSyncContext,
  ) => unknown | Promise<unknown>;
  responseEvent?: string;
  withContext?: (
    context: LiveSocketSidebarSyncContext,
    run: () => Promise<unknown>,
  ) => Promise<unknown>;
};

type LiveSocketServerOptions = {
  authenticate?: unknown | readonly unknown[];
  changeEvent?: string;
  deniedEvent?: string;
  logger?: FrontendServerLoggerInput;
  namespace?: string;
  sidebarSync?: false | LiveSocketSidebarSyncOptions;
  subscribedEvent?: string;
  subscribeEvent?: string;
  unsubscribeEvent?: string;
};

type LiveResourcePayloadResolver<TInput=unknown, TData=unknown> = (
  input: TInput,
) => TData | null | undefined | Promise<TData|null|undefined>;

type LiveResourceDefinition<TInput=unknown, TData=unknown> = {
  authorize?: (socket: LiveSocketLike, id: string) => unknown;
  event: unknown;
  id?: unknown;
  kind: unknown;
  payload?: LiveResourcePayloadResolver<TInput, TData>;
};

type LiveResourceSubscribe<TInput=unknown> = (
  emit: (input?: TInput) => void,
) => unknown;

type LiveSocketResource<TInput=unknown> = {
  bind: (
    key: unknown,
    subscribe: LiveResourceSubscribe<TInput>,
  ) => () => void;
  broadcast: (input?: TInput) => Promise<boolean>;
  register: () => boolean;
  room: (id?: unknown) => string;
};

type LiveSocketServer = {
  attach: (server: LiveSocketServerLike) => boolean;
  broadcast: (room: unknown, event: unknown, data: unknown) => boolean;
  defineResource: <TInput = unknown, TData = unknown > (
    definition: LiveResourceDefinition<TInput, TData>,
  ) => LiveSocketResource<TInput>;
  namespace: () => LiveSocketNamespaceLike | null;
  registerRoomAuthorizer: (
    kind: unknown,
    authorize: (socket: LiveSocketLike, id: string) => unknown,
  ) => boolean;
};

export type {
  LiveResourceDefinition,
  LiveResourcePayloadResolver,
  LiveResourceSubscribe,
  LiveRoom,
  LiveSocketLike,
  LiveSocketNamespaceLike,
  LiveSocketResource,
  LiveSocketServer,
  LiveSocketServerLike,
  LiveSocketServerOptions,
  LiveSocketSidebarSyncContext,
  LiveSocketSidebarSyncOptions,
};
