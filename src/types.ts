import {GraphQLClient, RawRequestOptions, Variables} from "graphql-request";
import {GraphQLError} from "graphql-request/dist/types";
import {Headers, RequestInit} from "graphql-request/dist/types.dom";
import {GQLApi, Store} from "./store";

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type ReqOptions<V = Variables> = Omit<RawRequestOptions<V>, "query">;

export type RawResult<T = any> = {
  data: T;
  extensions?: any;
  headers: Headers;
  status: number;
};

export type ApiOptions<V, T> = {
  reqOpts?: ReqOptions<V>;
  onSuccess?: (value: T) => any;
  onError?: (errors: GraphQLError[]) => any;
};

export type GraphQLClientOptions = {
  url: string;
  opts?: RequestInit;
};

export type StoreOptions<BM extends BuilderMap> = {
  client: GraphQLClientOptions;
  builders: BM[];
};

export type Fetcher<T = any> = () => Promise<T>;

export type Builder<V = Variables, T = any> = (
  client: GraphQLClient
) => GQLApi<V, T>;

export type ApiFromBuilder<B extends Builder> = ReturnType<B>;

export type BuilderMap = {
  [key: string]: Builder<any>;
};

export type BuilderMapX<BM> = BM extends BuilderMap
  ? {
      [K in keyof BM]: BM[K];
    }
  : never;

export type ApiMap<BM = any> = BM extends BuilderMap
  ? {
      [K in keyof BM]: ApiFromBuilder<BM[K]>;
    }
  : never;

export type ApiMapX<BM> = BM extends BuilderMap
  ? {
      [K in keyof BuilderMapX<BM>]: ApiFromBuilder<BuilderMapX<BM>[K]>;
    }
  : never;

export type ApiMapFromStore<S extends Store<any, any>> = S extends Store<
  any,
  infer I
>
  ? ApiMapX<I>
  : never;
