import { ipcMain } from "electron";
import { getLostItemsReported } from "../models/databaseFunctions";

// function that exports all the IPCActions
export const registerIPCHandlers = () => {
  ipcMain.handle("get-version", async (event, args) => {
    return 1;
  });
  ipcMain.handle("GET_LOST_ITEMS", async (event, args) => {
    const data = await getLostItemsReported();
    return data;
  });
};
