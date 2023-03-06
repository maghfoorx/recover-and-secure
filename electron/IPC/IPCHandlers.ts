import { ipcMain } from "electron";
import {
  getLostItemsReported,
  postLostItem,
} from "../models/databaseFunctions";
import { PostLostItemType } from "../preload";

// function that exports all the IPCActions
export const registerIPCHandlers = () => {
  ipcMain.handle("get-version", async (event, args) => {
    return 1;
  });
  ipcMain.handle("GET_LOST_ITEMS", async (event, args) => {
    const data = await getLostItemsReported();
    return data;
  });
  ipcMain.handle("POST_LOST_ITEM", async (event, args: PostLostItemType) => {
    const response = await postLostItem(args);
    return response;
  });
};
