import FoundItems from "@/components/FoundItems";
import LostItems from "@/components/LostItems";
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LostPropertPage.css"

type ShowTableType = "LostItems" | "FoundItems"
export default function LostPropertyPage(): JSX.Element {

    const [showTable, setShowTable] = useState<ShowTableType>('LostItems')
    return (
        <div>
            <Link to="/lost-item-form">Report Lost Item</Link>
            <br />
            <Link to="/found-item-form">Submit Found Item</Link>
            <div className="show-table-buttons">
                <button onClick={() => setShowTable("LostItems")} className={showTable === "LostItems" ? "live" : ""}>Lost Items</button>
                <button onClick={() => setShowTable("FoundItems")} className={showTable === "FoundItems" ? "live" : ""}>Found Items</button>
            </div>
            {showTable === "LostItems" && <LostItems />}
            {showTable === "FoundItems" && <FoundItems />}
        </div>
    )
}