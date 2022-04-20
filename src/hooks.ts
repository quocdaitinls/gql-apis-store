import React from "react";
import {StoreContext} from "./context";
import {Store} from "./store";
import {ApiMapFromStore} from "./types";

export const useStore = <S extends Store>(): S =>
  React.useContext(StoreContext) as S;

export const useGQLApis = <S extends Store>(): ApiMapFromStore<S> =>
  useStore().apis as ApiMapFromStore<S>;

export const useGQLQueryClient = () => useStore().client;
