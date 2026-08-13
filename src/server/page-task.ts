import { toText } from "#ndsvdqv80epr";

type PageTaskFailure = {
  details: string;
  ok: false;
  status: number;
  status_code: string;
};

type PageTaskFailureContext = {
  entityId: string;
  message: string;
  operation: string;
  page: string;
  status: number;
  statusCode: string;
  timeoutMs: number;
};

type PageTaskOptions<TFailure=PageTaskFailure> = {
  entityId?: unknown;
  fail?: (context: PageTaskFailureContext) => TFailure;
  failureMessage?: (context: {
      operation: string;
      status: number;
      statusCode: string;
  }) => string;
  logger?: {
    error?: (scope: string, message: string, metadata?: Record<string, unknown>) => unknown;
    warn?: (scope: string, message: string, metadata?: Record<string, unknown>) => unknown;
  };
  operation: unknown;
  page: unknown;
  timeoutMs?: unknown;
};

const DEFAULT_PAGE_TASK_TIMEOUT_MS = 15000;

function pageTaskTimeoutMs(input: unknown) {
  const parsed = Number(input);
  return Math.max(1, Number.isFinite(parsed) ? Math.floor(parsed) : DEFAULT_PAGE_TASK_TIMEOUT_MS);
}

function pageTaskErrorStatus(error: unknown) {
  const status =
  error && typeof error === "object" && "status"in error
  ? Number((error as any).status)
  : 0;
  return Number.isFinite(status) && status > 0 ? status : 500;
}

function pageTaskErrorCode(error: unknown, status: number) {
  return (
    toText(
      error && typeof error === "object" && "status_code"in error
      ? (error as any).status_code
      : "",
    ) || (status === 504 ? "page-route-timeout" : "page-route-load-failed")
  );
}

function defaultFailureMessage(status: number, operation: string) {
  return status === 504
  ? `Timed out while loading ${operation}.`
  : `Failed to load ${operation}.`;
}

function pageTaskErrorMessage(
  error: unknown,
  context: Pick<PageTaskFailureContext, "operation"|"status"|"statusCode">,
  options: PageTaskOptions<unknown>,
) {
  return (
    toText(
      error && typeof error === "object" && "message"in error
      ? (error as any).message
      : "",
    ) ||
      options.failureMessage?.(context) ||
      defaultFailureMessage(context.status, context.operation)
  );
}

function pageTaskFailure<TFailure>(
  context: PageTaskFailureContext,
  options: PageTaskOptions<TFailure>,
) {
  if (options.fail) return options.fail(context);
  return {
    details: context.message,
    ok: false,
    status: context.status,
    status_code: context.statusCode,
  } satisfies PageTaskFailure;
}

function logPageTaskFailure(
  context: PageTaskFailureContext,
  options: PageTaskOptions<unknown>,
) {
  const level = context.status >= 500 && context.status !== 504 ? "error" : "warn";
  options.logger?.[level]?.("page", "page task failed", {
      entity_id: context.entityId,
      message: context.message,
      operation: context.operation,
      page: context.page,
      status: context.status,
      status_code: context.statusCode,
      timeout_ms: context.timeoutMs,
  });
}

function createPageTaskTimeout(operation: string) {
  const error: any = new Error(defaultFailureMessage(504, operation));
  error.status = 504;
  error.status_code = "page-route-timeout";
  return error;
}

async function runPageTask<T, TFailure=PageTaskFailure>(
  task: () => Promise<T>,
  options: PageTaskOptions<TFailure>,
): Promise<T|TFailure> {
  const operation = toText(options.operation, "page task");
  const timeoutMs = pageTaskTimeoutMs(options.timeoutMs);
  let timer: ReturnType<typeof setTimeout>|null = null;
  try {
    return await Promise.race([
        Promise.resolve().then(task),
        new Promise<never>((_, reject) => {
            timer = setTimeout(
              () => reject(createPageTaskTimeout(operation)),
              timeoutMs,
            );
        }),
    ]);
  } catch (error) {
    const status = pageTaskErrorStatus(error);
    const statusCode = pageTaskErrorCode(error, status);
    const context = {
      entityId: toText(options.entityId),
      message: pageTaskErrorMessage(
        error,
        { operation, status, statusCode },
        options,
      ),
      operation,
      page: toText(options.page, "unknown"),
      status,
      statusCode,
      timeoutMs,
    };
    logPageTaskFailure(context, options);
    return pageTaskFailure(context, options) as TFailure;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export { DEFAULT_PAGE_TASK_TIMEOUT_MS, runPageTask };
export type { PageTaskFailure, PageTaskFailureContext, PageTaskOptions };
