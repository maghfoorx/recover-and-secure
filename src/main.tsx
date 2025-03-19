import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";
import "./index.css";

import "./demos/ipc";
import { SidebarProvider } from "./components/ui/sidebar";
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SidebarProvider defaultOpen={true}>
      <HashRouter>
        <App />
      </HashRouter>
    </SidebarProvider>
  </React.StrictMode>,
);

postMessage({ payload: "removeLoading" }, "*");
