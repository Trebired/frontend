const ERROR_STATUSES = [403, 404, 410, 500, 503] as const;

type ErrorStatus = (typeof ERROR_STATUSES)[number];

function isErrorStatus(status: number): status is ErrorStatus {
  return (ERROR_STATUSES as readonly number[]).includes(status);
}

function errorMessageKey(prefix: string, status: number): string {
  return isErrorStatus(status) ? `${prefix}${status}` : `${prefix}Default`;
}

function errorRoutePath(status: number): string {
  return `/${status}`;
}

function errorShellFileName(status: number): string {
  return `${status}.html`;
}

function isErrorRoutePath(path: string): boolean {
  const route = String(path || "").split("?")[0].replace(/\/+$/u, "") || "/";
  return ERROR_STATUSES.some((status) => errorRoutePath(status) === route);
}

export {
  ERROR_STATUSES,
  errorMessageKey,
  errorRoutePath,
  errorShellFileName,
  isErrorRoutePath,
  isErrorStatus,
};
export type { ErrorStatus };
