import { BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import { IPC_ACTIONS } from "./IPCActions";
import { getNames } from "../models/testmgr";

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
  },
  {
    event: "GET_NAMES",
    callback: getNames,
  },
];

// function that exports all the IPCActions
export const registerIPCHandlers = () => {
  ipcHandlers.forEach((handler: { event: string; callback: any }) => {
    ipcMain.on(handler.event, handler.callback);
  });
};
