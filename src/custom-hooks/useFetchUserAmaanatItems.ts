import { getAmaanatUser, getUserAmaanatItems } from "@/IPC/IPCMessages.amaanat";
import { AmaanatUserItemType, AmaanatUserType } from "@/type-definitions/types.amaanat";
import { useEffect, useState } from "react";

type UseFetchAmaanatItemsType = {
    ID: string;
}

export default function useFetchUserAmaanatItems({ ID }: UseFetchAmaanatItemsType) {
    const [amaanatItems, setAmaanatItems] = useState<AmaanatUserItemType[]>([]);
    const [amaanatUser, setAmaanatUser] = useState<AmaanatUserType | null>(null)

    useEffect(() => {
        handleGetUserAmaanatItems(ID);
    }, [])

    async function handleGetUserAmaanatItems(ID: string) {
        const response = await getUserAmaanatItems(ID);
        setAmaanatItems(response)
    }

    async function handleGetAmaanatUser(ID: string) {
        const response = await getAmaanatUser(ID);
        setAmaanatUser(response[0])
    }

    return { amaanatItems, handleGetUserAmaanatItems, amaanatUser, handleGetAmaanatUser }
}