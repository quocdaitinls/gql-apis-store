import {GraphQLClient, RequestDocument} from "graphql-request";
import {
  ApiMap,
  ApiMapX,
  Builder,
  BuilderMap,
  BuilderMapX,
  ClientApisConfig,
  ClientApisRequestOptions,
  UnionToIntersection,
} from "./types";

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

export const createApiBuilder = <V>(document: RequestDocument): Builder<V> => {
  return (client: GraphQLClient) => (options: ClientApisRequestOptions<V>) =>
    client.request({document, ...options});
};
