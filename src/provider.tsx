import React from "react";
import {ApisContext} from "./context";
import {ApisStore} from "./store";

export const Provider: React.FC<{value: ApisStore}> = (props) => {
  return (
    <ApisContext.Provider value={props.value}>
      {props.children}
    </ApisContext.Provider>
  );
};
