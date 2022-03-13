import {ClientError, GraphQLClient} from "graphql-request";
import {GraphQLError} from "graphql-request/dist/types";
import {
  Api,
  ApiMap,
  ApiMapX,
  ApiOptions,
  Builder,
  BuilderMap,
  BuilderMapX,
  ClientApisConfig,
  RawResult,
  ReqOptions,
  UnionToIntersection,
} from ".";

export class ApisStore<
  BM extends BuilderMap = BuilderMap,
  IBM extends UnionToIntersection<BM> = UnionToIntersection<BM>
> {
  protected _config: ClientApisConfig<BM>;
  protected _client: GraphQLClient;
  protected _builderMap: BuilderMapX<IBM>;
  protected _apiMap: ApiMapX<IBM>;

  constructor(config: ClientApisConfig<BM>) {
    this._config = config;
    this.initClient();
    this.initBuilderMap();
    this.initApiMap();
  }

  protected initClient() {
    const {url, opts} = this._config.client;
    this._client = new GraphQLClient(url, opts);
  }

  protected initBuilderMap() {
    const {builders} = this._config;
    let result: BuilderMap = {};
    for (let builderMap of builders) {
      result = Object.assign(result, builderMap);
    }
    this._builderMap = result as BuilderMapX<IBM>;
  }

  protected initApiMap() {
    let result: ApiMap = {};
    for (let name in this._builderMap) {
      result[name] = this._builderMap[name](this._client);
    }
    this._apiMap = result as ApiMapX<IBM>;
  }

  get config() {
    return this._config;
  }

  get client() {
    return this._client;
  }

  get apis() {
    return this._apiMap;
  }
}

export class MyApi<TVariables, TData> {
  private defaultOptions: ApiOptions<TVariables, TData> = {
    reqOpts: {},
    onSuccess: (data) => data,
    onError: (err) => err,
  };

  private client: GraphQLClient;
  private query: string;
  private options: ApiOptions<TVariables, TData>;
  private api: Api<TData>;

  rawResult: RawResult<TData>;

  constructor(
    client: GraphQLClient,
    query: string,
    opts?: ApiOptions<TVariables, TData>
  ) {
    this.client = client;
    this.query = query;

    this.configure(opts);
    this.initApi();
  }

  initApi() {
    const {reqOpts, onSuccess, onError} = this.options;
    const {client, query} = this;

    this.api = async () => {
      let errors: GraphQLError[];
      let result: RawResult<TData> = await client
        .rawRequest<TData, TVariables>({query, ...reqOpts})
        .catch((error: ClientError) => {
          errors = error.response.errors;
          return null;
        });

      this.rawResult = result;

      if (result?.data && typeof onSuccess === "function")
        await onSuccess(result.data);
      else if (errors && typeof onError === "function") await onError(errors);

      return result?.data ?? null;
    };
  }

  configure(opts: ApiOptions<TVariables, TData>) {
    this.options = {...this.defaultOptions, ...opts};
    return this;
  }

  setRequestOptions(options: ReqOptions<TVariables>) {
    this.options.reqOpts = options;
    return this;
  }

  setVariables(values: TVariables) {
    this.options.reqOpts.variables = values;
    return this;
  }

  setHeaders(headers: RequestInit["headers"]) {
    this.options.reqOpts.requestHeaders = headers;
    return this;
  }

  setSignal(signal: RequestInit["signal"]) {
    this.options.reqOpts.signal = signal;
    return this;
  }

  exec() {
    return this.api();
  }
}

export const createApiBuilder = <TVariables, TData = any>(
  query: string
): Builder<TVariables, TData> => {
  return (client: GraphQLClient): MyApi<TVariables, TData> =>
    new MyApi(client, query);
};
