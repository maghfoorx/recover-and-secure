export const {
  getAmaanatUsers,
  getAmaanatUser,
  addAmaanatUser,
  getUserAmaanatItems,
  addAmaanatItem,
  returnAmaanatItem,
  printAmaanatReceipt,
  getAmaanatItems,
} = window?.ipcApi ?? {};
