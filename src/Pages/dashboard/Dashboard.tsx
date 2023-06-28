import useFetchAmaanatUsers from "@/custom-hooks/useFetchAmaanatUsers"
import useFetchLostPropertyData from "@/custom-hooks/useFetchLostPropertyData"
import "./dashboard.css"
import { useEffect, useState } from "react"
import { getAmaanatItems } from "@/IPC/IPCMessages.amaanat"
import { AmaanatUserItemType } from "@/type-definitions/types.amaanat"

export default function Dashboard() {
    const { amaanatUsers } = useFetchAmaanatUsers()
    const { foundItems, lostItems } = useFetchLostPropertyData()
    const [amaanatItems, setAmaanatItems] = useState<AmaanatUserItemType[]>([])

    async function handleGetAmaanatItems() {
        const response = await getAmaanatItems()
        setAmaanatItems(response)
    };

    useEffect(() => {
        handleGetAmaanatItems();
    }, [])
    return (
        <div className="dashboard">
            <h1>DASHBOARD</h1>
        <p>Reported lost items: <b>{lostItems.length}</b></p>
        <p>Reported lost items found:<b> {lostItems.filter(item => item.ItemFound === 'Yes').length}</b></p>
        <p>Found items:<b> {foundItems.length}</b></p>
        <p>Found items returned:<b> {foundItems.filter(item => item.ReturnDate).length}</b></p>
        <hr/>
        <p>Amanat users served:<b> {amaanatUsers.length}</b></p>
        <p>Total amanat items handled:<b> {amaanatItems.length}</b></p>
        <p>Total amanat items currently stored:<b> {amaanatItems.filter(item => item.Returned === 0).length}</b></p>
        </div>
    )
}