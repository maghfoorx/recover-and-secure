import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";
import "./index.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

import "./demos/ipc";
import { SidebarProvider } from "./components/ui/sidebar";
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

try {
  const convex = new ConvexReactClient(
    import.meta.env.VITE_CONVEX_URL as string,
  );

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ConvexProvider client={convex}>
        <SidebarProvider defaultOpen={true}>
          <HashRouter>
            <App />
          </HashRouter>
        </SidebarProvider>
      </ConvexProvider>
    </React.StrictMode>,
  );
} catch (err) {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <div className="flex flex-col justify-center items-center h-[600px] w-full">
      <div className="p-6 rounded-md bg-red-300">
        There was an error connecting to the server. The URL was incorrect.
      </div>
    </div>,
  );
}

postMessage({ payload: "removeLoading" }, "*");
