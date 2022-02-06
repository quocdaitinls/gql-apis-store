import React from "react";
import {GetApis} from ".";
import {ApisContext} from "./context";
import {ApisStore} from "./store";

export const useStore = <S extends ApisStore>() =>
  React.useContext(ApisContext) as S;

export const useGQLApis = <S extends ApisStore>() =>
  React.useContext(ApisContext).apis as GetApis<S>;
