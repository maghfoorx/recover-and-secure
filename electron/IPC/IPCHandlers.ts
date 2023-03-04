import { BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import { IPC_ACTIONS } from "./IPCActions";
import { getAllData } from "../models/databaseFunctions";

const { SET_WINDOW_TITLE } = IPC_ACTIONS.Window;

const { GET_ALL_DATA } = IPC_ACTIONS.Database;

const handleSetWindowTitle = (event: IpcMainEvent, title: string) => {
  const webContents = event?.sender;
  const window = BrowserWindow.fromWebContents(webContents);

  window.setTitle(title);
};

const handleGettingData = (event: IpcMainEvent) => {
  const data = getAllData();
  console.log("handleGetting data ran and the result is:", data);
  event.reply(data);
};

const ipcHandlers = [
  {
    event: SET_WINDOW_TITLE,
    callback: handleSetWindowTitle,
  },
  {
    event: GET_ALL_DATA,
    callback: handleGettingData,
  },
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
