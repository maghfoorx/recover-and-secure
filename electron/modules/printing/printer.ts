import { BrowserWindow } from "electron";
import { PosPrinter } from "../../../packages/electron-pos-printer/src/main/index";
import {
  PaperSize,
  SizeOptions,
} from "../../../packages/electron-pos-printer/src/main/models";

// export async function printReceipt(printReceiptData: any) {
//   const environment = process.env.NODE_ENV;
//   console.log(environment, "environemtn");
//   const options = {
//     // preview: process.env.NODE_ENV === "development", //  width of content body
//     preview: true, //  width of content body
//     margin: "auto", // margin of content body
//     copies: 2, // Number of copies to print
//     printerName: "ZDesigner GK420d", // printerName: string, check with webContent.getPrinters()
//     timeOutPerLine: 1000,
//     pageSize: "80mm", // page size
//   } as any;

//   const data = [
//     {
//       type: "text",
//       value: "JALSA SALANA UK",
//       style: {
//         fontSize: "24px",
//         fontWeight: "bold",
//         textAlign: "center",
//         marginBottom: "4px",
//       },
//     },
//     {
//       type: "text",
//       value: formatDate(new Date()),
//       style: { fontSize: "12px", textAlign: "center", marginBottom: "8px" },
//     },
//     {
//       type: "text",
//       value: "Amaanat Department",
//       style: {
//         fontSize: "18px",
//         fontWeight: "600",
//         textAlign: "center",
//         marginBottom: "8px",
//       },
//     },
//     {
//       type: "text",
//       value: printReceiptData.aimsID, // AIMS number
//       style: {
//         fontSize: "50px",
//         fontWeight: "bold",
//         textAlign: "center",
//         margin: "12px 0",
//       },
//     },
//     {
//       type: "text",
//       value: `${printReceiptData.itemsNumber} items stored`,
//       style: {
//         fontSize: "18px",
//         textAlign: "center",
//         marginBottom: "10px",
//       },
//     },
//     {
//       type: "text",
//       value: "For Office Use Only",
//       style: {
//         fontSize: "14px",
//         textAlign: "center",
//         fontWeight: "600",
//         textDecoration: "underline",
//         marginBottom: "6px",
//       },
//     },
//     {
//       type: "text",
//       value: `${printReceiptData.location}  |  ${printReceiptData.computerName}`,
//       style: {
//         fontSize: "18px",
//         fontWeight: "bold",
//         textAlign: "center",
//       },
//     },
//   ] as any;

//   try {
//     PosPrinter.print(data, options)
//       .then(() => console.log("done"))
//       .catch((error) => {
//         console.error(error);
//       });
//   } catch (e) {
//     console.log(e);
//   }
// }

export async function printReceipt(printReceiptData: any) {
  console.log(printReceiptData, "PRINT_DATA");
  const printingWindow = new BrowserWindow({
    width: 20,
    height: 20,
    ...parsePaperSize("80mm"),
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const data = [
    {
      type: "text",
      value: "JALSA SALANA UK",
      style: {
        fontSize: "24px",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "4px",
      },
    },
    {
      type: "text",
      value: formatDate(new Date()),
      style: { fontSize: "12px", textAlign: "center", marginBottom: "8px" },
    },
    {
      type: "text",
      value: "Amaanat Department",
      style: {
        fontSize: "18px",
        fontWeight: "600",
        textAlign: "center",
        marginBottom: "8px",
      },
    },
    {
      type: "text",
      value: printReceiptData.aimsID, // AIMS number
      style: {
        fontSize: "50px",
        fontWeight: "bold",
        textAlign: "center",
        margin: "12px 0",
      },
    },
    {
      type: "text",
      value: `${printReceiptData.itemsNumber} items stored`,
      style: {
        fontSize: "18px",
        textAlign: "center",
        marginBottom: "10px",
      },
    },
    {
      type: "text",
      value: "For Office Use Only",
      style: {
        fontSize: "14px",
        textAlign: "center",
        fontWeight: "600",
        textDecoration: "underline",
        marginBottom: "6px",
      },
    },
    {
      type: "text",
      value: `${printReceiptData.location}  |  ${printReceiptData.computerName}`,
      style: {
        fontSize: "18px",
        fontWeight: "bold",
        textAlign: "center",
      },
    },
  ];

  function camelToKebab(str: string) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }

  function renderDataToHTML(data: any) {
    return data
      .map((item: any) => {
        const styleString = Object.entries(item.style || {})
          .map(([key, value]) => `${camelToKebab(key)}: ${value};`)
          .join(" ");

        return `<div style="${styleString}">${item.value}</div>`;
      })
      .join("");
  }

  const renderedHTML = renderDataToHTML(data);

  const htmlContent = `
          <!doctype html>
          <html lang="en" style="font-family: monospace;">
              <head>
                  <meta charset="UTF-8" />
                  <title>Print preview</title>
              </head>
              <body>
                  <section id="main">${renderedHTML}</section>
              </body>
          </html>

        `;

  // Convert HTML to data URL
  const dataURL = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

  // Load the HTML directly
  printingWindow.loadURL(dataURL);

  const printersList = await printingWindow.webContents.getPrintersAsync();

  console.log(printersList, "WEB CONTENTS");
}

function formatDate(inputDate: Date) {
  const date = new Date(inputDate);
  const options = {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  return date.toLocaleDateString("en-GB", options as any);
}

export function parsePaperSize(pageSize?: PaperSize | SizeOptions): {
  width: number;
  height: number;
} {
  let width = 219,
    height = 1200;
  if (typeof pageSize == "string") {
    switch (pageSize) {
      case "44mm":
        width = 166;
        break;
      case "57mm":
        width = 215;
        break;
      case "58mm":
        width = 219;
        break;
      case "76mm":
        width = 287;
        break;
      case "78mm":
        width = 295;
        break;
      case "80mm":
        width = 302;
        break;
    }
  } else if (typeof pageSize == "object") {
    width = pageSize.width;
    height = pageSize.height;
  }

  return {
    width,
    height,
  };
}
