import useFetchAmaanatUsers from "@/custom-hooks/useFetchAmaanatUsers"
import useFetchLostPropertyData from "@/custom-hooks/useFetchLostPropertyData"
import "./dashboard.css"

export default function Dashboard() {
    const { amaanatUsers } = useFetchAmaanatUsers()
    const { foundItems, lostItems } = useFetchLostPropertyData()
    return (
        <div className="dashboard">
        <h1>Lost Items Reported: {lostItems.length}</h1>
        <h1>Reported Lost Items Found: {lostItems.filter(item => item.ItemFound === 'Yes').length}</h1>
        <h1>Found Items: {foundItems.length}</h1>
        <h1>Returned Items: {foundItems.filter(item => item.ReturnDate).length}</h1>
        <h1>Amanat Users: {amaanatUsers.length}</h1>
        </div>
    )
}