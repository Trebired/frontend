type BuildDataAsset = {
  contents: string | Uint8Array;
  path: string;
};

type BuildDataContext = {
  cached?: unknown;
  dir?: string;
  name?: string;
};

type BuildDataResult<TValue> = {
  assets?: BuildDataAsset[];
  detail?: string;
  value: TValue;
};

type BuildDataSource<TValue> = {
  fetch: (context: BuildDataContext) => Promise<BuildDataResult<TValue>>;
};

export type { BuildDataAsset, BuildDataContext, BuildDataResult, BuildDataSource };
