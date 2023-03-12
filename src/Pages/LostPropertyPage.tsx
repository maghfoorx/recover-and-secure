import FoundItems from "@/components/FoundItems";
import LostItems from "@/components/LostItems";
import { Link } from "react-router-dom";

export default function LostPropertyPage(): JSX.Element {
    return (
        <div>
            <Link to="/lost-item-form">Report Lost Item</Link>
            <br />
            <Link to="/found-item-form">Submit Found Item</Link>
            <LostItems />
            <FoundItems />
        </div>
    )
}