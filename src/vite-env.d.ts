/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import("electron").IpcRenderer;
  ipcApi: {
    getLostItemsReported;
    getFoundItemsReported;
    getVersion;
    postLostItem;
    postFoundItem;
    deleteLostItem;
    deleteFoundItem;
    foundLostItem;
    unFoundLostItem;
    returnFoundItem;
    returnAmaanatItem;
    printAmaanatReceipt;
    getAmaanatUsers;
    getAmaanatUser;
    addAmaanatUser;
    getUserAmaanatItems;
    addAmaanatItem;
    getAmaanatItems;
    matchLostItemWithFoundItem;
  };
}
