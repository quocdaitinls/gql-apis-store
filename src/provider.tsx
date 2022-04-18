import React, {PropsWithChildren} from "react";
import {StoreContext} from "./context";
import {Store} from "./store";

// const x : React.PropsWithChildren = {}

export const StoreProvider: React.FC<PropsWithChildren<{value: Store}>> = (
  props
) => {
  return (
    <StoreContext.Provider value={props.value}>
      {props.children}
    </StoreContext.Provider>
  );
};
