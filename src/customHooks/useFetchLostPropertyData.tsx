import { LostItemType } from "@/data/Interfaces";
import { getFoundItemsReported, getLostItemsReported } from "@/data/IPC/IPCMessages";
import { useEffect, useState } from "react";

interface UseFetchLostItemsType {
    lostItems: LostItemType[];
    handleGetLostItems: () => Promise<void>
    foundItems: any[]
}

export default function useFetchLostPropertyData(): UseFetchLostItemsType {
    const [lostItems, setLostItems] = useState<LostItemType[]>([]);
    const [foundItems, setFoundItems] = useState<any[]>([])

    async function handleGetLostItems() {
        const response = await getLostItemsReported()
        setLostItems(response);
    }

    async function handleGetFoundItems() {
        const response = await getFoundItemsReported();
        setFoundItems(response);
    }

    useEffect(() => {
        handleGetLostItems();
        handleGetFoundItems();
    }, []);

    return { lostItems, handleGetLostItems, foundItems };

}