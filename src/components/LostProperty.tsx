import { getLostItemsReported } from "@/data/IPC/IPCMessages"
import { useEffect, useState } from "react"
export default function LostProperty(): JSX.Element {

    const [lostItems, setLostItems] = useState<any>([])

    useEffect(() => {
        handleGetLostItems();
    }, [])

    async function handleGetLostItems() {
        const response = await getLostItemsReported()
        setLostItems(response);
    }
    console.log(lostItems);
    return (
        <>
            <h1>This is Lost Property Page</h1>
        </>
    )
}