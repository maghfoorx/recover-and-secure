import { PosPrinter } from "electron-pos-printer-fork/dist";
import * as path from "path";

export async function printReceipt() {
    const options = {
        preview: false,               //  width of content body
        margin: 'auto',            // margin of content body
        copies: 2,                    // Number of copies to print
        printerName: 'ZDesigner GK420d',        // printerName: string, check with webContent.getPrinters()
        timeOutPerLine: 1000,
        pageSize: '80mm'  // page size
    }

    const data = [
        // {
        //     type: 'image',
        //     path: path.join(__dirname, '../assets/printing-logo.jpg'),     // file path
        //     position: 'center',                                  // position of image: 'left' | 'center' | 'right'
        //     width: '50px',                                           // width of image in px; default: auto
        //     height: '50px',                                          // width of image in px; default: 50 or '50px'
        // },
        {
            type: "text",
            value: "JALSA SALANA UK",
            style: { fontSize: "25px", fontWeight: "bold", textAlign: 'center', marginBottom: '5px' }
        },
        {
            type: "text",
            value: "Amanat Department",
            style: { fontSize: "20px", textAlign: 'center', marginBottom: '5px' }
        },
        {
            type: "text",
            value: "51155", //aims number for the future
            style: { fontSize: "45px", fontWeight: "bold", textAlign: 'center' }
        },
        {
            type: "text",
            value: formatDate(new Date()),
            style: { fontSize: "20px", textAlign: 'center' }
        },
        {
            type: "text",
            value: "3 items stored", //total item number in the future
            style: { fontSize: "20px", textAlign: 'center', marginTop: '5px' }
        },
        {
            type: "text",
            value: "For office use:", //total item number in the future
            style: { fontSize: "20px", textAlign: 'left', marginTop: '5px' }
        },
        {
            type: "text",
            value: "C1", //total item number in the future
            style: { fontSize: "30px", textAlign: 'center', fontWeight: 'bold' }
        },
        {
            type: "text",
            value: "Masroor", //total item number in the future
            style: { fontSize: "30px", textAlign: 'center', fontWeight: 'bold' }
        },
        // {
        //     type: 'qrCode',
        //     value: '51155',
        //     height: 70,
        //     width: 70,
        //     style: { margin: '0 auto' }
        // }
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
        console.log(path.join(__dirname, '/receipt-logo.jpg'), 'is the path')
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