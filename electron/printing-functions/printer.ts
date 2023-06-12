import { PosPrinter } from "electron-pos-printer"
export async function printReceipt() {
    const options = {
        preview: true,               //  width of content body
        margin: 'auto',            // margin of content body
        copies: 1,                    // Number of copies to print
        printerName: 'XP-80C',        // printerName: string, check with webContent.getPrinters()
        timeOutPerLine: 1000,
        pageSize: '80mm'  // page size
    }

    const data = [
        {
            type: 'qrCode',
            value: 'https://github.com/Hubertformin/electron-pos-printer',
            height: 55,
            width: 55,
            position: 'right'
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