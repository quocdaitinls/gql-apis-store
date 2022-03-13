import {GraphQLClient, RawRequestOptions, Variables} from "graphql-request";
import {GraphQLError} from "graphql-request/dist/types";
import {Headers, RequestInit} from "graphql-request/dist/types.dom";
import {MyApi} from ".";
import {ApisStore} from "./store";

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type ReqOptions<V = Variables> = Omit<RawRequestOptions<V>, "document">;

export type Api<T = any> = () => Promise<T>;

export type RawResult<T = any> = {
  data: T;
  extensions?: any;
  headers: Headers;
  status: number;
};

export type RawApi<T = any> = () => Promise<RawResult<T>>;

export type ApiOptions<V, T> = {
  reqOpts?: ReqOptions<V>;
  onSuccess?: (value: T) => any;
  onError?: (errors: GraphQLError[]) => any;
};

export type MyApiOptions<V, T> = {
  reqOpts?: ReqOptions<V>;
  onSuccess?: (value: T) => any;
  onError?: (errors: GraphQLError[]) => any;
};

export type Builder<V = Variables, T = any> = (
  client: GraphQLClient
) => MyApi<V, T>;

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

export type BuilderMapX<BM> = BM extends BuilderMap
  ? {
      [K in keyof BM]: BM[K];
    }
  : never;

// export type ApiConfigFromBuilder<B extends Builder> = ReturnType<B>;

// export type ApiConfigMap<BM = any> = BM extends BuilderMap
//   ? {
//       [K in keyof BM]: ApiConfigFromBuilder<BM[K]>;
//     }
//   : never;

// export type ApiConfigMapX<BM> = BM extends BuilderMap
//   ? {
//       [K in keyof BuilderMapX<BM>]: ApiConfigFromBuilder<BuilderMapX<BM>[K]>;
//     }
//   : never;

// export type GetApisConfig<A extends ApisStore<any, any>> = A extends ApisStore<
//   any,
//   infer I
// >
//   ? ApiConfigMapX<I>
//   : never;

//
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

export type ApiFromBuilder<B extends Builder> = ReturnType<B>;

export type ApiMapFromStore<AS extends ApisStore<any, any>> =
  AS extends ApisStore<any, infer I> ? ApiMapX<I> : never;
