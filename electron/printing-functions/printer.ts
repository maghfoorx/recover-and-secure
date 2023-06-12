import { PosPrinter } from "electron-pos-printer";
import * as path from "path";

export async function printReceipt() {
    const options = {
        preview: true,               //  width of content body
        margin: 'auto',            // margin of content body
        copies: 1,                    // Number of copies to print
        printerName: 'XP-80C',        // printerName: string, check with webContent.getPrinters()
        timeOutPerLine: 1000,
        pageSize: '100mm'  // page size
    }

    const data = [
        {
            type: 'image',
            path: path.join(__dirname, '/receipt-logo.jpg'),     // file path
            position: 'center',                                  // position of image: 'left' | 'center' | 'right'
            width: '50px',                                           // width of image in px; default: auto
            height: '50px',                                          // width of image in px; default: 50 or '50px'
        },
        {
            type: "text",
            value: "JALSA SALANA UK",
            style: { fontSize: "20px", fontWeight: "bold" }
        },
        {
            type: "text",
            value: "Amanat Department",
            style: { fontSize: "20px" }
        },
        {
            type: "text",
            value: formatDate(new Date()),
            style: { fontSize: "20px" }
        },
        {
            type: "text",
            value: "Aims: 12345", //aims number for the future
            style: { fontSize: "20px" }
        },
        {
            type: "text",
            value: "3 items stored", //total item number in the future
            style: { fontSize: "20px" }
        }
    ]

    try {
        PosPrinter.print(data, options)
            .then(() => console.log('done'))
            .catch((error) => {
                console.error(error);
            });
    } catch (e) {
        console.log(PosPrinter)
        console.log(e);
    }
}

function formatDate(inputDate: Date) {
    const date = new Date(inputDate);
    const options: any = { 
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }
return date.toLocaleDateString('en-GB', options);
}