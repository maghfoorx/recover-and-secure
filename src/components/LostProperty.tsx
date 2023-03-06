import { LostItemType } from "@/data/Interfaces";
import { getLostItemsReported } from "@/data/IPC/IPCMessages"
import { useEffect, useState } from "react"
import DataGrid from "react-data-grid";
import 'react-data-grid/lib/styles.css';

export default function LostProperty(): JSX.Element {

    const [lostItems, setLostItems] = useState<LostItemType[]>([])

    useEffect(() => {
        handleGetLostItems();
    }, []);

    async function handleGetLostItems() {
        const response = await getLostItemsReported()
        setLostItems(response);
    }
    console.log(lostItems);

    //creating columns
    const columns = [
        { key: "ID", name: "ID", width: 10 },
        { key: "ItemName", name: "Name", width: 20 },
        { key: "Details", name: "Details" },
        { key: "LostArea", name: "Lost Area", width: 100 },
        { key: "Date", name: "Date Lost", width: 90 },
        { key: "ItemFound", name: "Found", width: 90 }
    ]

    return (
        <>
            <h1>This is Lost Property Page</h1>
            <DataGrid columns={columns} rows={lostItems} rowHeight={40} />
        </>
    )
}