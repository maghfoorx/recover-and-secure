import { ipcMain } from "electron";
import { getAllData } from "../models/databaseFunctions";


// function that exports all the IPCActions
export const registerIPCHandlers = () => {
  ipcMain.handle("get-version", async (event, args) => {
    return 1;
  });
  ipcMain.handle("GET_DATA", async (event, args) => {
    const data = await getAllData();
    return data;
  });
};
