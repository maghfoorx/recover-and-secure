import { contextBridge, ipcRenderer } from "electron";
import {
  AddAmaanatItemType,
  AmaanatUserType,
  PostFoundItem,
  PostLostItemType,
  ReturnAmaanatType,
  ReturnFormType,
} from "../modules/types";

const ipcApiToMainWorld = {
  getLostItemsReported: () => ipcRenderer.invoke("GET_LOST_ITEMS"),
  getFoundItemsReported: () => ipcRenderer.invoke("GET_FOUND_ITEMS"),
  getVersion: () => ipcRenderer.invoke("get-version"),
  postLostItem: (data: PostLostItemType) =>
    ipcRenderer.invoke("POST_LOST_ITEM", data),
  postFoundItem: (data: PostFoundItem) =>
    ipcRenderer.invoke("POST_FOUND_ITEM", data),
  deleteLostItem: (ID: number) => ipcRenderer.invoke("DELETE_LOST_ITEM", ID),
  deleteFoundItem: (ID: number) => ipcRenderer.invoke("DELETE_FOUND_ITEM", ID),
  foundLostItem: (ID: number) => ipcRenderer.invoke("FOUND_LOST_ITEM", ID),
  unFoundLostItem: (ID: number) => ipcRenderer.invoke("UNFOUND_LOST_ITEM", ID),
  returnFoundItem: (returnData: ReturnFormType) =>
    ipcRenderer.invoke("RETURN_FOUND_ITEM", returnData),
  getAmaanatUsers: () => ipcRenderer.invoke("GET_AMAANAT_USERS"),
  addAmaanatUser: (data: AmaanatUserType) =>
    ipcRenderer.invoke("REGISTER_AMAANAT_USER", data),
  getUserAmaanatItems: (ID: string) =>
    ipcRenderer.invoke("GET_USER_AMAANAT_ITEMS", ID),
  getAmaanatUser: (ID: string) => ipcRenderer.invoke("GET_AMAANAT_USER", ID),
  addAmaanatItem: (data: AddAmaanatItemType) =>
    ipcRenderer.invoke("ADD_AMAANAT_ITEM", data),
  returnAmaanatItem: (data: ReturnAmaanatType) =>
    ipcRenderer.invoke("RETURN_AMAANAT_ITEM", data),
  printAmaanatReceipt: (data: any) =>
    ipcRenderer.invoke("PRINT_AMAANAT_RECEIPT", data),
  getAmaanatItems: () => ipcRenderer.invoke("GET_AMAANAT_ITEMS"),
};

export default ipcApiToMainWorld;
