import { getUserAmaanatItems } from "@/IPC/IPCMessages.amaanat";
import { AmaanatUserItemType } from "@/type-definitions/types.amaanat";
import { useEffect, useState } from "react";

type UseFetchAmaanatItemsType = {
    ID: string;
}

export default function useFetchUserAmaanatItems({ ID }: UseFetchAmaanatItemsType) {
    const [amaanatItems, setAmaanatItems] = useState<AmaanatUserItemType[]>([]);

    useEffect(() => {
        handleGetUserAmaanatItems(ID);
    }, [])

    async function handleGetUserAmaanatItems(ID: string) {
        const response = await getUserAmaanatItems(ID);
        setAmaanatItems(response)
    }

    return { amaanatItems, handleGetUserAmaanatItems }
}