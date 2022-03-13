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

  private _client: GraphQLClient;
  private _query: string;
  private _options: ApiOptions<TVariables, TData>;
  private api: Api<TData>;

  rawResult: RawResult<TData> = null;

  constructor(
    client: GraphQLClient,
    query: string,
    opts?: ApiOptions<TVariables, TData>
  ) {
    this._client = client;
    this._query = query;

    this.configure(opts);
  }

  initApi() {
    const {reqOpts, onSuccess, onError} = this._options;
    const {_client, _query} = this;

    this.api = async () => {
      let errors: GraphQLError[];
      let result: RawResult<TData> = await _client
        .rawRequest<TData, TVariables>({query: _query, ...reqOpts})
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
    this._options = {...this.defaultOptions, ...opts};
    this.initApi();
    return this;
  }

  setRequestOptions(options: ReqOptions<TVariables>) {
    this._options.reqOpts = options;
    return this;
  }

  setVariables(values: TVariables) {
    this._options.reqOpts.variables = values;
    return this;
  }

  setHeaders(headers: RequestInit["headers"]) {
    this._options.reqOpts.requestHeaders = headers;
    return this;
  }

  setSignal(signal: RequestInit["signal"]) {
    this._options.reqOpts.signal = signal;
    return this;
  }

  exec() {
    return this.api();
  }

  get options() {
    return this._options;
  }
}

export const createApiBuilder = <TVariables, TData = any>(
  query: string
): Builder<TVariables, TData> => {
  return (client: GraphQLClient): MyApi<TVariables, TData> =>
    new MyApi(client, query);
};
