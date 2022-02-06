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

export type Api<V = Variables> = (
  opts?: ClientApisRequestOptions<V>
) => Promise<any>;

export type Builder<V = Variables> = (client: GraphQLClient) => Api<V>;

export type ClientApisConfig<B extends BuilderMap> = {
  client: {
    url: string;
    opts?: RequestInit;
  };
  builders: B[];
};

export type BuilderMap = {
  [key: string]: Builder<any>;
};

export type ApiFromBuilder<B extends Builder> = ReturnType<B>;

export type ApiMap<BM = any> = BM extends BuilderMap
  ? {
      [K in keyof BM]: ApiFromBuilder<BM[K]>;
    }
  : never;

export type BuilderMapX<BM> = BM extends BuilderMap
  ? {
      [K in keyof BM]: BM[K];
    }
  : never;

export type ApiMapX<BM> = BM extends BuilderMap
  ? {
      [K in keyof BuilderMapX<BM>]: ApiFromBuilder<BuilderMapX<BM>[K]>;
    }
  : never;

export type GetApis<A extends ApisStore<any, any>> = A extends ApisStore<
  any,
  infer I
>
  ? ApiMapX<I>
  : never;
