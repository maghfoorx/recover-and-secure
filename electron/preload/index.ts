import { contextBridge, ipcRenderer } from "electron";
import { PostFoundItem, PostLostItemType, ReturnFormType } from "../database-functions/lost-property/lostPropertyTypes";
import { AddAmaanatItemType, AmaanatUserType, ReturnAmaanatType } from "../database-functions/amaanat/amaanatTypes";

function domReady(
  condition: DocumentReadyState[] = ["complete", "interactive"]
) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  },
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`;
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");

  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};

setTimeout(removeLoading, 4999);

// setting up contextbridge
contextBridge.exposeInMainWorld("ipcAPI", {
  getLostItemsReported: () => ipcRenderer.invoke("GET_LOST_ITEMS"),
  getFoundItemsReported: () => ipcRenderer.invoke("GET_FOUND_ITEMS"),
  getVersion: () => ipcRenderer.invoke("get-version"),
  postLostItem: (data: PostLostItemType) => ipcRenderer.invoke("POST_LOST_ITEM", data),
  postFoundItem: (data: PostFoundItem) => ipcRenderer.invoke("POST_FOUND_ITEM", data),
  deleteLostItem: (ID: number) => ipcRenderer.invoke("DELETE_LOST_ITEM", ID),
  deleteFoundItem: (ID: number) => ipcRenderer.invoke("DELETE_FOUND_ITEM", ID),
  foundLostItem: (ID: number) => ipcRenderer.invoke("FOUND_LOST_ITEM", ID),
  unFoundLostItem: (ID: number) => ipcRenderer.invoke("UNFOUND_LOST_ITEM", ID),
  returnFoundItem: (returnData: ReturnFormType) => ipcRenderer.invoke("RETURN_FOUND_ITEM", returnData),
  getAmaanatUsers: () => ipcRenderer.invoke("GET_AMAANAT_USERS"),
  addAmaanatUser: (data: AmaanatUserType) => ipcRenderer.invoke("REGISTER_AMAANAT_USER", data),
  getUserAmaanatItems: (ID: string) => ipcRenderer.invoke("GET_USER_AMAANAT_ITEMS", ID),
  getAmaanatUser: (ID: string) => ipcRenderer.invoke("GET_AMAANAT_USER", ID),
  addAmaanatItem: (data: AddAmaanatItemType) => ipcRenderer.invoke("ADD_AMAANAT_ITEM", data),
  returnAmaanatItem: (data: ReturnAmaanatType) => ipcRenderer.invoke("RETURN_AMAANAT_ITEM", data),
  printAmaanatReceipt: () => ipcRenderer.invoke("PRINT_AMAANAT_RECEIPT"),
});
