import React from "react";
import {StoreContext} from "./context";
import {Store} from "./store";

export const Provider: React.FC<{value: Store}> = (props) => {
  return (
    <StoreContext.Provider value={props.value}>
      {props.children}
    </StoreContext.Provider>
  );
};
