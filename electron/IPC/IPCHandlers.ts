import { ipcMain } from "electron";
import {
  deleteLostItem,
  getFoundItemsReported,
  getLostItemsReported,
  postFoundItem,
  postLostItem,
  updateFoundColumn,
} from "../models/databaseFunctions";
import { PostFoundItem, PostLostItemType } from "../preload";

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

  ipcMain.handle("POST_FOUND_ITEM", async (event, args: PostFoundItem) => {
    const response = await postFoundItem(args);
    return response;
  })

  ipcMain.handle("DELETE_LOST_ITEM", async (event, args: number) => {
    const response = await deleteLostItem(args);
    return response;
  });

  ipcMain.handle("FOUND_LOST_ITEM", async (event, args: number) => {
    const response = await updateFoundColumn(args);
    return response;
  });

  ipcMain.handle("GET_FOUND_ITEMS", async (event, args) => {
    const data = await getFoundItemsReported();
    return data;
  });
};
