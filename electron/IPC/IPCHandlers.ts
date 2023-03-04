import { BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import { IPC_ACTIONS } from "./IPCActions";
import { getAllData } from "../models/databaseFunctions";

const { SET_WINDOW_TITLE } = IPC_ACTIONS.Window;

const handleSetWindowTitle = (event: IpcMainEvent, title: string) => {
  const webContents = event?.sender;
  const window = BrowserWindow.fromWebContents(webContents);

  window.setTitle(title);
};

const ipcHandlers = [
  {
    event: SET_WINDOW_TITLE,
    callback: handleSetWindowTitle,
  }
];

// function that exports all the IPCActions
export const registerIPCHandlers = () => {
  ipcHandlers.forEach((handler: { event: string; callback: any }) => {
    ipcMain.on(handler.event, handler.callback);
  });
  ipcMain.handle("get-version", async (event, args) => {
    return 1;
  });
  ipcMain.handle("GET_DATA", async (event, args) => {
    const data = await getAllData();
    return data;
  });
};
