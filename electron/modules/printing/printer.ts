import { PosPrinter } from "../../../packages/electron-pos-printer/src/main/index";

export async function printReceipt(printReceiptData: any) {
  const environment = process.env.NODE_ENV;
  console.log(environment, "environemtn");
  const options = {
    preview: process.env.NODE_ENV === "development", //  width of content body
    margin: "auto", // margin of content body
    copies: 2, // Number of copies to print
    printerName: "ZDesigner GK420d", // printerName: string, check with webContent.getPrinters()
    timeOutPerLine: 1000,
    pageSize: "80mm", // page size
  } as any;

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
  ] as any;

  try {
    PosPrinter.print(data, options)
      .then(() => console.log("done"))
      .catch((error) => {
        console.error(error);
      });
  } catch (e) {
    console.log(e);
  }
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
