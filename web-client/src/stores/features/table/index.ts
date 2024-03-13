import { RootState } from "@/stores";
import { createSelector } from "@reduxjs/toolkit";

export { setTableState } from "./store";

export const getTableState = (state: RootState) => (state as any).table.state;

export const getTableStateByTable = createSelector(
  [getTableState],
  (tables) => tables["table"] || {}
);
