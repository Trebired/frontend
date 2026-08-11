import {
  requestHeader,
  type ServerRequestLike,
} from "#hf241ii8z71i";

type CorsOptions = {
  allowedHeaders?: readonly string[];
  credentials?: boolean;
  exposedHeaders?: readonly string[];
  isAllowedOrigin?: (
    req: ServerRequestLike,
    origin: string,
  ) => boolean | Promise<boolean>;
  methods?: readonly string[];
  optionsSuccessStatus?: number;
};

type CorsDelegateCallback = (
  error: Error | null,
  options: Record<string, unknown>,
) => void;

function defaultCorsOptions(options: CorsOptions = {}) {
  return {
    origin: true,
    credentials: options.credentials !== false,
    exposedHeaders: options.exposedHeaders || ["X-CSRF-Token"],
    allowedHeaders: options.allowedHeaders || [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-CSRF-Token",
    ],
    methods: options.methods || [
      "GET",
      "HEAD",
      "OPTIONS",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
    ],
    optionsSuccessStatus: options.optionsSuccessStatus || 200,
  };
}

function createCorsOptionsDelegate(options: CorsOptions = {}) {
  return function corsOptionsDelegate(
    req: ServerRequestLike,
    callback: CorsDelegateCallback,
  ) {
    Promise.resolve()
    .then(async () => {
        const origin = requestHeader(req, "origin");
        if (!origin || !options.isAllowedOrigin) {
          callback(null, defaultCorsOptions(options));
          return;
        }
        const allowed = await options.isAllowedOrigin(req, origin);
        callback(
          allowed ? null : new Error("Not allowed by CORS"),
          allowed ? defaultCorsOptions(options) : { origin: false },
        );
    })
    .catch((error) => callback(error, { origin: false }));
  };
}

export { createCorsOptionsDelegate, defaultCorsOptions };
export type { CorsDelegateCallback, CorsOptions };
