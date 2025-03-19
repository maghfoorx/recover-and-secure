export const {
  getLostItemsReported,
  getFoundItemsReported,
  getVersion,
  postLostItem,
  postFoundItem,
  deleteLostItem,
  deleteFoundItem,
  foundLostItem,
  unFoundLostItem,
  returnFoundItem,
  matchLostItemWithFoundItem,
} = window?.ipcApi ?? {};
