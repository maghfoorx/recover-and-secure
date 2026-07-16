import { app, BrowserWindow } from "electron";
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
  console.log(printReceiptData, "PRINT");
  const printingWindow = new BrowserWindow({
    width: 300, // Around 80mm at 96 DPI
    height: 500,
    ...parsePaperSize("80mm"),
    // Only show the render window in development. In a packaged
    // (production) build the receipt prints from an off-screen window so
    // staff never see a preview pop up.
    show: !app.isPackaged,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const aimsId = String(printReceiptData.aimsID ?? "").trim();
  const itemsNumber = Number(printReceiptData.itemsNumber ?? 0);
  const itemsLabel = `${itemsNumber}`;
  const barcode = aimsId.length > 0 ? generateCode128BarcodeSvg(aimsId) : "";

  const htmlContent = `
          <!doctype html>
          <html lang="en" style="">
              <head>
                  <meta charset="UTF-8" />
                  <title>Print preview</title>
              </head>
              <body style="width: 80mm; margin: 0; padding: 12px 10px 16px; font-family: Arial, Helvetica, sans-serif; color: #111;">
                <main style="width: 100%;">
                  <header style="text-align: center; border-bottom: 1px solid #111; padding-bottom: 8px; margin-bottom: 10px;">
                    <div style="font-size: 20px; font-weight: 800; letter-spacing: 0.4px;">JALSA SALANA UK</div>
                    <div style="font-size: 14px; font-weight: 700; margin-top: 2px;">Amaanat Department</div>
                    <div style="font-size: 11px; margin-top: 4px;">${escapeHtml(formatDate(new Date()))}</div>
                  </header>

                  <section style="text-align: center; margin-bottom: 10px;">
                    ${barcode}
                    <div style="font-size: 11px; margin-top: 4px;">
                      <strong>${escapeHtml(aimsId || "N/A")}</strong>
                    </div>
                  </section>

                  <section style="border-top: 1px dashed #444; border-bottom: 1px dashed #444; padding: 8px 0; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; gap: 8px; font-size: 14px;">
                      <span>Items stored</span>
                      <strong>${escapeHtml(itemsLabel)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; gap: 8px; font-size: 14px; margin-top: 6px;">
                      <span>Office ref</span>
                      <strong>${escapeHtml(printReceiptData.location ?? "N/A")}</strong>
                    </div>
                  </section>

                  <section style="font-size: 12px; line-height: 1.45;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 18px; vertical-align: top; font-weight: 700; padding-bottom: 6px;">1.</td>
                        <td style="padding-bottom: 6px;">If storing valuables such as passports, please inform us.</td>
                      </tr>
                      <tr>
                        <td style="width: 18px; vertical-align: top; font-weight: 700;">2.</td>
                        <td>On Sunday, please collect your items promptly after Huzoor's final address.</td>
                      </tr>
                    </table>
                  </section>
                </main>
              </body>
          </html>

        `;

  // Convert HTML to data URL
  const dataURL = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

  // Load the HTML directly
  printingWindow.loadURL(dataURL);

  printingWindow.webContents.on("did-finish-load", async () => {
    const printersList = await printingWindow.webContents.getPrintersAsync();

    const printerToUse = printersList.find(
      (printer) => printer.name === printReceiptData.printerName,
    );

    if (printerToUse) {
      // Size the printed page to exactly the rendered receipt. Without an
      // explicit pageSize, silent printing falls back to the driver's
      // default page (Letter/A4 height), leaving a large blank area that
      // spills the receipt onto a second label. 1px @ 96dpi = 264.5833µm.
      const MICRONS_PER_PX = 264.5833;
      const contentHeightPx: number =
        await printingWindow.webContents.executeJavaScript(
          "Math.ceil(document.body.scrollHeight)",
        );
      const pageSize = {
        width: 80000, // 80mm paper width, in microns
        height: Math.max(1, Math.ceil(contentHeightPx * MICRONS_PER_PX)),
      };

      printingWindow.webContents.print(
        {
          silent: true, // Print directly to the printer without any dialog
          printBackground: true,
          deviceName: printerToUse.name, // Use the selected printer
          pageSize, // Hug the content so there's no blank space / 2nd page
          margins: {
            marginType: "none",
          },
        },
        (success, failureReason) => {
          if (!success) {
            console.error("Print failed: ", failureReason);
          } else {
            console.log("Print success");
          }
          printingWindow.close(); // Close window after printing
        },
      );
    } else {
      console.error("Printer not found");
    }
  });
}

const CODE_128_PATTERNS = [
  "212222",
  "222122",
  "222221",
  "121223",
  "121322",
  "131222",
  "122213",
  "122312",
  "132212",
  "221213",
  "221312",
  "231212",
  "112232",
  "122132",
  "122231",
  "113222",
  "123122",
  "123221",
  "223211",
  "221132",
  "221231",
  "213212",
  "223112",
  "312131",
  "311222",
  "321122",
  "321221",
  "312212",
  "322112",
  "322211",
  "212123",
  "212321",
  "232121",
  "111323",
  "131123",
  "131321",
  "112313",
  "132113",
  "132311",
  "211313",
  "231113",
  "231311",
  "112133",
  "112331",
  "132131",
  "113123",
  "113321",
  "133121",
  "313121",
  "211331",
  "231131",
  "213113",
  "213311",
  "213131",
  "311123",
  "311321",
  "331121",
  "312113",
  "312311",
  "332111",
  "314111",
  "221411",
  "431111",
  "111224",
  "111422",
  "121124",
  "121421",
  "141122",
  "141221",
  "112214",
  "112412",
  "122114",
  "122411",
  "142112",
  "142211",
  "241211",
  "221114",
  "413111",
  "241112",
  "134111",
  "111242",
  "121142",
  "121241",
  "114212",
  "124112",
  "124211",
  "411212",
  "421112",
  "421211",
  "212141",
  "214121",
  "412121",
  "111143",
  "111341",
  "131141",
  "114113",
  "114311",
  "411113",
  "411311",
  "113141",
  "114131",
  "311141",
  "411131",
  "211412",
  "211214",
  "211232",
  "2331112",
];

function generateCode128BarcodeSvg(value: string) {
  const cleanedValue = value.trim();
  const codes = [104];

  for (const char of cleanedValue) {
    const code = char.charCodeAt(0) - 32;

    if (code < 0 || code > 94) {
      return "";
    }

    codes.push(code);
  }

  const checksum =
    codes.reduce((total, code, index) => {
      if (index === 0) {
        return total + code;
      }

      return total + code * index;
    }, 0) % 103;

  codes.push(checksum, 106);

  const bars: string[] = [];
  let x = 0;

  for (const code of codes) {
    const pattern = CODE_128_PATTERNS[code];

    for (let index = 0; index < pattern.length; index += 1) {
      const width = Number(pattern[index]);

      if (index % 2 === 0) {
        bars.push(`<rect x="${x}" y="0" width="${width}" height="58" />`);
      }

      x += width;
    }
  }

  return `
    <svg
      role="img"
      aria-label="AIMS barcode ${escapeHtml(cleanedValue)}"
      viewBox="0 0 ${x} 58"
      width="260"
      height="58"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      style="display: inline-block; max-width: 100%;"
    >
      ${bars.join("")}
    </svg>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
