import useFetchAmaanatUsers from "@/custom-hooks/useFetchAmaanatUsers"
import useFetchLostPropertyData from "@/custom-hooks/useFetchLostPropertyData"
import "./dashboard.css"

export default function Dashboard() {
    const { amaanatUsers } = useFetchAmaanatUsers()
    const { foundItems, lostItems } = useFetchLostPropertyData()
    return (
        <div className="dashboard">
        <p>Lost Items Reported: <b>{lostItems.length}</b></p>
        <p>Reported Lost Items Found:<b> {lostItems.filter(item => item.ItemFound === 'Yes').length}</b></p>
        <p>Found Items:<b> {foundItems.length}</b></p>
        <p>Returned Items:<b> {foundItems.filter(item => item.ReturnDate).length}</b></p>
        <p>Amanat Users:<b> {amaanatUsers.length}</b></p>
        </div>
    )
}