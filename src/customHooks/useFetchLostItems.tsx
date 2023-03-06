import { LostItemType } from "@/data/Interfaces";
import { getLostItemsReported } from "@/data/IPC/IPCMessages";
import { useEffect, useState } from "react";

interface UseFetchLostItemsType {
    lostItems: LostItemType[];
    handleGetLostItems: () => Promise<void>
}

export default function useFetchLostItems(): UseFetchLostItemsType {
    const [lostItems, setLostItems] = useState<LostItemType[]>([]);

    async function handleGetLostItems() {
        const response = await getLostItemsReported()
        setLostItems(response);
    }

    useEffect(() => {
        handleGetLostItems();
    }, []);

    return { lostItems, handleGetLostItems };

}