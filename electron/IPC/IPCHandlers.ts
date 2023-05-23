import { ipcMain } from "electron";
import {
  deleteFoundItem,
  deleteLostItem,
  getFoundItemsReported,
  getLostItemsReported,
  postFoundItem,
  postLostItem,
  returnFoundItem,
  updateFoundColumn,
} from "../database-functions/lost-property/databaseFunctions";
import { getAllAmaanatUsers } from "../database-functions/amaanat/databaseFunctions";
import { PostFoundItem, PostLostItemType, ReturnFormType } from "../database-functions/lost-property/lostPropertyTypes";

// function that exports all the IPCActions
export const registerIPCHandlers = () => {
  ipcMain.handle("get-version", async (event, args) => {
    return 1;
  });

  ipcMain.handle("GET_LOST_ITEMS", async (event, args) => {
    const data = await getLostItemsReported();
    return data;
  });

  ipcMain.handle("GET_FOUND_ITEMS", async (event, args) => {
    const data = await getFoundItemsReported();
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

  ipcMain.handle("DELETE_FOUND_ITEM", async (event, args: number) => {
    const response = await deleteFoundItem(args);
    return response;
  });

  ipcMain.handle("FOUND_LOST_ITEM", async (event, args: number) => {
    const response = await updateFoundColumn(args);
    return response;
  });

  ipcMain.handle("RETURN_FOUND_ITEM", async (event, args: ReturnFormType) => {
    const response = await returnFoundItem(args)
    return response
  })

  ipcMain.handle("GET_AMAANAT_USERS", async (event, args) => {
    const response = await getAllAmaanatUsers();
    return response;
  })

};
