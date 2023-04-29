import FoundItems from "@/components/FoundItems";
import LostItems from "@/components/LostItems";
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LostPropertPage.css"

type ShowTableType = "LostItems" | "FoundItems"
export default function LostPropertyPage(): JSX.Element {

    const [showTable, setShowTable] = useState<ShowTableType>('FoundItems')
    return (
        <div>
            <div className="form-links">
            <Link to="/lost-item-form" className="form-links__lost-item">Report Lost Item</Link>
            <Link to="/found-item-form" className="form-links__found-item">Submit Found Item</Link>
            </div>
            <div className="show-table-buttons">
                <button onClick={() => setShowTable("LostItems")} className={showTable === "LostItems" ? "live" : ""}>Lost Items</button>
                <button onClick={() => setShowTable("FoundItems")} className={showTable === "FoundItems" ? "live" : ""}>Found Items</button>
            </div>
            {showTable === "LostItems" && <LostItems />}
            {showTable === "FoundItems" && <FoundItems />}
        </div>
    )
}