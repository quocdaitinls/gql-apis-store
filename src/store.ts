import {ClientError, GraphQLClient, RequestDocument} from "graphql-request";
import {GraphQLError} from "graphql-request/dist/types";
import {Api, ApiConfig, ApiConfigMap, ApiConfigMapX} from ".";
import {
  ApiOptions,
  Builder,
  BuilderMap,
  BuilderMapX,
  ClientApisConfig,
  ReqOptions,
  UnionToIntersection,
} from "./types";

export class ApisStore<
  BM extends BuilderMap = BuilderMap,
  IBM extends UnionToIntersection<BM> = UnionToIntersection<BM>
> {
  protected _config: ClientApisConfig<BM>;
  protected _client: GraphQLClient;
  protected _builderMap: BuilderMapX<IBM>;
  protected _apiMap: ApiConfigMapX<IBM>;

  constructor(config: ClientApisConfig<BM>) {
    this._config = config;
    this.initClient();
    this.initBuilderMap();
    this.createApis();
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

  protected createApis() {
    let result: ApiConfigMap = {};
    for (let name in this._builderMap) {
      result[name] = this._builderMap[name](this._client);
    }
    this._apiMap = result as ApiConfigMapX<IBM>;
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

export const createApiBuilder = <TVariables, TData = any>(
  document: RequestDocument
): Builder<TVariables, TData> => {
  return (client: GraphQLClient): ApiConfig<TVariables, TData> =>
    (options: ReqOptions<TVariables>): Api<TData> =>
    async (apiOptions?: ApiOptions<TData>) =>
      client
        .request<TData, TVariables>({document, ...options})
        .then((data) => {
          apiOptions?.onSuccess(data);
          return data;
        })
        .catch((error: ClientError) => {
          console.log(error);
          apiOptions?.onError(error.response?.errors);
          return null;
        });
};
