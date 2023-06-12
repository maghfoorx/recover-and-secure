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
import { addAmaanatItem, addAmaanatUser, getAllAmaanatUsers, getAmaanatUser, getUserAmaanatItems, returnAmaanatItem } from "../database-functions/amaanat/databaseFunctions";
import { PostFoundItem, PostLostItemType, ReturnFormType } from "../database-functions/lost-property/lostPropertyTypes";
import { AddAmaanatItemType, AmaanatUserType, ReturnAmaanatType } from "../database-functions/amaanat/amaanatTypes";
import { printReceipt } from "../printing-functions/printer";

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

  ipcMain.handle("REGISTER_AMAANAT_USER", async (event, args: AmaanatUserType) => {
    const response = await addAmaanatUser(args)
    return response;
  })

  ipcMain.handle("GET_AMAANAT_USER", async (event, args: string) => {
    const response = await getAmaanatUser(args);
    return response;
  })

  ipcMain.handle("GET_USER_AMAANAT_ITEMS", async (event, args: string) => {
    const response = await getUserAmaanatItems(args)
    return response;
  });

  ipcMain.handle("ADD_AMAANAT_ITEM", async (event, args: AddAmaanatItemType) => {
    const response = await addAmaanatItem(args)
    return response;
  });

  ipcMain.handle("RETURN_AMAANAT_ITEM", async (event, args: ReturnAmaanatType) => {
    const response = await returnAmaanatItem(args);
    return response;
  })

  ipcMain.handle("PRINT_AMAANAT_RECEIPT", async (event, args) => {
    const response = await printReceipt();
    return response;
  })

};
