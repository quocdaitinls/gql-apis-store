import {GraphQLClient, RequestOptions, Variables} from "graphql-request";
import {RequestInit} from "graphql-request/dist/types.dom";
import {ApisStore} from "./store";

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type ClientApisRequestOptions<V = Variables> = Omit<
  RequestOptions<V>,
  "document"
>;

export type Api = () => Promise<any>;

export type ApiConfig<V = Variables> = (
  opts?: ClientApisRequestOptions<V>
) => Api;

export type Builder<V = Variables> = (client: GraphQLClient) => ApiConfig<V>;

export type GraphQLClientConfig = {
  url: string;
  opts?: RequestInit;
};

export type ClientApisConfig<B extends BuilderMap> = {
  client: GraphQLClientConfig;
  builders: B[];
};

export type BuilderMap = {
  [key: string]: Builder<any>;
};

export type ApiConfigFromBuilder<B extends Builder> = ReturnType<B>;

export type ApiConfigMap<BM = any> = BM extends BuilderMap
  ? {
      [K in keyof BM]: ApiConfigFromBuilder<BM[K]>;
    }
  : never;

export type BuilderMapX<BM> = BM extends BuilderMap
  ? {
      [K in keyof BM]: BM[K];
    }
  : never;

export type ApiConfigMapX<BM> = BM extends BuilderMap
  ? {
      [K in keyof BuilderMapX<BM>]: ApiConfigFromBuilder<BuilderMapX<BM>[K]>;
    }
  : never;

export type GetApisConfig<A extends ApisStore<any, any>> = A extends ApisStore<
  any,
  infer I
>
  ? ApiConfigMapX<I>
  : never;
